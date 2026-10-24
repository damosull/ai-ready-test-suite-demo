// spec: specs/draft-order-manual-discount.md
// seed: e2e/tests/seed.spec.ts

import { expect, test } from "../../fixtures/test.ts";
import { DraftOrderPage } from "../../pages/draftOrderPage.ts";
import { CHANNEL, ORDERS_SCENARIO, PRODUCTS, PROMOTIONS } from "../../scenarios/orders.ts";

/**
 * Ticket 01: staff add a manual percentage discount to a whole draft order. It applies on top
 * of the catalogue promotion already on the tee's line, and it is saved on the server.
 */
test.use({ scenario: ORDERS_SCENARIO });

const money = (amount: number) => amount.toFixed(2);

test.describe("Draft order manual discount", () => {
  test("A 25% manual order discount applies on top of the tee's catalogue promotion and is saved #e2e", async ({
    page,
  }) => {
    // Arrange
    // 1. Compute the expected amounts from the scenario constants
    const draft = new DraftOrderPage(page);
    const teePrice = PRODUCTS.tee.price;
    const teeDiscount = (teePrice * PROMOTIONS.catalogue.percent) / 100;
    const promoted = teePrice - teeDiscount;
    const manualPercent = 25;
    const manualDiscount = (promoted * manualPercent) / 100;
    const expectedTotal = promoted - manualDiscount;
    const reason = "Goodwill gesture";

    // Guards the arithmetic below: the order promotion must not apply to the promoted tee.
    expect(promoted).toBeLessThan(PROMOTIONS.order.subtotalAtLeast);

    const addDiscountButton = draft.summary.getByRole("button", { name: "Add Discount" });
    const subtotalAmount = draft.summary.getByTestId("order-subtotal-line").getByTestId("amount");
    const manualRow = draft.summary.getByRole("listitem").filter({ hasText: /^Manual/ });
    const promotionRow = draft.summary.getByRole("listitem").filter({ hasText: /^Promotion/ });

    // 2. Create a draft in Channel-USD
    await draft.create({ from: "drafts", channel: CHANNEL.name });
    await expect(subtotalAmount).toHaveText(money(0));
    await expect(addDiscountButton).toBeVisible();

    // Act & Assert
    await test.step("the tee's line is discounted by its catalogue promotion", async () => {
      // 3. Add one E2E Tee
      await draft.addProduct(PRODUCTS.tee);
      await expect(draft.total).toHaveText(money(promoted));
      await expect(draft.discountToggle).toContainText(money(teeDiscount));
      await expect(addDiscountButton).toBeHidden();
    });

    await test.step("the breakdown offers a manual order discount next to the line promotion", async () => {
      // 4. Expand the discount breakdown
      await draft.discountToggle.click();
      await expect(draft.summary.getByText("Order", { exact: true })).toBeVisible();
      await expect(addDiscountButton).toBeVisible();
      await expect(draft.summary.getByText("Lines", { exact: true })).toBeVisible();
      await expect(promotionRow).toContainText("(1 line)");
      await expect(promotionRow).toContainText(money(teeDiscount));
      await expect(draft.summary).not.toContainText(PROMOTIONS.order.name);
    });

    await test.step("the order discount dialog opens with a percentage selected", async () => {
      // 5. In the 'Order' subgroup click 'Add Discount'
      await addDiscountButton.click();
      await expect(draft.dialog).toContainText("Order discount");
      await expect(draft.dialog.getByRole("radio", { name: "Percentage" })).toBeChecked();
      await expect(draft.dialog.getByTestId("submit")).toBeDisabled();
    });

    await test.step("a 25% manual discount reduces the promoted total", async () => {
      // 6. Fill the value and reason, then confirm
      await draft.dialog.getByTestId("discount-value").fill(String(manualPercent));
      await draft.dialog.getByTestId("discount-reason").fill(reason);
      await draft.dialog.getByTestId("submit").click();
      await draft.dialog.waitFor({ state: "hidden" });

      await expect(page.getByText("Saved changes")).toBeVisible();
      await expect(draft.total).toHaveText(money(expectedTotal));
      await expect(draft.discountToggle).toContainText(money(teeDiscount + manualDiscount));
      await expect(subtotalAmount).toHaveText(money(expectedTotal));
      await expect(draft.summary.getByTestId("subtotal-before-discounts")).toBeVisible();
    });

    await test.step("the breakdown shows the manual discount alongside the line promotion", async () => {
      // 7. Read the summary. The breakdown's expanded state is local to the mounted summary, so it
      // stays expanded after the dialog is saved; clicking the toggle here would collapse it.
      await expect(manualRow).toBeVisible();
      await expect(manualRow).toContainText(money(manualDiscount));
      await expect(manualRow.getByRole("button", { name: `${manualPercent}%` })).toHaveAttribute(
        "title",
        reason,
      );
      await expect(promotionRow).toContainText("(1 line)");
      await expect(promotionRow).toContainText(money(teeDiscount));
    });

    await test.step("the manual discount is saved on the server", async () => {
      // 8. Reload the page and expand the breakdown again
      await page.reload();
      await expect(draft.total).toHaveText(money(expectedTotal));
      await expect(draft.discountToggle).toContainText(money(teeDiscount + manualDiscount));
      await draft.discountToggle.click();

      await expect(manualRow).toContainText(`${manualPercent}%`);
      await expect(manualRow).toContainText(money(manualDiscount));
      await expect(promotionRow).toContainText("(1 line)");
      await expect(promotionRow).toContainText(money(teeDiscount));
      await expect(draft.statusInfo).toHaveText("Draft");
    });
  });
});
