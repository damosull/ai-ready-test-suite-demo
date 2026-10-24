import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { OrderPage } from "../../pages/orderPage.ts";
import { findOrderId, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Customer service staff leave each other notes in an order's history. They hold only the
 * order-management permission, so this runs as that staff user rather than the superuser:
 * the note has to be addable, and saved, without any other permission.
 */
test.use({ scenario: ORDERS_SCENARIO, actor: "order" });

const config = e2eConfig();

test("Order staff add a note that is saved in the order history #e2e", async ({ page }) => {
  // Arrange
  const orderPage = new OrderPage(page);
  const note = "Customer called, wants delivery after 5pm";

  await orderPage.goto(await findOrderId(config, "unpaid"));

  // Act & Assert
  await test.step("the note shows in the history", async () => {
    await orderPage.addNote(note);
    await expect(orderPage.historyNote(note)).toBeVisible();
  });

  await test.step("it is saved, not just shown", async () => {
    await page.reload();
    await expect(orderPage.historyNote(note)).toBeVisible();
  });
});
