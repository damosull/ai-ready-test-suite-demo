import { expect, type Locator, type Page } from "@playwright/test";

export const DETAIL_URL =/\/discounts\/sales\/[^/?]+$/;

class DeleteRuleDialog {
  readonly dialog = this.page.getByTestId("delete-rule-dialog");

  readonly confirmButton = this.page.getByTestId("delete-rule-button");

  constructor(readonly page: Page) {}
}

/** A promotion, from the Promotions list to its detail page and rule cards. */
export class PromotionPage {
  readonly deleteRuleDialog = new DeleteRuleDialog(this.page);

  readonly searchInput = this.page.getByTestId("search-input");

  readonly list = this.page.getByTestId("list");

  /* Glide's a11y table is hidden; its aria-rowcount is the header plus the data rows. */
  readonly grid = this.list.getByRole("grid", { includeHidden: true });

  readonly rowAnchor = this.page.getByTestId("datagrid-row-anchor");

  readonly header = this.page.getByTestId("page-header");

  readonly nameInput = this.page.getByTestId("discount-name-input");

  readonly rulesSection = this.page.getByTestId("discount-rules-section");

  readonly rules = this.page.getByTestId("added-rule");

  readonly rulesPlaceholder = this.rulesSection.getByText(
    "Add your first rule to set up a promotion",
    { exact: true },
  );

  constructor(readonly page: Page) {}

  /**
   * Opens a promotion from the list - the only UI path, since global search does not index
   * promotions. The list sorts by name, so "E2E big basket" is the first row until the search
   * lands, and the grid's a11y table briefly unmounts while it re-renders: wait for one data
   * row with the name before hovering it.
   */
  async open(name: string) {
    await this.page.goto("/discounts/sales");
    await this.searchInput.fill(name);
    await this.page.waitForURL(/query=/);
    await expect(this.grid).toHaveAttribute("aria-rowcount", "2");
    await expect(this.list.getByText(name, { exact: true })).toHaveCount(1);

    /*
     * Rows are drawn on a canvas and the row anchor only gets its href on hover. The list's
     * centre falls on the header row, so hover inside the Name column of the bottom row.
     */
    const box = await this.list.boundingBox();

    if (!box) {
      throw new Error("the promotion list is not rendered");
    }

    await this.list.hover({ position: { x: 150, y: box.height - 15 } });
    await this.rowAnchor.click();
    await this.page.waitForURL(DETAIL_URL);
    await expect(this.header).toContainText(name);
  }

  /** Persists straight away on confirm - there is no Save step. */
  async deleteRule(rule: Locator) {
    // The card's trash icon, not the save bar's "Delete", which deletes the whole promotion.
    await rule.getByTestId("rule-delete-button").click();
    await this.deleteRuleDialog.dialog.waitFor({ state: "visible" });
    await this.deleteRuleDialog.confirmButton.click();
    await this.deleteRuleDialog.dialog.waitFor({ state: "hidden" });
  }
}
