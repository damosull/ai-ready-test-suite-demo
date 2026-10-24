import { expect, test } from "../../fixtures/test.ts";
import { PromotionPage } from "../../pages/promotionPage.ts";
import { ORDERS_SCENARIO, PROMOTIONS } from "../../scenarios/orders.ts";

/**
 * Staff removing a rule from a promotion (ticket 08): marketing ends an offer for part of the
 * catalogue while the promotion carries on. There was no e2e coverage of promotions, and the
 * point is that the promotion survives losing its last rule, and that the removal persists.
 *
 * The orders scenario's catalogue promotion has exactly one rule, so removing it must leave
 * the same promotion with none.
 */

test.use({ scenario: ORDERS_SCENARIO });

test.describe("Promotion rule removal", () => {
  test("staff can remove the only rule from a catalogue promotion and the promotion remains #e2e", async ({
    page,
  }) => {
    // Arrange
    const promotion = new PromotionPage(page);
    const { name, percent } = PROMOTIONS.catalogue;
    let promotionUrl = "";

    await test.step("open the E2E Tee sale promotion", async () => {
      await promotion.open(name);
      // Kept to prove later that the page never left the promotion; the id is never typed.
      promotionUrl = page.url();
      await expect(promotion.nameInput).toHaveValue(name);
      await expect(promotion.typeInfo).toHaveText("Catalog");
      // The story is about removing the only rule, so it must start with exactly the seeded one.
      await expect(promotion.rules).toHaveCount(1);
      await expect(promotion.rules.getByTestId("rule-value-chip")).toHaveText(`${percent}%`);
    });

    // Act & Assert
    await test.step("delete the rule and confirm", () => promotion.deleteRule());

    await test.step("the promotion shows no rules", async () => {
      await expect(promotion.rules).toHaveCount(0);
      await expect(promotion.rulesEmptyState).toBeVisible();
      await expect(promotion.nameInput).toHaveValue(name);
      // A redirect to the list would mean the whole promotion was deleted.
      await expect(page).toHaveURL(promotionUrl);
    });

    await test.step("after a reload the promotion still exists with no rules", async () => {
      await page.reload();
      await promotion.waitForLoaded();
      await expect(promotion.nameInput).toHaveValue(name);
      await expect(promotion.header).toContainText(name);
      await expect(promotion.rules).toHaveCount(0);
      await expect(promotion.rulesEmptyState).toBeVisible();
    });
  });
});
