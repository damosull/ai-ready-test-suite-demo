import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { ProductPage } from "../../pages/productPage.ts";
import { findProductId, ORDERS_SCENARIO, PRODUCTS } from "../../scenarios/orders.ts";

/**
 * A staff member renames a product from its details page: they change the Name field,
 * save with the save bar, and the product carries the new name in the page header right
 * after saving and again after a full page reload. Not ported from legacy coverage.
 */
test.use({ scenario: ORDERS_SCENARIO });

const config = e2eConfig();

test("Staff can rename a product and the new name persists #e2e #products", async ({ page }) => {
  // Arrange
  const productPage = new ProductPage(page);
  const oldName = PRODUCTS.hoodie.name;
  const newName = "E2E Zip Hoodie";

  await productPage.goto(await findProductId(config, PRODUCTS.hoodie.sku));
  await expect(productPage.nameInput).toHaveValue(oldName);
  await expect(productPage.pageHeader.getByTitle(oldName, { exact: true })).toBeVisible();
  await expect(productPage.saveButton).toBeDisabled();

  // Act & Assert
  await test.step("rename and save", async () => {
    await productPage.nameInput.fill(newName);
    await expect(productPage.saveButton).toBeEnabled();

    const errors = await productPage.save();

    expect(errors).toEqual([]);
    await expect(page.getByText("Product updated")).toBeVisible();
    // The header follows the refetched product, not the form, so it updates after save.
    await expect(productPage.pageHeader.getByTitle(newName, { exact: true })).toBeVisible();
    await expect(productPage.pageHeader.getByTitle(oldName, { exact: true })).toHaveCount(0);
  });

  await test.step("reload", async () => {
    await page.reload();
    // The field renders empty until the product loads, so wait on the value itself.
    await expect(productPage.nameInput).toHaveValue(newName);
    await expect(productPage.pageHeader.getByTitle(newName, { exact: true })).toBeVisible();
    await expect(page).toHaveTitle(`${newName} | Saleor e-commerce`);
    await expect(productPage.saveButton).toBeDisabled();
  });
});
