// spec: specs/order-cancel-fulfillment.md
// seed: e2e/tests/seed.spec.ts

import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { OrderPage } from "../../pages/orderPage.ts";
import { findOrderId, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Cancelling a fulfillment from the fulfillment card's "Show more" menu restocks it to the
 * chosen warehouse and puts the order back to needing fulfillment.
 */
test.use({ scenario: ORDERS_SCENARIO });

const config = e2eConfig();

test.describe("Order fulfillment cancellation", () => {
  test("Cancelling a fulfillment returns the order to unfulfilled #e2e", async ({ page }) => {
    // Arrange
    const orderPage = new OrderPage(page);
    const fulfillmentMenuButton = page.getByTestId("fulfillment-menu-button");
    const cancelFulfillmentMenuItem = page.getByRole("menuitem", { name: "Cancel fulfillment" });
    const warehouseSelect = orderPage.dialog
      .getByTestId("cancel-fulfillment-select-field")
      .getByRole("combobox");
    const restockWarehouse = "Europe";

    // 1. Open the scenario's paid and fulfilled order
    await orderPage.goto(await findOrderId(config, "fulfilled"));
    await expect(orderPage.statusInfo).toHaveText("Fulfilled");
    await expect(orderPage.fulfillButton).toBeHidden();

    // Act
    await test.step("cancel the fulfillment, restocking to a chosen warehouse", async () => {
      // 2. Switch the order lines card to Timeline
      await orderPage.timelineView.click();

      // 3. Open the fulfillment card's "Show more" menu
      await fulfillmentMenuButton.click();

      // 4. Click "Cancel fulfillment"
      await cancelFulfillmentMenuItem.click();
      await expect(orderPage.dialog).toContainText("Cancel Fulfillment");

      // 5. Choose the warehouse to return the stock to
      await warehouseSelect.click();
      await page.getByRole("option", { name: restockWarehouse, exact: true }).click();
      // The warehouse combobox is a text input, so its selection is its value, not its text
      await expect(warehouseSelect).toHaveValue(restockWarehouse);

      // 6. Confirm and wait for the dialog to close
      await orderPage.dialog.getByTestId("submit").click();
      await orderPage.dialog.waitFor({ state: "hidden" });
    });

    // Assert
    await test.step("the order is unfulfilled again", async () => {
      // 7. Check the order state straight after confirming
      await expect(orderPage.statusInfo).toHaveText("Unfulfilled");
      await expect(orderPage.fulfillButton).toBeVisible();
      await expect(orderPage.fulfillButton).toHaveText("Fulfill");
      await expect(page.getByText(`Restocked 1 item to ${restockWarehouse}`)).toBeVisible();
    });

    await test.step("the unfulfilled state survives a reload", async () => {
      // 8. Reload the page and check the state again
      await page.reload();
      await orderPage.statusInfo.waitFor();
      await expect(orderPage.statusInfo).toHaveText("Unfulfilled");
      await expect(orderPage.fulfillButton).toBeVisible();
    });
  });
});
