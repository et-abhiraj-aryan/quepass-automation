import * as fs from 'fs';
import * as path from 'path';
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Api } from '../config/apiEndpoints';

/** Where the QR (with its white quiet zone) sits within a pass PNG, as fractions. */
const PASS_QR_CROP = { x: 0.13, y: 0.517, w: 0.74, h: 0.394 };

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
    // Matches both "Select Event  Choose an event" and the QR module's "Choose an event".
    return this.page.getByRole('button', { name: /Choose an event/ });
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
   * QR check-in with a real pass: crops the QR out of the downloaded pass PNG,
   * injects it as the camera, then selects the event (which opens the scanner).
   * The app reads the injected QR and checks the attendee in.
   */
  async scanRegisteredPassAndCheckIn(passPath: string, eventName: string): Promise<void> {
    const base64 = fs.readFileSync(path.resolve(passPath)).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    await this.page.evaluate(
      async ({ url, crop }) => {
        const setImage = (window as unknown as {
          __setCameraImage?: (
            u: string,
            fit?: number,
            c?: { x: number; y: number; w: number; h: number }
          ) => Promise<boolean>;
        }).__setCameraImage;
        if (!setImage) throw new Error('camera image injection is not available (fake camera off?)');
        // Keep the QR small enough to sit fully inside the scan frame (with a quiet zone).
        await setImage(url, 0.45, crop);
      },
      { url: dataUrl, crop: PASS_QR_CROP }
    );

    // Selecting the event opens the scanner; it reads the injected QR and checks
    // the attendee in (CheckInRegistrantByQR = the success signal).
    await this.selectEventButton.click();
    await this.clickAndWaitForApis(this.eventOption(eventName), [Api.checkInRegistrantByQr]);
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
