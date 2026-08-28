import { When, Then } from '../support/fixtures';

// --- Dashboard modules ------------------------------------------------------

When('I start the authentication module', async ({ dashboardPage }) => {
  await dashboardPage.startAuthentication();
});

When('I start the transaction module', async ({ dashboardPage }) => {
  await dashboardPage.startTransaction();
});

When('I start the customer search module', async ({ dashboardPage }) => {
  await dashboardPage.startCustomerSearch();
});

When('I start the face capture module', async ({ dashboardPage }) => {
  await dashboardPage.startFaceCaptureModule();
});

When('I start the express verification module', async ({ dashboardPage }) => {
  await dashboardPage.startExpressVerification();
});

When('I start a new event registration', async ({ dashboardPage }) => {
  await dashboardPage.startRegistration();
});

// --- Event modules ----------------------------------------------------------

When('I open the event face capture module', async ({ dashboardPage }) => {
  await dashboardPage.openEventFaceCapture();
});

When('I open the event face check-in module', async ({ dashboardPage }) => {
  await dashboardPage.openEventFaceCheckIn();
});

When('I open the event face search module', async ({ dashboardPage }) => {
  await dashboardPage.openEventFaceSearch();
});

When('I open the event QR check-in module', async ({ dashboardPage }) => {
  await dashboardPage.openEventQrCheckIn();
});

When('I open the event kiosk QR check-in module', async ({ dashboardPage }) => {
  await dashboardPage.openEventKioskQrCheckIn();
});

When('I open the event kiosk face check-in module', async ({ dashboardPage }) => {
  await dashboardPage.openEventKioskFaceCheckIn();
});

// --- Kiosk face search (click triggers search immediately) ------------------

Then('a customer is found via the kiosk face search', async ({ dashboardPage }) => {
  await dashboardPage.openKioskFaceSearch();
});
