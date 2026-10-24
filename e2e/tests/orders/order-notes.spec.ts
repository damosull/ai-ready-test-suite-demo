// spec: specs/order-notes.plan.md
// seed: e2e/tests/seed.spec.ts
import { randomUUID } from "node:crypto";

import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { OrderPage } from "../../pages/orderPage.ts";
import { findOrderId, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * A customer-service staff member whose only permission is MANAGE_ORDERS leaves a note in an
 * order's history (ticket 05). Runs as the `order` actor (order.manager@example.com), not the
 * superuser.
 */
// 1. Sign in as the order staff user (MANAGE_ORDERS only) on the orders scenario
test.use({ actor: "order", scenario: ORDERS_SCENARIO });

const config = e2eConfig();

test.describe("Order history notes (order staff, MANAGE_ORDERS only)", () => {
  test("Order staff adds a note to the unpaid order's history and it persists after reload #e2e", async ({
    page,
  }) => {
    // Arrange
    // 2. Build a unique note text and resolve the unpaid order
    const noteText = `Customer called, wants delivery after 5pm (e2e-${randomUUID()})`;
    const orderId = await findOrderId(config, "unpaid");
    const orderPage = new OrderPage(page);
    const commentInput = page.getByRole("textbox", { name: "Comment" });
    const addCommentButton = page.getByRole("button", { name: "Add Comment" });
    // The innermost element holding both the title and the comment box is the Order History
    // card - not the customer "Notes" card on the right.
    const history = page
      .locator("div")
      .filter({ hasText: "Order History" })
      .filter({ has: commentInput })
      .last();

    // 3. Open the order
    await orderPage.goto(orderId);
    await expect(orderPage.statusInfo).toHaveText("Unfulfilled");
    await expect(history).toBeVisible();
    await expect(commentInput).toBeEmpty();
    await expect(addCommentButton).toBeDisabled();

    // Act
    // 5. Fill the Comment textbox with the unique note text and click Add Comment
    await commentInput.fill(noteText);
    await expect(addCommentButton).toBeEnabled();
    await addCommentButton.click();

    // Assert
    await expect(page.getByText("Note added")).toBeVisible();
    await expect(commentInput).toBeEmpty();
    await expect(addCommentButton).toBeDisabled();

    // 6. The note is shown once in the Order History card
    await expect(history.getByText(noteText, { exact: true })).toHaveCount(1);
    await expect(history.getByText(noteText, { exact: true })).toBeVisible();
    await expect(history.getByText("added", { exact: true }).first()).toBeVisible();

    // 7. Reload the page and wait for status-info
    await page.reload();
    await orderPage.statusInfo.waitFor();

    // 8. The note persisted server-side and appears exactly once
    await expect(history.getByText(noteText, { exact: true })).toBeVisible();
    await expect(history.getByText(noteText, { exact: true })).toHaveCount(1);
  });
});
