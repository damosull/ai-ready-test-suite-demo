import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { ProductPage } from "../../pages/productPage.ts";
import { findProductId, ORDERS_SCENARIO, PRODUCTS } from "../../scenarios/orders.ts";

/**
 * Renaming a product from its page. A rename that never reaches the server looks saved
 * until the page is reloaded, so the new name is checked again after a reload.
 */
test.use({ scenario: ORDERS_SCENARIO });

const config = e2eConfig();

test("Staff renames a product and the new name is saved #e2e", async ({ page }) => {
  // Arrange
  const productPage = new ProductPage(page);
  const newName = "E2E Zip Hoodie";

  await productPage.goto(await findProductId(config, "hoodie"));
  await expect(productPage.header).toContainText(PRODUCTS.hoodie.name);

  // Act & Assert
  await test.step("rename and save", async () => {
    await productPage.rename(newName);
    await expect(productPage.header).toContainText(newName);
  });

  await test.step("the new name is saved, not just shown", async () => {
    await page.reload();
    await expect(productPage.nameInput).toHaveValue(newName);
    await expect(productPage.header).toContainText(newName);
  });
});
