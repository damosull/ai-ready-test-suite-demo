// spec: specs/promotion-remove-rule.md
// seed: e2e/tests/seed.spec.ts

import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { findPromotionId, ORDERS_SCENARIO, PROMOTIONS } from "../../scenarios/orders.ts";

/**
 * Removing a rule from a promotion (ticket 08). Mutates the seeded promotion, so it stays
 * untagged: the fixture restores the `orders` scenario before the test.
 */
test.use({ scenario: ORDERS_SCENARIO });

const config = e2eConfig();

test.describe("Promotion rules - removal", () => {
  test("Removing the only rule leaves the promotion in place with no rules #e2e", async ({
    page,
  }) => {
    // Arrange
    const promotionName = PROMOTIONS.catalogue.name;
    const promotionId = await findPromotionId(config, promotionName);
    const promotionPath = `/discounts/sales/${promotionId}`;

    // `discount-form` is set on the <form> and again on a wrapper inside it, so take the outer one.
    const form = page.getByTestId("discount-form").first();
    const header = page.getByTestId("page-header");
    const nameInput = page.getByTestId("discount-name-input");
    const rulesSection = page.getByTestId("discount-rules-section");
    const ruleList = rulesSection.getByTestId("rule-list");
    const rules = ruleList.getByTestId("added-rule");
    const emptyState = rulesSection.getByText("Add your first rule to set up a promotion");
    const deleteRuleDialog = page.getByTestId("delete-rule-dialog");
    const notifications = page.getByRole("region", { name: /Notifications/ });

    const isPromotionPage = (url: URL) => decodeURIComponent(url.pathname) === promotionPath;

    // 1. Open the "E2E Tee sale" promotion
    await page.goto(promotionPath);
    await expect(form).toBeVisible();
    await expect(page).toHaveURL(isPromotionPage);
    await expect(header).toContainText(promotionName);
    await expect(page.getByTestId("promotion-type-info")).toHaveText("Catalog");
    await expect(nameInput).toHaveValue(promotionName);

    // 2. Precondition check: exactly one rule is listed
    await expect(rules).toHaveCount(1);
    await expect(rules.getByTestId("rule-value-chip")).toHaveText(
      `${PROMOTIONS.catalogue.percent}%`,
    );
    await expect(rules.getByTestId("channel-display")).toHaveText("Channel-USD");
    await expect(emptyState).toBeHidden();

    // Act & Assert
    await test.step("the rule's delete button asks for confirmation", async () => {
      // 3. Click the rule card's delete button - never the save bar's, which deletes the promotion
      await rules.getByTestId("rule-delete-button").click();

      await expect(deleteRuleDialog).toBeVisible();
      await expect(deleteRuleDialog).toContainText("Delete rule");
      await expect(deleteRuleDialog).toContainText("Are you sure you want to delete this rule?");
      await expect(deleteRuleDialog.getByTestId("cancel-delete-rule-button")).toHaveText("Back");
      await expect(deleteRuleDialog.getByTestId("delete-rule-button")).toHaveText("Delete");
      await expect(rules).toHaveCount(1);
    });

    await test.step("confirming removes the rule and keeps the promotion", async () => {
      // 4. Confirm by clicking "Delete" inside the dialog
      await deleteRuleDialog.getByTestId("delete-rule-button").click();

      await expect(notifications.getByText("Rule deleted")).toBeVisible();
      await expect(deleteRuleDialog).toBeHidden();
      await expect(rules).toHaveCount(0);
      await expect(emptyState).toBeVisible();
      await expect(page).toHaveURL(isPromotionPage);
      await expect(header).toContainText(promotionName);
    });

    // Assert
    await test.step("after a reload the promotion still exists with no rules", async () => {
      // 5. Reload the page
      await page.reload();
      await expect(form).toBeVisible();

      await expect(page).toHaveURL(isPromotionPage);
      await expect(header).toContainText(promotionName);
      await expect(nameInput).toHaveValue(promotionName);
      await expect(rules).toHaveCount(0);
      await expect(emptyState).toBeVisible();
    });
  });
});
