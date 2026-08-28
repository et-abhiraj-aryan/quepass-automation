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

Then(
  'the attendee is checked in by QR when I select the event {string}',
  async ({ eventPage }, eventName: string) => {
    await eventPage.selectEventAndCheckInByQr(eventName);
  }
);

Then('the attendee is checked in by QR after the countdown', async ({ biometricPage }) => {
  await biometricPage.continueCountdown(ApiGroups.qrCheckIn);
});
