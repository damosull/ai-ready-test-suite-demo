import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { OrderPage } from "../../pages/orderPage.ts";
import { findOrderId, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Cancelling a fulfillment made by mistake, or for a parcel never collected. The stock goes
 * back to a warehouse and the order must need fulfilling again, or it is stuck as shipped.
 * `order-payment-fulfillment.spec.ts` covers fulfilling; this covers undoing it.
 */
test.use({ scenario: ORDERS_SCENARIO });

const config = e2eConfig();

test("Cancelling a fulfillment puts the order back to unfulfilled #e2e", async ({ page }) => {
  // Arrange
  const orderPage = new OrderPage(page);

  await orderPage.goto(await findOrderId(config, "fulfilled"));
  await expect(orderPage.statusInfo).toHaveText("Fulfilled");
  await expect(orderPage.fulfillButton).toBeHidden();

  // Act & Assert
  await test.step("cancel the fulfillment, restocking a warehouse", async () => {
    await orderPage.cancelFulfillment();
    await expect(orderPage.statusInfo).toHaveText("Unfulfilled");
    await expect(orderPage.fulfillButton).toBeEnabled();
  });

  await test.step("the order is still unfulfilled after a reload", async () => {
    await page.reload();
    await expect(orderPage.statusInfo).toHaveText("Unfulfilled");
    await expect(orderPage.fulfillButton).toBeEnabled();
  });
});
