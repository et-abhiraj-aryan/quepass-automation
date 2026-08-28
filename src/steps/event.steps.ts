import { When, Then } from '../support/fixtures';
import { ApiGroups } from '../config/apiEndpoints';

// --- Event / document form entry --------------------------------------------

When('I select the event {string}', async ({ eventPage }, eventName: string) => {
  await eventPage.selectEvent(eventName);
});

When('I select the ticket type {string}', async ({ eventPage }, ticketType: string) => {
  await eventPage.selectTicketType(ticketType);
});

When('I select the document type {string}', async ({ eventPage }, documentType: string) => {
  await eventPage.selectDocumentType(documentType);
});

When('I enter the document number {string}', async ({ eventPage }, documentNumber: string) => {
  await eventPage.enterDocumentNumber(documentNumber);
});

// --- Registration -----------------------------------------------------------

When('I continue to face capture for registration', async ({ biometricPage }) => {
  await biometricPage.continueToFaceCapture(ApiGroups.registration);
});

Then('the attendee pass is downloaded', async ({ biometricPage }) => {
  await biometricPage.downloadPass('downloads');
});

// --- Event face capture / search --------------------------------------------

Then('the attendee face is captured and searched', async ({ biometricPage }) => {
  await biometricPage.capture(ApiGroups.search);
});

Then('the attendee is found by event face search', async ({ biometricPage }) => {
  await biometricPage.startFaceCapture(ApiGroups.faceSearch);
});
