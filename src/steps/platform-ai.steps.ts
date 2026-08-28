import { When } from '../support/fixtures';

/**
 * AI-generated face video used ONLY by the liveness spoof test. Every other
 * face-scan flow keeps using the real face media; this asset is referenced
 * nowhere else.
 */
const AI_FACE_VIDEO = 'fixtures/media/ai_smile.mp4';

When("I capture the user's face with the AI-generated video", async ({ platformPage }) => {
  await platformPage.captureFace(AI_FACE_VIDEO);
});
