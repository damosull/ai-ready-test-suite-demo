import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { OrderPage } from "../../pages/orderPage.ts";
import { findOrderId, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Order notes left by a staff member whose only permission is order management
 * (MANAGE_ORDERS): the note appears in the order history and is still there after a reload.
 * This is the first order spec that runs as a non-superuser, so it also proves the session
 * is not the admin's rather than trusting `test.use` alone.
 */
test.use({ scenario: ORDERS_SCENARIO, actor: "order" });

const config = e2eConfig();

test("Order staff can leave a note that stays in the order history #e2e", async ({ page }) => {
  // Arrange
  const orderPage = new OrderPage(page);
  const note = "Customer called, wants delivery after 5pm";

  await orderPage.goto(await findOrderId(config, "unpaid"));

  // Act & Assert
  await test.step("signed in with only the order permission", async () => {
    // Catalog needs a product or gift-card permission, so a superuser session fails here.
    await expect(orderPage.catalogMenuItem).toBeHidden();
    // Positive control: the sidebar rendered, so the hidden check above is meaningful.
    await expect(orderPage.orderDraftsMenuItem).toBeVisible();
  });

  await test.step("add a note", async () => {
    await orderPage.addNote(note);
    await expect(orderPage.historyNote(note)).toBeVisible();
    await expect(orderPage.noteInput).toHaveValue("");
  });

  await test.step("the note survives a reload", async () => {
    await page.reload();
    await orderPage.statusInfo.waitFor();
    // Only the API can have put the note back after a reload; exactly once rules out a double save.
    await expect(orderPage.historyNote(note)).toHaveCount(1);
    await expect(orderPage.historyNote(note)).toBeVisible();
  });
});
