import { type Page } from "@playwright/test";

/** A customer's details page: the Contact card and the savebar. */
export class CustomerDetailsPage {
  readonly firstNameInput = this.page.getByTestId("customer-first-name");

  readonly lastNameInput = this.page.getByTestId("customer-last-name");

  readonly emailInput = this.page.getByTestId("customer-email");

  readonly noteInput = this.page.getByTestId("customer-note");

  readonly saveButton = this.page.getByTestId("button-bar-confirm");

  readonly unsavedChanges = this.page.getByTestId("customer-save-composition");

  readonly updatedNotification = this.page.getByText("Customer updated", { exact: true });

  constructor(readonly page: Page) {}

  /** The loading skeleton is a separate layout without the form, so the note marks a load. */
  async reload() {
    await this.page.reload();
    await this.noteInput.waitFor();
  }

  async fillNote(note: string) {
    await this.noteInput.fill(note);
  }

  async save() {
    await this.saveButton.click();
    await this.updatedNotification.waitFor();
  }
}
