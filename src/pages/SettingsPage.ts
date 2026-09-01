import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { env } from '../config/env';
import { Api } from '../config/apiEndpoints';

/**
 * The workstation "Update Settings" dialog. Every flow starts here to point the
 * app at an environment, enter operator credentials and (optionally) toggle
 * liveness detection. Previously this block was copy-pasted into all 13 specs.
 */
export class SettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private get updateSettingsButton() {
    return this.page.getByRole('button', { name: 'Update Settings' });
  }

  private get baseUrlInput() {
    return this.page.getByRole('textbox', { name: 'Base URL' });
  }

  private get emailInput() {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  private get passwordInput() {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  private get channelInput() {
    return this.page.getByRole('textbox', { name: 'Channel' });
  }

  private get activeLivenessCheckbox() {
    return this.page.getByRole('checkbox', { name: 'Active Liveness' });
  }

  private get passiveLivenessCheckbox() {
    return this.page.getByRole('checkbox', { name: 'Passive Liveness' });
  }

  private get saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }

  /**
   * Navigates to the app and waits until it is ready. With the saved session
   * (storageState) the app loads already configured, straight to the dashboard —
   * no Update Settings / credential refill needed.
   */
  async open(): Promise<void> {
    await this.page.goto(env.baseUrl);
    await this.waitUntilReady();
  }

  /** Waits until the configured dashboard (module launcher) is visible. */
  private async waitUntilReady(): Promise<void> {
    await this.page
      .getByRole('button', { name: 'Start' })
      .first()
      .waitFor({ state: 'visible', timeout: 60000 });
  }

  /**
   * Sets the liveness flags directly in the app's stored config and reloads, so
   * flows that need liveness off don't have to re-open the settings dialog. The
   * app persists these as localStorage `activeLiveness` / `passiveLiveness`.
   */
  async setLiveness(active: boolean, passive: boolean): Promise<void> {
    await this.page.evaluate(
      ({ a, p }) => {
        localStorage.setItem('activeLiveness', String(a));
        localStorage.setItem('passiveLiveness', String(p));
      },
      { a: active, p: passive }
    );
    await this.page.reload();
    await this.waitUntilReady();
  }

  /** Opens the settings dialog and enters the configured operator credentials. */
  async enterOperatorConfiguration(): Promise<void> {
    await this.updateSettingsButton.click();
    await this.baseUrlInput.fill(env.baseUrl);
    await this.emailInput.fill(env.credentials.email);
    await this.passwordInput.fill(env.credentials.password);
    await this.channelInput.fill(env.credentials.channel);
  }

  /**
   * Confirms the Development environment selector if it is shown. Some flows
   * (platform registration) surface this control; others don't, so it is a
   * best-effort click that is skipped when absent.
   */
  async confirmDevelopmentEnvironmentIfPresent(): Promise<void> {
    const control = this.page.getByText('EnvironmentDevelopmentBase');
    if (await control.count()) {
      await control.first().click();
    }
  }

  /** Turns active and passive liveness detection off (used by some flows). */
  async disableLiveness(): Promise<void> {
    await this.activeLivenessCheckbox.uncheck();
    await this.passiveLivenessCheckbox.uncheck();
  }

  /** Unchecks only Passive Liveness in the client settings. */
  async disablePassiveLiveness(): Promise<void> {
    await this.passiveLivenessCheckbox.uncheck();
  }

  /**
   * Saves the configuration and waits for the config to be re-fetched.
   *
   * NOTE: the original recordings only waited for `GetConfig` on some flows.
   * Saving always re-loads config, so we wait everywhere for reliability. If a
   * flow is ever found not to trigger `GetConfig`, switch it to {@link save}.
   */
  async saveAndWaitForConfig(): Promise<void> {
    await this.clickAndWaitForApis(this.saveButton, [Api.getConfig]);
  }

  /** Saves the configuration without waiting for a network response. */
  async save(): Promise<void> {
    await this.saveButton.click();
  }
}
