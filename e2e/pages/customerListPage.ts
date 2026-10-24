import { expect, type Page } from "@playwright/test";

/**
 * Glide row geometry (`cellHeight` in `src/components/Datagrid/styles.ts`): header and body
 * rows are both 40px, under a 1px top border. The middle of the first body row is therefore
 * at 1 + 40 + 20 from the top of the list.
 */
const FIRST_BODY_ROW_Y = 61;

/** Clear of the row-marker checkbox column, which does not open the row. */
const FIRST_DATA_COLUMN_X = 150;

/** The Customers list: searching it and opening a customer from the canvas grid. */
export class CustomerListPage {
  readonly searchInput = this.page.getByTestId("search-input");

  readonly list = this.page.getByTestId("list");

  /**
   * The grid is a canvas; Glide mirrors it in an accessibility table that is attached but
   * zero-size, so these are for waiting and asserting, never for clicking. Header included.
   */
  readonly rows = this.list.getByRole("row", { includeHidden: true });

  readonly rowAnchor = this.page.getByTestId("datagrid-row-anchor");

  constructor(readonly page: Page) {}

  /** A cell of the grid's accessibility table, by its exact text. */
  cell(text: string) {
    return this.list.getByRole("gridcell", { name: text, exact: true, includeHidden: true });
  }

  async goto() {
    await this.page.goto("/customers/");
    await this.searchInput.waitFor();
  }

  /**
   * Waits for the grid to narrow to the one matching row: until the debounced search lands
   * the grid re-renders, and a row hovered in the unfiltered one points at another customer.
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    await expect(this.cell(query)).toBeAttached();
    await expect(this.rows).toHaveCount(2);
  }

  /**
   * Canvas rows are not clickable DOM. Hovering a body row moves a real `<a>` over it whose
   * href is that row's details page; waiting for the href proves the hover landed on a row
   * before the click, rather than trusting the offset.
   */
  async openFirstRow() {
    await this.list.hover({ position: { x: FIRST_DATA_COLUMN_X, y: FIRST_BODY_ROW_Y } });
    await expect(this.rowAnchor).toHaveAttribute("href", /\/customers\/(?!add)[^/?]+\??$/);
    await this.rowAnchor.click();
    await this.page.waitForURL(/\/customers\/(?!add)[^/?]+\??$/);
  }
}
