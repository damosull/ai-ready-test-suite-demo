import { expect, test } from "../../fixtures/test.ts";
import { DETAIL_URL, PromotionPage } from "../../pages/promotionPage.ts";
import { ORDERS_SCENARIO, PRODUCTS, PROMOTIONS } from "../../scenarios/orders.ts";

/**
 * Staff open the "E2E Tee sale" catalogue promotion from the Promotions list, delete its
 * only rule from the rule card and confirm. The promotion itself must survive with no
 * rules, both straight away and after a reload.
 *
 * Replaces legacy SALEOR_167 ("Delete promotion rule from ... promotion") for the catalogue
 * promotion. Its order-promotion variant is deliberately not ported: the flow is the same
 * rule card and dialog, and this covers one user story.
 */
test.use({ scenario: ORDERS_SCENARIO, actor: "admin" });

test("Staff removes a rule from a promotion #e2e #discounts", async ({ page }) => {
  // Arrange
  const promotion = new PromotionPage(page);
  const { name, percent } = PROMOTIONS.catalogue;

  await promotion.open(name);

  // Act & Assert
  await test.step("the promotion starts with its one seeded rule", async () => {
    await expect(promotion.rules).toHaveCount(1);

    const rule = promotion.rules.first();

    await expect(rule.getByTestId("rule-value-chip")).toHaveText(`${percent}%`);
    await expect(rule).toContainText(PRODUCTS.tee.name);
    await expect(promotion.rulesPlaceholder).toBeHidden();
  });

  await test.step("confirming the rule's delete removes it", async () => {
    await promotion.deleteRule(promotion.rules.first());
    await expect(promotion.rulesPlaceholder).toBeVisible();
    await expect(promotion.rules).toHaveCount(0);
    // Still on the promotion: the save bar's promotion delete was not triggered.
    await expect(page).toHaveURL(DETAIL_URL);
    await expect(promotion.header).toContainText(name);
  });

  await test.step("after a reload the promotion remains with no rules", async () => {
    await page.reload();
    await expect(promotion.header).toContainText(name);
    await expect(promotion.nameInput).toHaveValue(name);
    // Before the count: the loading skeleton also has no rule cards.
    await expect(promotion.rulesPlaceholder).toBeVisible();
    await expect(promotion.rules).toHaveCount(0);
  });
});
