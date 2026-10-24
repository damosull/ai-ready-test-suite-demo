import { expect, type Page } from "@playwright/test";

/** A product's detail page: its header, the general information form and the save bar. */
export class ProductPage {
  readonly header = this.page.getByTestId("page-header");

  readonly titleSkeleton = this.page.getByTestId("product-details-title-skeleton");

  readonly nameInput = this.page.getByRole("textbox", { name: "Name", exact: true });

  readonly saveButton = this.page.getByTestId("button-bar-confirm");

  readonly unsavedChanges = this.page.getByTestId("product-save-composition");

  constructor(readonly page: Page) {}

  /** The header renders the name as a `title`, next to the product type chip. */
  title(name: string) {
    return this.header.getByTitle(name, { exact: true });
  }

  async waitForLoaded() {
    await this.nameInput.waitFor();
    await this.titleSkeleton.waitFor({ state: "hidden" });
  }

  async rename(name: string) {
    await this.nameInput.fill(name);
  }

  /**
   * Save stays enabled, showing a spinner, while the mutation runs, and is disabled again
   * only once the form is clean - so that, not the short-lived toast, marks completion.
   */
  async save() {
    await this.saveButton.click();
    await expect(this.saveButton).toBeDisabled();
    await this.unsavedChanges.waitFor({ state: "hidden" });
  }

  async reload() {
    await this.page.reload();
    await this.waitForLoaded();
  }
}
