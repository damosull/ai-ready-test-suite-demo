import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { OrderPage } from "../../pages/orderPage.ts";
import { findOrderId, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Cancelling a fulfillment of a paid, fulfilled order, restocking to a chosen warehouse. The
 * order must go back to needing fulfillment and stay that way after a reload. This is the
 * reverse of the fulfil step in order-payment-fulfillment.spec.ts, which never undoes it.
 */
test.use({ scenario: ORDERS_SCENARIO });

const config = e2eConfig();

test("Cancelling a fulfillment puts the order back to Unfulfilled #e2e", async ({ page }) => {
  // Arrange
  const orderPage = new OrderPage(page);

  await orderPage.goto(await findOrderId(config, "fulfilled"));
  // Preconditions: without them the "Unfulfilled" and fulfil-button checks below would not
  // prove that the cancellation caused them.
  await expect(orderPage.statusInfo).toHaveText("Fulfilled");
  await expect(orderPage.fulfillButton).toHaveCount(0);

  // Act & Assert
  await test.step("cancel the fulfillment, restocking to a warehouse", async () => {
    await orderPage.cancelFulfillment();
  });

  await test.step("the order needs fulfilling again", async () => {
    await expect(orderPage.statusInfo).toHaveText("Unfulfilled");
    await expect(orderPage.fulfillButton).toBeVisible();
  });

  await test.step("it stays unfulfilled after a reload", async () => {
    await page.reload();
    await expect(orderPage.statusInfo).toHaveText("Unfulfilled");
    await expect(orderPage.fulfillButton).toBeVisible();
  });
});
