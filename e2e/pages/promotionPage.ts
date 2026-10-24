import { expect, type Page } from "@playwright/test";

/** The datagrid's row and header height (`cellHeight`, src/components/Datagrid/styles.ts). */
const GRID_ROW_HEIGHT = 40;

/** A promotion, from finding it on the discounts list to editing its rules. */
export class PromotionPage {
  readonly searchInput = this.page.getByTestId("search-input");

  readonly list = this.page.getByTestId("list");

  readonly emptyListText = this.page.getByTestId("empty-data-grid-text");

  readonly rowAnchor = this.page.getByTestId("datagrid-row-anchor");

  readonly header = this.page.getByTestId("page-header");

  readonly nameInput = this.page.getByTestId("discount-name-input");

  readonly typeInfo = this.page.getByTestId("promotion-type-info");

  readonly ruleList = this.page.getByTestId("rule-list");

  readonly rules = this.ruleList.getByTestId("added-rule");

  // The empty state has no test id.
  readonly rulesEmptyState = this.ruleList.getByText("Add your first rule to set up a promotion");

  readonly deleteRuleDialog = this.page.getByTestId("delete-rule-dialog");

  readonly confirmDeleteRuleButton = this.deleteRuleDialog.getByTestId("delete-rule-button");

  constructor(readonly page: Page) {}

  /**
   * Searches with the full name, because the promotions search matches nothing on a partial
   * one, and opens the single result.
   *
   * The list is a canvas datagrid: its rows are not clickable elements. The grid mirrors them
   * in a table inside the canvas, which is never rendered, so it is only read (hidden rows
   * included) to know the search has settled on that one promotion. The first row is then
   * hovered by position, which places the grid's row link over it, and the link is clicked.
   */
  async open(name: string) {
    await this.page.goto("/discounts/sales");
    await this.searchInput.fill(name);
    await this.page.waitForURL(url => url.searchParams.get("query") === name);
    await expect(this.emptyListText).toBeHidden();
    // The header row plus the one result.
    await expect(this.list.getByRole("row", { includeHidden: true })).toHaveCount(2);
    await expect(
      this.list.getByRole("gridcell", { name, exact: true, includeHidden: true }),
    ).toHaveCount(1);

    const box = await this.list.boundingBox();

    if (!box) throw new Error("The promotions list is not on screen");

    await this.list.hover({ position: { x: box.width / 2, y: GRID_ROW_HEIGHT * 1.5 } });
    await this.rowAnchor.click();
    await this.page.waitForURL(url => /^\/discounts\/sales\/[^/]+$/.test(url.pathname));
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await this.ruleList.waitFor();
  }

  /** Takes effect on confirming; the promotion does not need saving. */
  async deleteRule() {
    await this.rules.getByTestId("rule-delete-button").click();
    await expect(this.deleteRuleDialog).toContainText("Delete rule");
    await this.confirmDeleteRuleButton.click();
    await this.deleteRuleDialog.waitFor({ state: "hidden" });
  }
}
