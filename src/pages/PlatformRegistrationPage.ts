import * as fs from 'fs';
import * as path from 'path';
import { Page } from '@playwright/test';
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
