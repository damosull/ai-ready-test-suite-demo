// spec: specs/product-rename.md
// seed: e2e/tests/seed.spec.ts
import { expect, test } from "../../fixtures/test.ts";
import { ORDERS_SCENARIO, PRODUCTS } from "../../scenarios/orders.ts";

/**
 * A merchandiser renames a product on its product page. The page title follows the saved
 * name, not the draft, and the new name survives a reload.
 *
 * The products list is a Glide canvas datagrid: a row opens through the overlay anchor that
 * follows the hovered row, so the spec hovers the first result row and clicks the anchor.
 */
test.use({ scenario: ORDERS_SCENARIO });

const NEW_NAME = "E2E Zip Hoodie";
const SUCCESS_MESSAGE = "Product updated";
/** Glide header and row heights (`cellHeight` in `src/components/Datagrid/styles.ts`). */
const GRID_HEADER_HEIGHT = 40;
const GRID_ROW_HEIGHT = 40;

test.describe("Product rename", () => {
  test("Rename a product #e2e", async ({ page }) => {
    // Arrange
    const productName = PRODUCTS.hoodie.name;
    const header = page.getByTestId("page-header");
    const nameInput = page.getByRole("textbox", { name: "Name" });
    const saveButton = page.getByTestId("button-bar-confirm");
    const notifications = page.getByRole("region", { name: /Notifications/ });
    const grid = page.locator('[data-testid="data-grid-canvas"]');
    const rowAnchor = page.getByTestId("datagrid-row-anchor");

    // 1. Open the products list, search for "E2E Hoodie", open it
    await page.goto("/products/");
    await page.getByTestId("search-input").fill(productName);
    await expect(page).toHaveURL(/query=E2E%20Hoodie/);
    await expect(grid.locator("#glide-cell-1-0")).toHaveText(productName);

    const box = await grid.boundingBox();
    if (!box) {
      throw new Error("The products datagrid is not rendered");
    }
    await page.mouse.move(
      box.x + box.width / 2,
      box.y + GRID_HEADER_HEIGHT + GRID_ROW_HEIGHT / 2,
    );
    await rowAnchor.click();
    await expect(page).toHaveURL(/\/products\/[^/?]+$/);
    const productUrl = page.url();

    await expect(header.getByTitle(productName, { exact: true })).toHaveText(productName);
    await expect(nameInput).toHaveValue(productName);
    await expect(saveButton).toBeDisabled();

    // Act
    // 2. Change the Name field to "E2E Zip Hoodie" and click Save
    await nameInput.fill(NEW_NAME);
    await expect(saveButton).toBeEnabled();
    await expect(header.getByTitle(productName, { exact: true })).toHaveText(productName);
    await saveButton.click();

    // Assert
    // 3. Assert the "Product updated" notification and that the page title shows "E2E Zip Hoodie"
    await expect(notifications.getByText(SUCCESS_MESSAGE)).toBeVisible();
    await expect(header.getByTitle(NEW_NAME, { exact: true })).toHaveText(NEW_NAME);
    await expect(header.getByTitle(productName, { exact: true })).toHaveCount(0);
    await expect(saveButton).toBeDisabled();

    // 4. Reload; assert the name field value and the page title both show "E2E Zip Hoodie"
    await page.reload();
    await expect(page).toHaveURL(productUrl);
    await expect(nameInput).toHaveValue(NEW_NAME);
    await expect(header.getByTitle(NEW_NAME, { exact: true })).toHaveText(NEW_NAME);
    await expect(saveButton).toBeDisabled();
  });
});
