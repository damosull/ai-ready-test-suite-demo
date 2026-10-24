// spec: specs/product-rename.md
// seed: e2e/tests/seed.spec.ts

import { expect, test } from "../../fixtures/test.ts";
import { ORDERS_SCENARIO, PRODUCTS } from "../../scenarios/orders.ts";

/**
 * Staff renaming an existing product from its product page (ticket 07): the page title follows
 * the saved name and the new name survives a reload.
 */
test.use({ scenario: ORDERS_SCENARIO });

// Glide data grid geometry: header and data rows both use `cellHeight` (40px) from
// src/components/Datagrid/styles.ts.
const GRID_HEADER_HEIGHT = 40;
const GRID_ROW_HEIGHT = 40;

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test.describe("Products - rename", () => {
  test("Staff renames a product and the new name persists after reload #e2e", async ({ page }) => {
    // Arrange
    const oldName = PRODUCTS.hoodie.name;
    const newName = "E2E Zip Hoodie";
    const searchInput = page.getByTestId("search-input");
    const gridCanvas = page.locator('[data-testid="data-grid-canvas"]');
    const rowAnchor = page.getByTestId("datagrid-row-anchor");
    const nameInput = page.getByRole("textbox", { name: "Name", exact: true });
    const saveButton = page.getByTestId("button-bar-confirm");
    const pageHeader = page.getByTestId("page-header");
    const successToast = page.locator('[data-test-type="success"]');

    // Act & Assert
    await test.step("open the product from the products list", async () => {
      // 2. Navigate to /products/ and search for the product
      await page.goto("/products/");
      await searchInput.fill(oldName);
      await expect(page).toHaveURL(/query=E2E(%20|\+)Hoodie/);

      const nameCell = gridCanvas
        .locator('td[role="gridcell"][id^="glide-cell-1-"]')
        .filter({ hasText: new RegExp(`^${escapeRegExp(oldName)}$`) });
      await expect(nameCell).toHaveCount(1);

      // 3. Hover the canvas over the matching row and open it through the row anchor.
      // The grid's scroller overlay receives pointer events, so locator.hover() on the canvas
      // never passes actionability checks; move the mouse to absolute page coordinates instead.
      // Re-read the row index right before hovering so a late re-render cannot shift the target.
      await expect(async () => {
        const cellId = (await nameCell.getAttribute("id", { timeout: 1000 })) ?? "";
        const rowIndex = Number(cellId.split("-").pop());
        const canvasBox = await gridCanvas.boundingBox({ timeout: 1000 });
        expect(canvasBox, "products grid canvas is rendered").not.toBeNull();
        expect(Number.isNaN(rowIndex), `"${oldName}" row index is readable`).toBe(false);
        if (canvasBox === null) return;

        await page.mouse.move(
          canvasBox.x + canvasBox.width / 2,
          canvasBox.y + GRID_HEADER_HEIGHT + GRID_ROW_HEIGHT * rowIndex + GRID_ROW_HEIGHT / 2,
        );
        await expect(rowAnchor).toHaveAttribute("href", /\/products\/[^/?]+/, { timeout: 1000 });
      }).toPass();
      await rowAnchor.click();
      await page.waitForURL(/\/products\/[^/?]+/);

      await expect(nameInput).toHaveValue(oldName);
      await expect(pageHeader.getByTitle(oldName, { exact: true })).toBeVisible();
      await expect(saveButton).toBeDisabled();
    });

    await test.step("rename and save", async () => {
      // 4. Fill the Name textbox with the new name
      await nameInput.fill(newName);
      await expect(saveButton).toBeEnabled();
      await expect(pageHeader.getByTitle(oldName, { exact: true })).toBeVisible();

      // 5. Click Save
      await saveButton.click();
      await expect(successToast).toBeVisible();
      await expect(successToast).toContainText("Product updated");
      await expect(pageHeader.getByTitle(newName, { exact: true })).toBeVisible();
      await expect(page).toHaveTitle(new RegExp(`^${escapeRegExp(newName)} \\|`));
    });

    await test.step("reload and verify the name persisted", async () => {
      // 6. Reload the product page
      await page.reload();
      await expect(nameInput).toHaveValue(newName);
      await expect(pageHeader.getByTitle(newName, { exact: true })).toBeVisible();
      await expect(saveButton).toBeDisabled();
    });
  });
});
