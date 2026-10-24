import { type Page } from "@playwright/test";

/**
 * The global Search page. It is the accessible way to a product: the Products list is a
 * canvas datagrid whose rows expose no roles, while search results are real links.
 */
export class SearchPage {
  readonly searchInput = this.page.getByTestId("search-input");

  readonly productsScope = this.page.getByRole("radio", { name: "Products", exact: true });

  constructor(readonly page: Page) {}

  /**
   * Each result row links to the product three times (kind, name, date). Filtering on the
   * exact name text picks the name link alone, and one of no other product whose name
   * merely contains it.
   */
  productLink(name: string) {
    return this.page.getByRole("link").filter({ has: this.page.getByText(name, { exact: true }) });
  }

  /** Lands on the product's detail page. */
  async openProduct(name: string) {
    await this.page.goto("/search");
    await this.searchInput.fill(name);
    await this.productsScope.click();
    await this.page.waitForURL(url => url.searchParams.get("scope") === "products");
    await this.productLink(name).click();
    await this.page.waitForURL(/\/products\/[^/]+$/);
  }
}
