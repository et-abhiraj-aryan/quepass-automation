import { Then } from '../support/fixtures';
import { ApiGroups } from '../config/apiEndpoints';

// --- Event check-in outcomes ------------------------------------------------

Then('the attendee is checked in by biometric face', async ({ biometricPage }) => {
  await biometricPage.continueToFaceCapture(ApiGroups.biometricCheckIn);
});

Then(
  'the attendee is checked in by biometric face after the countdown',
  async ({ biometricPage }) => {
    await biometricPage.continueCountdown(ApiGroups.biometricCheckIn);
  }
);

// QR check-in steps live in qr-checkin.steps.ts (register → scan the pass QR).
