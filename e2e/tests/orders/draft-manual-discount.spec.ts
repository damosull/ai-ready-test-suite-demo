import { expect, test } from "../../fixtures/test.ts";
import { DraftOrderPage } from "../../pages/draftOrderPage.ts";
import { CHANNEL, ORDERS_SCENARIO, PRODUCTS, PROMOTIONS } from "../../scenarios/orders.ts";

/**
 * Covers a staff member adding a manual percentage discount, with a reason, to a draft whose
 * line is already on a catalogue promotion. The manual discount has to come off the promoted
 * subtotal rather than replace the promotion or apply to the undiscounted price, and it has to
 * be saved on the draft, not only shown until the next load.
 */
test.use({ scenario: ORDERS_SCENARIO });

const money = (amount: number) => amount.toFixed(2);

// Ticket data rather than seed data, so it lives with the spec.
const MANUAL = { percent: 25, reason: "Goodwill gesture" } as const;

test("Draft total applies a manual percentage discount after the line promotion #e2e", async ({
  page,
}) => {
  // Arrange
  const draft = new DraftOrderPage(page);
  const teePrice = PRODUCTS.tee.price;
  const teeDiscount = (teePrice * PROMOTIONS.catalogue.percent) / 100;
  const promotedSubtotal = teePrice - teeDiscount;
  const manualDiscount = (promotedSubtotal * MANUAL.percent) / 100;
  const expectedTotal = promotedSubtotal - manualDiscount;
  const totalDiscount = teeDiscount + manualDiscount;

  // If the tee alone qualified for the order promotion, the Order subgroup would offer
  // "Override with manual discount" instead of "Add Discount" and the arithmetic would change.
  expect(promotedSubtotal).toBeLessThan(PROMOTIONS.order.subtotalAtLeast);
  // The story is a manual discount on top of a line promotion, so that promotion must exist.
  expect(teeDiscount).toBeGreaterThan(0);

  await draft.create({ from: "drafts", channel: CHANNEL.name });

  // Act & Assert
  await test.step("the tee is discounted by its catalogue promotion", async () => {
    await draft.addProduct(PRODUCTS.tee);
    await expect(draft.total).toHaveText(money(promotedSubtotal));
    // The line promotion is in place first, so the later total proves stacking, not replacement.
    await expect(draft.discountToggle).toContainText(money(teeDiscount));
  });

  await test.step("a manual 25% order discount comes off the promoted subtotal", async () => {
    await draft.addOrderDiscount({ percent: MANUAL.percent, reason: MANUAL.reason });
    // The dialog also closes on a failed mutation, so only the totals prove the discount landed.
    await expect(draft.total).toHaveText(money(expectedTotal));
    await expect(draft.discountToggle.getByTitle("Discount amount")).toHaveText(
      money(totalDiscount),
    );
  });

  await test.step("the breakdown shows the manual 25% alongside the line promotion", async () => {
    // Both shares are the same amount with the current constants, so each is checked on its
    // own row; an unscoped summary match could not tell them apart.
    await expect(draft.manualDiscountRow).toContainText("Manual");
    await expect(draft.manualDiscountRow).toContainText(`${MANUAL.percent}%`);
    await expect(draft.manualDiscountRow.getByTitle("Discount amount")).toHaveText(
      money(manualDiscount),
    );
    await expect(draft.manualDiscountPercent(MANUAL.percent)).toHaveAttribute(
      "title",
      MANUAL.reason,
    );
    await expect(draft.linePromotionRow).toContainText("Promotion");
    await expect(draft.linePromotionRow).toContainText("(1 line)");
    await expect(draft.linePromotionRow.getByTitle("Discount amount")).toHaveText(
      money(teeDiscount),
    );
  });

  await test.step("the discount is saved, not just shown", async () => {
    await page.reload();
    await expect(draft.statusInfo).toHaveText("Draft");
    await expect(draft.total).toHaveText(money(expectedTotal));
    // The breakdown is collapsed again after a reload.
    await draft.discountToggle.click();
    await expect(draft.manualDiscountRow).toContainText(`${MANUAL.percent}%`);
    await expect(draft.manualDiscountRow.getByTitle("Discount amount")).toHaveText(
      money(manualDiscount),
    );
    await expect(draft.linePromotionRow.getByTitle("Discount amount")).toHaveText(
      money(teeDiscount),
    );
    await expect(draft.manualDiscountPercent(MANUAL.percent)).toHaveAttribute(
      "title",
      MANUAL.reason,
    );
  });
});
