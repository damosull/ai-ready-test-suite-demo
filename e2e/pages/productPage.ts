import { type Page } from "@playwright/test";

/**
 * A product's detail page. The page title is the product name, rendered in the page header
 * from the saved product rather than from the form, so it only changes once a save lands.
 */
export class ProductPage {
  readonly header = this.page.getByTestId("page-header");

  readonly generalSettings = this.page.getByTestId("product-general-settings");

  readonly nameInput = this.generalSettings.getByRole("textbox", { name: "Name" });

  readonly saveButton = this.page.getByTestId("button-bar-confirm");

  constructor(readonly page: Page) {}

  async goto(productId: string) {
    await this.page.goto(`/products/${encodeURIComponent(productId)}`);
    await this.nameInput.waitFor();
  }

  async rename(name: string) {
    await this.nameInput.fill(name);
    await this.saveButton.click();
    await this.header.getByText(name, { exact: true }).waitFor();
  }
}
