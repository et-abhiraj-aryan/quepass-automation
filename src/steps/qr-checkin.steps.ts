import { When, Then } from '../support/fixtures';

/**
 * End-to-end QR check-in: an attendee is registered (which produces a pass with a
 * QR), the pass is downloaded, and its QR is presented to the QR check-in camera.
 */

When('I download the registered pass', async ({ biometricPage, passStore }) => {
  passStore.path = await biometricPage.downloadPass('downloads');
});

When('I return to the dashboard', async ({ settingsPage }) => {
  await settingsPage.open();
});

Then(
  'the attendee is checked in by scanning the registered pass for event {string}',
  async ({ eventPage, passStore }, eventName: string) => {
    if (!passStore.path) {
      throw new Error('no downloaded pass in this scenario — register and download it first');
    }
    await eventPage.scanRegisteredPassAndCheckIn(passStore.path, eventName);
  }
);
