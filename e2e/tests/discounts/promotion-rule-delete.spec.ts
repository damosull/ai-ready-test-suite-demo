import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { PromotionPage } from "../../pages/promotionPage.ts";
import { findPromotionId, ORDERS_SCENARIO, PROMOTIONS } from "../../scenarios/orders.ts";

/**
 * Removing a rule from a promotion: marketing ends an offer early for part of the catalogue
 * while the promotion itself carries on, so the rule goes and the promotion stays.
 */
test.use({ scenario: ORDERS_SCENARIO });

const config = e2eConfig();

test("Staff removes the only rule from a promotion and the promotion stays #e2e", async ({
  page,
}) => {
  // Arrange
  const promotionPage = new PromotionPage(page);

  await promotionPage.goto(await findPromotionId(config, "catalogue"));
  await expect(promotionPage.nameInput).toHaveValue(PROMOTIONS.catalogue.name);
  await expect(promotionPage.rules).toHaveCount(1);

  // Act & Assert
  await test.step("delete the rule and confirm", async () => {
    await promotionPage.deleteOnlyRule();
    await expect(promotionPage.rules).toHaveCount(0);
    await expect(promotionPage.rulesSection).toContainText(
      "Add your first rule to set up a promotion",
    );
  });

  await test.step("the rule is gone after a reload and the promotion is not", async () => {
    await page.reload();
    await expect(promotionPage.nameInput).toHaveValue(PROMOTIONS.catalogue.name);
    await expect(promotionPage.rulesSection).toContainText(
      "Add your first rule to set up a promotion",
    );
    await expect(promotionPage.rules).toHaveCount(0);
  });
});
