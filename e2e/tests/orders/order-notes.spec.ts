import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { OrderPage } from "../../pages/orderPage.ts";
import { findOrderId, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Customer service staff leave notes for each other in the order history. They hold only the
 * order-management permission, so the spec runs as that staff user rather than the superuser.
 */
test.use({ scenario: ORDERS_SCENARIO, actor: "order" });

const config = e2eConfig();

test("Order staff add a note that stays in the order history #e2e", async ({ page }) => {
  // Arrange
  const orderPage = new OrderPage(page);
  const note = "Customer called, wants delivery after 5pm";

  await orderPage.goto(await findOrderId(config, "unpaid"));

  // Act & Assert
  await test.step("add a note", async () => {
    await orderPage.addNote(note);
    await expect(orderPage.history).toContainText(note);
  });

  await test.step("the note is saved, not just shown", async () => {
    await page.reload();
    await expect(orderPage.history).toContainText(note);
  });
});
