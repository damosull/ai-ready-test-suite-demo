import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { OrderPage } from "../../pages/orderPage.ts";
import { findOrderId, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Cancelling an order the customer no longer wants, before it is paid or shipped. If it
 * breaks, staff are left with orders they cannot close and stock that stays allocated.
 */
test.use({ scenario: ORDERS_SCENARIO });

const config = e2eConfig();

test("Staff cancels an unpaid, unfulfilled order and it can no longer be fulfilled #e2e", async ({
  page,
}) => {
  // Arrange
  const orderPage = new OrderPage(page);

  await orderPage.goto(await findOrderId(config, "unpaid"));
  // Without this the absence asserted below would prove nothing.
  await expect(orderPage.statusInfo).toHaveText("Unfulfilled");
  await expect(orderPage.fulfillButton).toBeVisible();

  // Act & Assert
  await test.step("cancel from the order's menu and confirm", async () => {
    await orderPage.cancel();
    await expect(orderPage.statusInfo).toHaveText("Cancelled");
    await expect(orderPage.fulfillButton).toHaveCount(0);
  });

  await test.step("it stays cancelled after a reload", async () => {
    await page.reload();
    await expect(orderPage.statusInfo).toHaveText("Cancelled");
    await expect(orderPage.fulfillButton).toHaveCount(0);
  });
});
