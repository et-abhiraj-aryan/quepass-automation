import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ApiGroups } from '../config/apiEndpoints';

/**
 * Shared form controls used by event and verification flows: the event picker,
 * ticket / document type dropdowns and the document / verification number
 * inputs. Regex names tolerate the small label variations across screens
 * (e.g. "Choose an event" vs "Choose document" vs "Select document").
 */
export class EventPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private get selectEventButton() {
    return this.page.getByRole('button', { name: /Select Event.*Choose an event/ });
  }

  private eventOption(name: string) {
    return this.page.getByRole('option', { name });
  }

  private get documentTypeButton() {
    return this.page.getByRole('button', { name: /Document Type/ });
  }

  private get documentNumberInput() {
    return this.page.getByRole('textbox', { name: 'Document Number' });
  }

  /** Opens the event dropdown and selects the named event. */
  async selectEvent(name: string): Promise<void> {
    await this.selectEventButton.click();
    await this.eventOption(name).click();
  }

  /**
   * Selecting an event on the QR check-in screen immediately performs the
   * check-in, so this variant waits for the QR check-in endpoints.
   */
  async selectEventAndCheckInByQr(name: string): Promise<void> {
    await this.selectEventButton.click();
    await this.clickAndWaitForApis(this.eventOption(name), ApiGroups.qrCheckIn);
  }

  /** Selects a ticket type (e.g. "Standard") during registration. */
  async selectTicketType(name: string): Promise<void> {
    await this.page.getByRole('button', { name: /Ticket Type/ }).click();
    await this.page.getByRole('option', { name }).click();
  }

  /** Selects a document type (e.g. "UID", "Unified Number (UN)"). */
  async selectDocumentType(name: string): Promise<void> {
    await this.documentTypeButton.click();
    await this.page.getByRole('option', { name }).click();
  }

  /** Enters a document number into the document field. */
  async enterDocumentNumber(value: string): Promise<void> {
    await this.documentNumberInput.fill(value);
  }
}
