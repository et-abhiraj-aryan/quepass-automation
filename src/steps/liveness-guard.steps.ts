import { Then } from '../support/fixtures';

/**
 * Anti-spoof regression step: asserts an injected pre-recorded video is rejected
 * by liveness (does not reach VerifyAndSearch). Passes when the defense holds.
 */
Then(
  'an injected face video {string} must be rejected by liveness',
  async ({ platformPage }, videoPath: string) => {
    await platformPage.expectInjectedFaceRejected(videoPath);
  }
);
