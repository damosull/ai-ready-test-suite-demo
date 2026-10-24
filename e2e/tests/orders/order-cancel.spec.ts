import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { OrderPage } from "../../pages/orderPage.ts";
import { findOrderId, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Staff cancelling an unpaid, unfulfilled order (ticket 03). Cancelling had no e2e coverage,
 * and a regression there leaves orders staff cannot close, with their stock still allocated.
 * Dismissing the dialog ("Keep order") and cancelling paid or fulfilled orders are separate
 * stories and deliberately not covered here.
 */
test.use({ scenario: ORDERS_SCENARIO });

const config = e2eConfig();

test("Cancel an unpaid, unfulfilled order #e2e", async ({ page }) => {
  // Arrange
  const orderPage = new OrderPage(page);

  await orderPage.goto(await findOrderId(config, "unpaid"));

  // Act & Assert
  // Precondition, so the later "fulfil button gone" assertions cannot pass vacuously.
  await test.step("the unpaid order can be fulfilled", async () => {
    await expect(orderPage.statusInfo).toHaveText("Unfulfilled");
    await expect(orderPage.fulfillButton).toBeVisible();
  });

  await test.step("cancel from the menu and confirm", async () => {
    await orderPage.cancel();
    await expect(orderPage.dialog).toBeHidden();
    await expect(orderPage.statusInfo).toHaveText("Cancelled");
    await expect(orderPage.fulfillButton).toHaveCount(0);
  });

  await test.step("the cancellation persists", async () => {
    await page.reload();
    // The status is asserted first: it proves the reloaded order has rendered, so the
    // absent fulfil button is a property of the order rather than of a page still loading.
    await expect(orderPage.statusInfo).toHaveText("Cancelled");
    await expect(orderPage.fulfillButton).toHaveCount(0);
  });
});
