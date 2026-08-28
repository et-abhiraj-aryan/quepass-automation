import { When, Then } from '../support/fixtures';
import { ApiGroups } from '../config/apiEndpoints';

// --- Login / transaction verification ---------------------------------------

When('I enter the verification ID {string}', async ({ biometricPage }, id: string) => {
  await biometricPage.enterVerificationId(id);
});

When('I continue to face verification', async ({ biometricPage }) => {
  await biometricPage.continueToFaceVerification();
});

Then('the registrant is verified by face login', async ({ biometricPage }) => {
  await biometricPage.startFaceCapture(ApiGroups.faceLogin);
});

Then('the registrant is verified for the transaction', async ({ biometricPage }) => {
  await biometricPage.startFaceCapture(ApiGroups.faceTransaction);
});

// --- Express verification ----------------------------------------------------

Then('the registrant is expressly verified', async ({ biometricPage }) => {
  await biometricPage.continueExpress(ApiGroups.expressVerification);
});

// --- Dashboard face search / capture ----------------------------------------

Then('the customer is found by face search', async ({ biometricPage }) => {
  await biometricPage.startFaceCapture(ApiGroups.faceSearch);
});

Then('the captured face is searched', async ({ biometricPage }) => {
  await biometricPage.capture(ApiGroups.search);
});
