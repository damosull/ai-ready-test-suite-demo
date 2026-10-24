import { expect, type Page } from "@playwright/test";

/**
 * A customer's details page. The customer list is a canvas datagrid whose rows are not DOM
 * elements, so specs open a customer by id rather than through the list.
 */
export class CustomerPage {
  readonly contactCard = this.page.getByTestId("customer-details");

  readonly noteInput = this.page.getByTestId("customer-note");

  readonly saveButton = this.page.getByTestId("button-bar-confirm");

  readonly notifications = this.page.getByRole("region", { name: /Notifications/ });

  constructor(readonly page: Page) {}

  async goto(customerId: string) {
    await this.page.goto(`/customers/${customerId}`);
    await this.noteInput.waitFor();
  }

  async writeNote(note: string) {
    await this.noteInput.fill(note);
  }

  async save() {
    await this.saveButton.click();
    // Save is enabled only while the form is dirty, so it turning disabled again means the
    // mutation came back and the form was reset to the saved value.
    await expect(this.saveButton).toBeDisabled();
  }
}
