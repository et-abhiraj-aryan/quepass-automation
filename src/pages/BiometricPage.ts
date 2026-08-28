import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Biometric capture / verification actions shared across flows: starting a face
 * capture, confirming countdown continues, express "Continue", the verification
 * ID entry used by login/transaction, and downloading a generated pass.
 *
 * Each action accepts the API endpoints it is expected to trigger so callers
 * (step definitions) declare the flow's network contract while the UI mechanics
 * stay here.
 */
export class BiometricPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private get verificationIdInput() {
    // Placeholder-based textbox on the login / transaction verification screen.
    return this.page.getByRole('textbox', { name: '-0000-00000000-0' });
  }

  private get startFaceCaptureButton() {
    return this.page.getByRole('button', { name: 'Start Face Capture' });
  }

  private get captureButton() {
    return this.page.getByRole('button', { name: 'Capture' });
  }

  private get continueToFaceCaptureButton() {
    return this.page.getByRole('button', { name: 'Continue to Face Capture' });
  }

  private get continueToFaceVerificationButton() {
    return this.page.getByRole('button', { name: 'Continue to Face Verification' });
  }

  private get expressContinueButton() {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  private get countdownContinueButton() {
    // Label counts down, e.g. "Continue (8s)" / "Continue (5s)".
    return this.page.getByRole('button', { name: /Continue \(\d+s\)/ });
  }

  private get downloadPassButton() {
    return this.page.getByRole('button', { name: 'Download Pass' });
  }

  /** Enters the ID on the login / transaction verification screen. */
  async enterVerificationId(value: string): Promise<void> {
    await this.verificationIdInput.fill(value);
  }

  /** Advances the login / transaction flow to the face verification step. */
  async continueToFaceVerification(): Promise<void> {
    await this.continueToFaceVerificationButton.click();
  }

  /** Starts a face capture, waiting for the supplied endpoints. */
  async startFaceCapture(waitFor: readonly string[]): Promise<void> {
    await this.clickAndWaitForApis(this.startFaceCaptureButton, waitFor);
  }

  /** Clicks the "Capture" button, waiting for the supplied endpoints. */
  async capture(waitFor: readonly string[]): Promise<void> {
    await this.clickAndWaitForApis(this.captureButton, waitFor);
  }

  /** Clicks "Continue to Face Capture", waiting for the supplied endpoints. */
  async continueToFaceCapture(waitFor: readonly string[]): Promise<void> {
    await this.clickAndWaitForApis(this.continueToFaceCaptureButton, waitFor);
  }

  /** Clicks the plain "Continue" (express) button, waiting for the endpoints. */
  async continueExpress(waitFor: readonly string[]): Promise<void> {
    await this.clickAndWaitForApis(this.expressContinueButton, waitFor);
  }

  /** Clicks the countdown "Continue (Ns)" button, waiting for the endpoints. */
  async continueCountdown(waitFor: readonly string[]): Promise<void> {
    await this.clickAndWaitForApis(this.countdownContinueButton, waitFor);
  }

  /** Downloads the generated pass and saves it to `targetDir`. */
  async downloadPass(targetDir: string): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadPassButton.click();
    const download = await downloadPromise;
    const path = `${targetDir}/${download.suggestedFilename()}`;
    await download.saveAs(path);
    return path;
  }
}
