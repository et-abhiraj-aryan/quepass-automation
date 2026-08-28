import { Given, When, Then } from '../support/fixtures';

/** Media pushed into the camera during the passport-scan and face-capture steps. */
const PASSPORT_IMAGE = 'fixtures/media/passport-front.jpeg';
const FACE_VIDEO = 'fixtures/media/source-face.mp4';

Given('the QuePass workstation is configured for platform verification', async ({ settingsPage }) => {
  await settingsPage.open();
  await settingsPage.enterOperatorConfiguration();
  await settingsPage.confirmDevelopmentEnvironmentIfPresent();
  await settingsPage.save();
});

When('I start a platform registration', async ({ platformPage }) => {
  await platformPage.startRegistration();
});

When('I start identity verification', async ({ platformPage }) => {
  await platformPage.startVerification();
});

When('I choose the {string} document type', async ({ platformPage }, documentType: string) => {
  await platformPage.chooseDocumentType(documentType);
});

When('I scan the passport with the camera', async ({ platformPage }) => {
  await platformPage.scanPassport(PASSPORT_IMAGE);
});

When('I continue past the passport result', async ({ platformPage }) => {
  await platformPage.continue();
});

When("I capture the user's face", async ({ platformPage }) => {
  await platformPage.captureFace(FACE_VIDEO);
});

When('I continue past the face result', async ({ platformPage }) => {
  await platformPage.continue();
});

When('I submit the verification', async ({ platformPage }) => {
  await platformPage.submitVerification();
});

Then('the user is signed up on the platform', async ({ platformPage }) => {
  await platformPage.finish();
});
