import * as fs from 'fs';
import * as path from 'path';
import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Api, ApiGroups } from '../config/apiEndpoints';

/**
 * The platform registration + identity verification flow: register a user, scan
 * their passport (AnalysePassport), capture their face (liveness + verify +
 * search) and submit for sign-up.
 *
 * The passport step needs a document image in the camera, not a face, so it
 * pushes a still image into getUserMedia (see src/support/fixtures.ts) and
 * clears it again before the face capture falls back to the .y4m webcam.
 */
export class PlatformRegistrationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private get startRegistrationButton() {
    return this.page.getByRole('button', { name: 'Start Registration' }).first();
  }

  private get startVerificationButton() {
    return this.page.getByRole('button', { name: 'Start Verification' });
  }

  private get openCameraButton() {
    return this.page.getByRole('button', { name: 'Open Camera' });
  }

  private get startFaceCaptureButton() {
    return this.page.getByRole('button', { name: 'Start Face Capture' });
  }

  private get continueButton() {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  private get submitVerificationButton() {
    return this.page.getByRole('button', { name: 'Submit Verification' });
  }

  async startRegistration(): Promise<void> {
    await this.startRegistrationButton.click();
  }

  async startVerification(): Promise<void> {
    await this.startVerificationButton.click();
  }

  /** Selects a document type, e.g. "Passport International". */
  async chooseDocumentType(name: string): Promise<void> {
    await this.page.getByRole('button', { name }).click();
  }

  /**
   * Pushes the passport image into the camera, opens it, and waits for the
   * passport to be analysed.
   */
  async scanPassport(imagePath: string): Promise<void> {
    const absolute = path.resolve(imagePath);
    const base64 = fs.readFileSync(absolute).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    await this.page.evaluate(async (url) => {
      const setImage = (window as unknown as {
        __setCameraImage?: (u: string) => Promise<boolean>;
      }).__setCameraImage;
      if (!setImage) throw new Error('camera image injection is not available (fake camera off?)');
      await setImage(url);
    }, dataUrl);

    await this.clickAndWaitForApis(this.openCameraButton, [Api.analysePassport]);
  }

  /**
   * Switches the camera from the passport image to the face video (same stream,
   * different content, so it works even if the app reuses the passport stream),
   * then captures the face and waits for liveness + verify + search.
   */
  async captureFace(videoPath: string): Promise<void> {
    const absolute = path.resolve(videoPath);
    const base64 = fs.readFileSync(absolute).toString('base64');
    const dataUrl = `data:video/mp4;base64,${base64}`;

    await this.page.evaluate(async (url) => {
      const setVideo = (window as unknown as {
        __setCameraVideo?: (u: string) => Promise<boolean>;
      }).__setCameraVideo;
      if (!setVideo) throw new Error('camera video injection is not available (fake camera off?)');
      await setVideo(url);
    }, dataUrl);

    await this.clickAndWaitForApis(this.startFaceCaptureButton, ApiGroups.platformFaceVerify);
  }

  /**
   * Captures the face from a STILL image (not a video). Used by the liveness
   * robustness experiments that vary a single AI-generated frame. Drawn at a
   * face-sized zoom (fit ~1.0) rather than the passport zoom.
   */
  async captureFaceFromImage(imagePath: string): Promise<void> {
    const absolute = path.resolve(imagePath);
    const base64 = fs.readFileSync(absolute).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    await this.page.evaluate(async (url) => {
      const setImage = (window as unknown as {
        __setCameraImage?: (u: string, fit?: number) => Promise<boolean>;
      }).__setCameraImage;
      if (!setImage) throw new Error('camera image injection is not available (fake camera off?)');
      await setImage(url, 1.0);
    }, dataUrl);

    await this.clickAndWaitForApis(this.startFaceCaptureButton, ApiGroups.platformFaceVerify);
  }

  /**
   * ANTI-SPOOF REGRESSION: inject a pre-recorded video as the camera and assert
   * liveness REJECTS it — i.e. the flow must NOT proceed to VerifyAndSearch. This
   * passes when the anti-spoof defense is working and fails loudly if an injected
   * stream ever gets verified. `watchMs` is how long we watch for a (bad) success.
   */
  async expectInjectedFaceRejected(videoPath: string, watchMs = 30000): Promise<void> {
    const absolute = path.resolve(videoPath);
    const base64 = fs.readFileSync(absolute).toString('base64');
    const dataUrl = `data:video/mp4;base64,${base64}`;

    await this.page.evaluate(async (url) => {
      const setVideo = (window as unknown as {
        __setCameraVideo?: (u: string) => Promise<boolean>;
      }).__setCameraVideo;
      if (!setVideo) throw new Error('camera video injection is not available (fake camera off?)');
      await setVideo(url);
    }, dataUrl);

    // A verified spoof would fire VerifyAndSearch (the post-liveness step). We must
    // NOT see it: resolve false on timeout (rejected = good), true if it succeeds.
    const gotVerified = this.page
      .waitForResponse(
        (r) => r.url().includes('VerifyAndSearch') && r.status() === 200,
        { timeout: watchMs }
      )
      .then(() => true)
      .catch(() => false);

    await this.startFaceCaptureButton.click();

    if (await gotVerified) {
      throw new Error(
        'ANTI-SPOOF REGRESSION FAILED: an injected pre-recorded video passed liveness ' +
          '(VerifyAndSearch returned 200). The anti-spoof layer no longer rejects injected streams.'
      );
    }
  }

  private get retakeButton() {
    return this.page.getByRole('button', { name: 'Retake' });
  }

  /**
   * Attempt-limit test: injects a clip that fails liveness, then clicks Retake for
   * each allowed attempt until Retake is no longer offered — i.e. the journey is
   * blocked. Verifies the app enforces a finite number of attempts rather than
   * allowing endless retries; it does not try to pass liveness.
   */
  async retakeUntilJourneyBlocked(videoPath: string): Promise<void> {
    const absolute = path.resolve(videoPath);
    const dataUrl = `data:video/mp4;base64,${fs.readFileSync(absolute).toString('base64')}`;
    await this.page.evaluate(async (url) => {
      const setVideo = (window as unknown as {
        __setCameraVideo?: (u: string) => Promise<boolean>;
      }).__setCameraVideo;
      if (!setVideo) throw new Error('camera video injection is not available (fake camera off?)');
      await setVideo(url);
    }, dataUrl);

    await this.startFaceCaptureButton.click();

    // Click Retake for each attempt until it stops being offered (blocked).
    // Capped at 5 for safety; the journey should block well before that.
    for (let i = 0; i < 5; i++) {
      const canRetake = await this.retakeButton
        .waitFor({ state: 'visible', timeout: 60000 })
        .then(() => true)
        .catch(() => false);
      if (!canRetake) break;
      await this.retakeButton.click();
      if (await this.startFaceCaptureButton.isVisible().catch(() => false)) {
        await this.startFaceCaptureButton.click();
      }
    }
  }

  /**
   * Asserts the journey is blocked after the attempts are exhausted: the capture
   * flow is gone (no Retake, no Start Face Capture) and the app has returned to
   * the home launcher.
   */
  async assertJourneyBlocked(): Promise<void> {
    await expect(this.retakeButton).toBeHidden({ timeout: 20000 });
    await expect(this.startFaceCaptureButton).toBeHidden({ timeout: 20000 });
    await expect(this.startRegistrationButton).toBeVisible({ timeout: 20000 });
  }

  /** Clicks the "Continue" button between steps (no network wait). */
  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  /** Submits the verification and waits for the sign-up to complete. */
  async submitVerification(): Promise<void> {
    await this.clickAndWaitForApis(this.submitVerificationButton, [Api.signup]);
  }

  /** Dismisses the result screen (returns to the start). */
  async finish(): Promise<void> {
    await this.page.getByRole('button').first().click();
  }
}
