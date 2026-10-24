import { expect, test } from "../../fixtures/test.ts";
import { ProductPage } from "../../pages/productPage.ts";
import { SearchPage } from "../../pages/searchPage.ts";
import { ORDERS_SCENARIO, PRODUCTS } from "../../scenarios/orders.ts";

/**
 * Staff opens a product through the global search, renames it and saves. The header
 * follows the name only once it is saved, and the name survives a reload.
 *
 * The rename is deliberately not re-checked through search: without beat the search index
 * keeps the old name (see `e2e/README.md`).
 */
test.use({ scenario: ORDERS_SCENARIO });

const NEW_NAME = "E2E Zip Hoodie";

test("Staff renames a product #e2e", async ({ page }) => {
  // Arrange
  const search = new SearchPage(page);
  const product = new ProductPage(page);
  const oldName = PRODUCTS.hoodie.name;

  // Act & Assert
  await test.step("Staff opens the product", async () => {
    await search.openProduct(oldName);
    await product.waitForLoaded();
    await expect(product.title(oldName)).toBeVisible();
    await expect(product.nameInput).toHaveValue(oldName);
    await expect(product.saveButton).toBeDisabled();
  });

  await test.step("Staff renames it and saves", async () => {
    await product.rename(NEW_NAME);
    await expect(product.saveButton).toBeEnabled();
    await expect(product.unsavedChanges).toHaveText("Unsaved changes: details");
    // The header shows the saved name, not the edited one.
    await expect(product.title(oldName)).toBeVisible();

    await product.save();
    await expect(product.title(NEW_NAME)).toBeVisible();
    await expect(product.title(oldName)).toBeHidden();
    await expect(page).toHaveTitle(`${NEW_NAME} | Saleor e-commerce`);
  });

  await test.step("The new name persists after a reload", async () => {
    await product.reload();
    await expect(product.nameInput).toHaveValue(NEW_NAME);
    await expect(product.title(NEW_NAME)).toBeVisible();
  });
});
