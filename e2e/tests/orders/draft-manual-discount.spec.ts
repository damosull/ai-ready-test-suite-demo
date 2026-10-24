import { expect, test } from "../../fixtures/test.ts";
import { DraftOrderPage } from "../../pages/draftOrderPage.ts";
import { CHANNEL, ORDERS_SCENARIO, PRODUCTS, PROMOTIONS } from "../../scenarios/orders.ts";

/**
 * A manual percentage discount on a draft is taken from the subtotal the line promotion has
 * already reduced, not from the list price - the arithmetic that regresses quietly. Promotions
 * on their own are covered by `draft-pricing.spec.ts`.
 */
test.use({ scenario: ORDERS_SCENARIO });

const money = (amount: number) => amount.toFixed(2);

const MANUAL_PERCENT = 25;

test("Staff applies a manual percentage discount on top of a line promotion #e2e", async ({
  page,
}) => {
  // Arrange
  const draft = new DraftOrderPage(page);
  const teeDiscount = (PRODUCTS.tee.price * PROMOTIONS.catalogue.percent) / 100;
  const promotedSubtotal = PRODUCTS.tee.price - teeDiscount;
  const manualDiscount = (promotedSubtotal * MANUAL_PERCENT) / 100;
  const total = promotedSubtotal - manualDiscount;

  // Guards the arithmetic below: the order promotion must stay out of it.
  expect(promotedSubtotal).toBeLessThan(PROMOTIONS.order.subtotalAtLeast);

  await draft.create({ from: "drafts", channel: CHANNEL.name });
  await draft.addProduct(PRODUCTS.tee);
  await expect(draft.total).toHaveText(money(promotedSubtotal));

  // Act & Assert
  await test.step("a 25% manual discount comes off the promoted subtotal", async () => {
    await draft.addPercentageDiscount({ percent: MANUAL_PERCENT, reason: "Goodwill gesture" });
    await expect(draft.total).toHaveText(money(total));
    await expect(draft.discountToggle).toContainText(money(teeDiscount + manualDiscount));
  });

  await test.step("the breakdown shows the manual 25% alongside the line promotion", async () => {
    await expect(draft.discountRow("Manual")).toContainText(`${MANUAL_PERCENT}%`);
    await expect(draft.discountRow("Manual")).toContainText(money(manualDiscount));
    await expect(draft.discountRow("Promotion")).toContainText(money(teeDiscount));
  });

  await test.step("the discounted total is saved, not just shown", async () => {
    await page.reload();
    await expect(draft.total).toHaveText(money(total));
    await draft.discountToggle.click();
    await expect(draft.discountRow("Manual")).toContainText(`${MANUAL_PERCENT}%`);
  });
});
