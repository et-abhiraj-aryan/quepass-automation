import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ApiGroups } from '../config/apiEndpoints';

/**
 * The landing screen after configuration, from which every module is launched.
 *
 * WARNING: the launch buttons currently rely on locators captured by Playwright
 * codegen — positional `Start` buttons (`.nth(n)`) and Tailwind colour classes
 * (`.bg-cyan-600`). These are brittle: a layout or theme change will break them.
 * They are centralised here so that when the app exposes stable hooks (ideally
 * `data-testid` or accessible names), only this file needs to change.
 */
export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Positional "Start" buttons on the main dashboard cards. */
  private startButton(index: number) {
    return this.page.getByRole('button', { name: 'Start' }).nth(index);
  }

  /** A module card identified by its Tailwind background colour class. */
  private colouredModule(colourClass: string) {
    return this.page.locator(`.w-full.${colourClass}`);
  }

  // --- Dashboard modules (positional "Start" buttons) -----------------------

  async startAuthentication(): Promise<void> {
    await this.startButton(1).click();
  }

  async startTransaction(): Promise<void> {
    await this.startButton(2).click();
  }

  async startCustomerSearch(): Promise<void> {
    await this.startButton(3).click();
  }

  async startFaceCaptureModule(): Promise<void> {
    await this.startButton(4).click();
  }

  async startExpressVerification(): Promise<void> {
    await this.startButton(5).click();
  }

  /** The registration card exposes its own labelled "Start Registration" button. */
  async startRegistration(): Promise<void> {
    await this.page.getByRole('button', { name: 'Start Registration' }).nth(1).click();
  }

  // --- Colour-coded modules -------------------------------------------------

  async openEventFaceCapture(): Promise<void> {
    await this.colouredModule('bg-cyan-600').click();
  }

  async openEventFaceCheckIn(): Promise<void> {
    await this.colouredModule('bg-purple-600').click();
  }

  async openEventFaceSearch(): Promise<void> {
    await this.colouredModule('bg-orange-600').click();
  }

  async openEventQrCheckIn(): Promise<void> {
    await this.colouredModule('bg-rose-600').click();
  }

  async openEventKioskQrCheckIn(): Promise<void> {
    await this.colouredModule('bg-violet-600').click();
  }

  /**
   * The kiosk face check-in module has no distinguishing colour class in the
   * recording, so it is reached by structural position. Especially brittle.
   */
  async openEventKioskFaceCheckIn(): Promise<void> {
    await this.page
      .locator('div:nth-child(3) > div:nth-child(4) > div > .p-6 > .w-full')
      .first()
      .click();
  }

  /**
   * Kiosk face search launches and immediately performs a search, so the click
   * is synchronised on the `Search` API completing.
   */
  async openKioskFaceSearch(): Promise<void> {
    await this.clickAndWaitForApis(
      this.colouredModule('bg-indigo-600').first(),
      ApiGroups.search
    );
  }
}
