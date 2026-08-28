import { Given } from '../support/fixtures';

/**
 * Configures the workstation the way every recorded flow did: open the app,
 * open the settings dialog, enter the operator configuration and save.
 *
 * "configured" waits for the config to reload (GetConfig); the event console
 * variant saves without waiting, matching the original event flows.
 */

Given('the QuePass workstation is configured', async ({ settingsPage }) => {
  await settingsPage.open();
  await settingsPage.enterOperatorConfiguration();
  await settingsPage.saveAndWaitForConfig();
});

Given('the QuePass workstation is configured with liveness disabled', async ({ settingsPage }) => {
  await settingsPage.open();
  await settingsPage.enterOperatorConfiguration();
  await settingsPage.disableLiveness();
  await settingsPage.saveAndWaitForConfig();
});

Given('the QuePass workstation is ready for event operations', async ({ settingsPage }) => {
  await settingsPage.open();
  await settingsPage.enterOperatorConfiguration();
  await settingsPage.save();
});
