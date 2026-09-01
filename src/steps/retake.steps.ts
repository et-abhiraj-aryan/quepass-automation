import { When, Then } from '../support/fixtures';

/**
 * Attempt-limit test: a face video is injected only to reach the capture attempts;
 * the test clicks Retake through the allowed attempts and verifies the journey
 * gets blocked (no endless retries). It does not retry to pass liveness. The clip
 * is a real face (kept out of the repo) because the review/Retake screen only
 * appears once a face is captured.
 */
const RETAKE_CLIP = 'fixtures/media/new_normal_video.mp4';

When('I retake the face capture until the journey is blocked', async ({ platformPage }) => {
  await platformPage.retakeUntilJourneyBlocked(RETAKE_CLIP);
});

Then('the journey is blocked', async ({ platformPage }) => {
  await platformPage.assertJourneyBlocked();
});
