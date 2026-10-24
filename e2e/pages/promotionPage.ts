import { type Page } from "@playwright/test";

/** A promotion's detail page: its general information and its rules. */
export class PromotionPage {
  readonly nameInput = this.page.getByTestId("discount-name-input");

  readonly rulesSection = this.page.getByTestId("discount-rules-section");

  readonly rules = this.page.getByTestId("added-rule");

  readonly deleteRuleDialog = this.page.getByTestId("delete-rule-dialog");

  constructor(readonly page: Page) {}

  async goto(promotionId: string) {
    await this.page.goto(`/discounts/sales/${promotionId}`);
    await this.nameInput.waitFor();
  }

  /**
   * Deletes the promotion's only rule - the scenario's rules are unnamed, so there is nothing
   * to pick one by, and a second rule fails the click rather than deleting the wrong one. The
   * dialog only closes once the server has deleted it.
   */
  async deleteOnlyRule() {
    await this.rules.getByTestId("rule-delete-button").click();
    await this.deleteRuleDialog.getByTestId("delete-rule-button").click();
    await this.deleteRuleDialog.waitFor({ state: "hidden" });
  }
}
