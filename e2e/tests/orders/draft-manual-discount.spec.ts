import { expect, test } from "../../fixtures/test.ts";
import { DraftOrderPage } from "../../pages/draftOrderPage.ts";
import { CHANNEL, ORDERS_SCENARIO, PRODUCTS, PROMOTIONS } from "../../scenarios/orders.ts";

/**
 * A manual percentage discount on a whole draft order, stacked on a line's catalogue
 * promotion. The percentage must apply to the already-promoted subtotal, which is the
 * arithmetic most likely to regress quietly.
 */
test.use({ scenario: ORDERS_SCENARIO });

const money = (amount: number) => amount.toFixed(2);

test("Staff applies a manual percentage discount to a draft on top of a line promotion #e2e", async ({
  page,
}) => {
  // Arrange
  const draft = new DraftOrderPage(page);
  const manualPercent = 25;
  const teeDiscount = (PRODUCTS.tee.price * PROMOTIONS.catalogue.percent) / 100;
  const promotedSubtotal = PRODUCTS.tee.price - teeDiscount;
  const manualDiscount = (promotedSubtotal * manualPercent) / 100;
  const total = promotedSubtotal - manualDiscount;

  // The order promotion would add its own discount and muddy the expected total.
  expect(promotedSubtotal).toBeLessThan(PROMOTIONS.order.subtotalAtLeast);

  await draft.create({ from: "drafts", channel: CHANNEL.name });
  await draft.addProduct(PRODUCTS.tee);
  await expect(draft.total).toHaveText(money(promotedSubtotal));

  // Act & Assert
  await test.step("a 25% manual discount comes off the promoted subtotal", async () => {
    await draft.addPercentageDiscount({ percent: manualPercent, reason: "Goodwill gesture" });
    await expect(draft.total).toHaveText(money(total));
    await expect(draft.discountToggle).toContainText(money(teeDiscount + manualDiscount));
  });

  await test.step("the breakdown shows the manual 25% beside the line promotion", async () => {
    await expect(draft.manualDiscountRow).toContainText(`${manualPercent}%`);
    await expect(draft.manualDiscountRow).toContainText(money(manualDiscount));
    await expect(draft.promotionDiscountRow).toContainText(money(teeDiscount));
  });

  await test.step("the discount is saved, not just shown", async () => {
    await page.reload();
    await expect(draft.total).toHaveText(money(total));
    await draft.discountToggle.click();
    await expect(draft.manualDiscountRow).toContainText(`${manualPercent}%`);
  });
});
