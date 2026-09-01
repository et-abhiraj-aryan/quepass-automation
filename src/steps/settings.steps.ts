import { Given } from '../support/fixtures';

/**
 * The workstation is configured once by the `setup` project and reused via saved
 * session (storageState), so these steps just open the app — it loads straight to
 * the dashboard, already configured. Flows that need liveness off flip the stored
 * flags and reload (no settings dialog, no credential refill).
 */

Given('the QuePass workstation is configured', async ({ settingsPage }) => {
  await settingsPage.open();
});

Given('the QuePass workstation is configured with liveness disabled', async ({ settingsPage }) => {
  await settingsPage.open();
  await settingsPage.setLiveness(false, false);
});

Given('the QuePass workstation is ready for event operations', async ({ settingsPage }) => {
  await settingsPage.open();
});
