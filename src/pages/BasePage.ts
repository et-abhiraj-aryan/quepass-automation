import { Locator, Page } from '@playwright/test';
import { env } from '../config/env';

/**
 * Shared behaviour for every page object: holds the Playwright `page` and
 * provides the network-synchronisation helpers used across flows.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Resolves once a successful (HTTP 200) response whose URL contains
   * `fragment` is observed. Use in a `Promise.all` alongside the action that
   * triggers the request.
   */
  protected waitForApi(fragment: string, timeout: number = env.timeouts.api): Promise<unknown> {
    return this.page.waitForResponse(
      (res) => res.url().includes(fragment) && res.status() === 200,
      { timeout }
    );
  }

  /**
   * Performs `action` and waits for every endpoint in `fragments` to return
   * 200. Guarantees the waits are registered before the action fires (the
   * pattern the recorded specs used with `Promise.all`).
   */
  protected async actAndWaitForApis(
    action: () => Promise<void>,
    fragments: readonly string[],
    timeout: number = env.timeouts.api
  ): Promise<void> {
    await Promise.all([
      ...fragments.map((fragment) => this.waitForApi(fragment, timeout)),
      action(),
    ]);
  }

  /** Clicks `locator` while waiting for the given API endpoints to complete. */
  protected async clickAndWaitForApis(
    locator: Locator,
    fragments: readonly string[],
    timeout: number = env.timeouts.api
  ): Promise<void> {
    await this.actAndWaitForApis(() => locator.click(), fragments, timeout);
  }
}
