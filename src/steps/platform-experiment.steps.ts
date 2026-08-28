import { When } from '../support/fixtures';

/**
 * Feeds a face VIDEO (the AI smile clip, degraded per experiment) for the
 * liveness-robustness tests. The platform flow has an active "Smile" liveness
 * challenge, so a still image cannot complete it — the variable under test is
 * applied to the moving clip. Path is relative to the project root.
 */
When("I capture the user's face from the video {string}", async ({ platformPage }, videoPath: string) => {
  await platformPage.captureFace(videoPath);
});
