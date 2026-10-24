import { expect, type Page } from "@playwright/test";

/** A customer's details page: contact fields, saved with the page's save bar. */
export class CustomerPage {
  readonly details = this.page.getByTestId("customer-details");

  readonly noteInput = this.details.getByTestId("customer-note");

  readonly saveButton = this.page.getByTestId("button-bar-confirm");

  constructor(readonly page: Page) {}

  async goto(customerId: string) {
    await this.page.goto(`/customers/${encodeURIComponent(customerId)}`);
    await this.noteInput.waitFor();
  }

  /**
   * The save button disables itself until the form is dirty again, which is the sign the
   * mutation came back and the form took the saved values.
   */
  async saveNote(note: string) {
    await this.noteInput.fill(note);
    await this.saveButton.click();
    await expect(this.saveButton).toBeDisabled();
  }
}
