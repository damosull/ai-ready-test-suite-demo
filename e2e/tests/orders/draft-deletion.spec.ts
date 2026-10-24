import { expect, test } from "../../fixtures/test.ts";
import { DraftOrderPage } from "../../pages/draftOrderPage.ts";
import { CHANNEL, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Staff deleting a draft they no longer need, from the draft page's menu. If the deletion
 * silently failed, the drafts list would keep filling with orders nobody can get rid of, so
 * the draft's own address is opened again to prove it is gone on the server.
 */
test.use({ scenario: ORDERS_SCENARIO });

test("Staff deletes a draft order and it can no longer be opened #e2e", async ({ page }) => {
  // Arrange
  const draft = new DraftOrderPage(page);

  await draft.create({ from: "drafts", channel: CHANNEL.name });

  const draftUrl = page.url();

  // Act & Assert
  await test.step("delete the draft from its menu and land on the drafts list", async () => {
    await draft.delete();
    await expect(page).toHaveURL(/\/orders\/drafts\/?(\?.*)?$/);
  });

  await test.step("the deleted draft's address shows the not-found page", async () => {
    await page.goto(draftUrl);
    await expect(draft.notFoundMessage).toBeVisible();
    await expect(draft.statusInfo).toBeHidden();
  });
});
