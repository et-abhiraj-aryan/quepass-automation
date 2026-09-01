import * as fs from 'fs';
import * as path from 'path';
import { chromium, FullConfig } from '@playwright/test';
import { SettingsPage } from '../pages/SettingsPage';
import { env } from '../config/env';

/**
 * Runs ONCE before the whole suite (unaffected by --grep). Enters the operator
 * configuration and saves the browser session — the app keeps its entire config
 * (credentials, base URL, channel, liveness) in localStorage, so every test then
 * reuses this state and starts on the dashboard already configured. This removes
 * the per-test Update Settings + SDK-credential refill.
 */
export const STATE_FILE = 'playwright/.auth/state.json';

export default async function globalSetup(_config: FullConfig): Promise<void> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const settings = new SettingsPage(page);

  await page.goto(env.baseUrl);
  await settings.enterOperatorConfiguration();
  await settings.save();
  await page
    .getByRole('button', { name: /Start Registration/ })
    .first()
    .waitFor({ state: 'visible', timeout: 60000 });

  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  await page.context().storageState({ path: STATE_FILE });
  await browser.close();
}
