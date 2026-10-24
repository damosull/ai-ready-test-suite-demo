import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { OrderPage } from "../../pages/orderPage.ts";
import { findOrderId, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Cancelling an order a customer changed their mind about before it was paid or shipped. A
 * regression leaves staff with orders they cannot close and stock that stays allocated.
 */
test.use({ scenario: ORDERS_SCENARIO });

const config = e2eConfig();

test("Staff cancels an unpaid, unfulfilled order and it can no longer be fulfilled #e2e", async ({
  page,
}) => {
  // Arrange
  const orderPage = new OrderPage(page);

  await orderPage.goto(await findOrderId(config, "unpaid"));
  // Without this the "no fulfil action" check below would also pass on a page that never offered it.
  await expect(orderPage.statusInfo).toHaveText("Unfulfilled");
  await expect(orderPage.fulfillButton).toBeVisible();

  // Act & Assert
  await test.step("cancel from the order's menu", async () => {
    await orderPage.cancel();
    await expect(orderPage.statusInfo).toHaveText("Cancelled");
    await expect(orderPage.fulfillButton).toBeHidden();
  });

  await test.step("the cancellation is saved", async () => {
    await page.reload();
    await expect(orderPage.statusInfo).toHaveText("Cancelled");
    await expect(orderPage.fulfillButton).toBeHidden();
  });
});
