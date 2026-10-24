import { expect, test } from "../../fixtures/test.ts";
import { ProductPage } from "../../pages/productPage.ts";
import { ORDERS_SCENARIO, PRODUCTS } from "../../scenarios/orders.ts";

// spec: specs/product-rename.md
// seed: e2e/tests/seed.spec.ts

/**
 * Renaming a product from its details page (ticket 07). There is no product-page coverage
 * yet, and a rename that silently fails to save is the kind of failure nobody notices until a
 * customer does - so the test reloads and checks the name again rather than trusting the
 * page's own state after saving.
 */

const NEW_NAME = "E2E Zip Hoodie";

test.describe("Products", () => {
  test.use({ scenario: ORDERS_SCENARIO });

  test("staff can rename a product and the new name persists #e2e #products", async ({ page }) => {
    // Arrange
    const productPage = new ProductPage(page);
    const originalName = PRODUCTS.hoodie.name;

    // Act & Assert
    await test.step("open the product", async () => {
      await productPage.openFromSearch(originalName);

      await expect(page).toHaveURL(/\/products\/[^/]+$/);
      await expect(productPage.nameInput).toHaveValue(originalName);
      await expect(productPage.title(originalName)).toBeVisible();
      await expect(productPage.saveButton).toBeDisabled();
    });

    await test.step("rename and save", async () => {
      await productPage.rename(NEW_NAME);
      await expect(productPage.saveButton).toBeEnabled();

      await productPage.save();

      await expect(productPage.title(NEW_NAME)).toBeVisible();
      await expect(productPage.title(originalName)).toBeHidden();
      await expect(page).toHaveTitle(new RegExp(`^${NEW_NAME} \\|`));
    });

    await test.step("reload and verify", async () => {
      await page.reload();

      await expect(productPage.nameInput).toHaveValue(NEW_NAME);
      await expect(productPage.title(NEW_NAME)).toBeVisible();
      // Disabled after a fresh load means the field holds the saved value, not an unsaved edit.
      await expect(productPage.saveButton).toBeDisabled();
    });
  });
});
