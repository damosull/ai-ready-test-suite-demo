import { expect, test } from "../../fixtures/test.ts";
import { DraftOrderPage } from "../../pages/draftOrderPage.ts";
import { CHANNEL, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Staff delete a draft they no longer need from the draft's menu. If deletion silently
 * failed, the drafts list would keep every abandoned draft, so the spec opens the draft's
 * address again and expects the not-found screen rather than the draft.
 */
test.use({ scenario: ORDERS_SCENARIO });

test("Staff deletes a draft order and it no longer opens #e2e", async ({ page }) => {
  // Arrange
  const draft = new DraftOrderPage(page);

  await draft.create({ from: "drafts", channel: CHANNEL.name });

  const draftUrl = page.url();

  // Act & Assert
  await test.step("confirming the deletion returns to the drafts list", async () => {
    await draft.delete();
    await expect(page).toHaveURL(url => url.pathname.endsWith("/orders/drafts"));
  });

  await test.step("the deleted draft's address shows the not-found screen", async () => {
    await page.goto(draftUrl);
    await expect(draft.notFoundMessage).toBeVisible();
    await expect(draft.statusInfo).toBeHidden();
  });
});
