import { expect, type Locator, type Page } from "@playwright/test";

/**
 * A product's details page, reached through the global Search page. The product list is a
 * canvas data grid with no DOM rows to click, and product ids differ with every dump build,
 * so search by name is the only stable route in.
 */
export class ProductPage {
  readonly searchResultRow = this.page.getByRole("row");

  readonly pageHeader = this.page.getByTestId("page-header");

  readonly generalInformation = this.page.getByTestId("product-general-settings");

  // Scoped to the card: other "Name"-like fields exist elsewhere on the page.
  readonly nameInput = this.generalInformation.getByRole("textbox", { name: "Name" });

  readonly saveButton = this.page.getByTestId("button-bar-confirm");

  readonly productUpdatedToast = this.page
    .getByRole("region", { name: /Notifications/ })
    .getByText("Product updated");

  constructor(readonly page: Page) {}

  /**
   * The name shown in the header. The header also holds the product type, and the name's Box
   * has no test id, so it is matched by exact text rather than toHaveText on the header.
   */
  title(name: string): Locator {
    return this.pageHeader.getByText(name, { exact: true });
  }

  /**
   * Search is full-text, so "E2E Hoodie" can also match populatedb's "Hoodie": narrow to the
   * row holding the name and wait for exactly one before clicking its name link.
   */
  async openFromSearch(name: string): Promise<void> {
    await this.page.goto(`/search?q=${encodeURIComponent(name)}&scope=products`);
    const row = this.searchResultRow.filter({ hasText: name });
    await expect(row).toHaveCount(1);
    await row.getByRole("link").filter({ hasText: name }).click();
    await expect(this.nameInput).toHaveValue(name);
  }

  async rename(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  /**
   * Save is also disabled before any edit, so a disabled button alone proves nothing: the
   * toast shows this save landed, and the button going disabled again afterwards shows the
   * form now matches the saved value.
   */
  async save(): Promise<void> {
    await this.saveButton.click();
    await expect(this.productUpdatedToast).toBeVisible();
    await expect(this.saveButton).toBeDisabled();
  }
}
