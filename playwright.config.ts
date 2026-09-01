import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { env } from './src/config/env';

/**
 * Generates Playwright test files from the Gherkin features and their step
 * definitions. `npm test` runs `bddgen` first, then the Playwright runner.
 */
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['src/steps/**/*.ts', 'src/support/**/*.ts'],
  outputDir: '.features-gen',
});

/**
 * When FAKE_CAMERA_VIDEO is configured, launch Chromium with a fake webcam fed
 * from a video file so face-capture flows run unattended (locally and in CI).
 * The permission prompt is auto-accepted by --use-fake-ui-for-media-stream.
 */
const fakeCameraArgs = env.fakeCameraVideo
  ? [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-video-capture=${env.fakeCameraVideo}`,
    ]
  : [];

/**
 * Saved session (localStorage config) produced once by the `setup` project.
 * Every test reuses it and starts already-configured — no per-test Update Settings.
 */
const STORAGE_STATE = 'playwright/.auth/state.json';

export default defineConfig({
  testDir,
  globalSetup: './src/setup/global-setup.ts',
  timeout: env.timeouts.test,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL: env.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['camera'],
        launchOptions: { args: fakeCameraArgs },
        storageState: STORAGE_STATE,
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
    },
  ],
});
