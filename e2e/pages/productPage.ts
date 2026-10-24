import { expect, type Page } from "@playwright/test";

/** A product's detail page: its general information and the page's save bar. */
export class ProductPage {
  /** Holds the product's name, followed by its product type. */
  readonly header = this.page.getByTestId("page-header");

  readonly generalSettings = this.page.getByTestId("product-general-settings");

  readonly nameInput = this.generalSettings.getByRole("textbox", { name: "Name" });

  readonly saveButton = this.page.getByTestId("button-bar-confirm");

  constructor(readonly page: Page) {}

  async goto(productId: string) {
    await this.page.goto(`/products/${encodeURIComponent(productId)}`);
    await this.nameInput.waitFor();
  }

  /**
   * Save stays disabled while the form has no unsaved changes, so it turning disabled again
   * is the form settling on what the server saved.
   */
  async rename(name: string) {
    await this.nameInput.fill(name);
    await this.saveButton.click();
    await expect(this.saveButton).toBeDisabled();
  }
}
