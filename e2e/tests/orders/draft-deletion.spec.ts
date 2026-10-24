import { expect, test } from "../../fixtures/test.ts";
import { DraftOrderPage } from "../../pages/draftOrderPage.ts";
import { CHANNEL, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Covers deleting a draft order from the draft page's "More actions" menu, which had no e2e
 * coverage: a delete that silently failed would leave unwanted drafts piling up on the list.
 * The draft is started through the UI in Arrange, as the other draft specs do.
 */
test.use({ scenario: ORDERS_SCENARIO });

test("Staff delete a draft order from its menu after confirming #e2e", async ({ page }) => {
  // Arrange
  const draft = new DraftOrderPage(page);

  await draft.create({ from: "drafts", channel: CHANNEL.name });

  // The id is minted by this test, so the address is read rather than built.
  const draftUrl = page.url();

  expect(new URL(draftUrl).pathname).toMatch(/^\/orders\/drafts\/[^/]+$/);

  // Act & Assert
  await test.step("deleting the draft from its menu takes staff back to the drafts list", async () => {
    await draft.delete();
    await expect(page).toHaveURL(/\/orders\/drafts(\?|$)/);
    await expect(draft.dialog).toBeHidden();
    await expect(draft.createDraftButton).toBeVisible();
  });

  await test.step("the deleted draft's address shows the not-found screen", async () => {
    await page.goto(draftUrl);
    await expect(draft.notFoundMessage).toBeVisible();
    await expect(draft.goBackToDashboardButton).toBeVisible();
    await expect(draft.statusInfo).toHaveCount(0);
    await expect(page).toHaveURL(draftUrl);
  });
});
