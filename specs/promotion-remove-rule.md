# Discounts: staff can remove a rule from a promotion (ticket 08)

## Application Overview

Covers ticket tickets/08.md. Staff opens the "E2E Tee sale" catalogue promotion seeded by the `orders` scenario (exactly one rule: Channel-USD, 20% off, product "E2E Tee"), deletes that rule from the rule card's delete button, confirms in the "Delete rule" dialog, and verifies the promotion survives with no rules, both immediately and after a reload.

GENERATOR NOTES (conventions to follow)

Target file: e2e/tests/discounts/promotion-remove-rule.spec.ts (new `discounts/` folder alongside `tests/orders/`).
Seed file for agents: e2e/tests/seed.spec.ts. Note that the seed runs on the `default` scenario, which does NOT contain "E2E Tee sale". The generated spec must declare `test.use({ scenario: ORDERS_SCENARIO })`, importing `ORDERS_SCENARIO` and `PROMOTIONS` from e2e/scenarios/orders.ts. Use `PROMOTIONS.catalogue.name` ("E2E Tee sale"), not a string literal.
Imports: `import { expect, test } from "../../fixtures/test.ts"`. The actor defaults to `admin`, which is fine here. Put `// Arrange`, `// Act`, `// Assert` comments in the test (or `// Act & Assert` with `test.step`, as the orders specs do). Add a `#e2e` suffix to the test title, as the existing specs do.
Test data and isolation: the fixture `seed` restores the scenario dump before every untagged test, and those tests run serially. This test MUTATES seeded data (it deletes a rule), so it must NOT be tagged `parallel(...)`. No cleanup is needed: the next test gets a fresh restore. No scenario changes are needed because the promotion and its single rule already exist in the `orders` scenario. Promotion ids differ per dump build, so never hard-code an id.
Opening the promotion: the promotions list (/discounts/sales) is a canvas datagrid with no DOM row links. Prefer a read-only GraphQL lookup, mirroring `findOrderId` in e2e/scenarios/orders.ts: add `findPromotionId(config, name)` there using `gql` and `adminToken` from e2e/lib/graphql.ts, querying `promotions(first: 1, where: { name: { eq: $name } }) { edges { node { id } } }` and throwing if it is missing. Then `page.goto(`/discounts/sales/${id}`)`. (Alternative path verified manually: go to /discounts/sales?query=E2E%20Tee%20sale and click the single grid row; the URL becomes /discounts/sales/<id>. Clicking canvas cells is brittle, so avoid it.)
Page object: add e2e/pages/promotionPage.ts in the README's style (readonly fields from `this.page`, `constructor(readonly page: Page) {}`). Port only what is needed from e2e-legacy/pages/discountsPage.ts and dialogs/deleteRuleDialog.ts. Do not edit e2e-legacy. Do NOT port `rule-label-with-actions`: that test id no longer exists in the UI.

VERIFIED LOCATORS (data-test-id, configured as testIdAttribute)
- Page form: `discount-form`. Header: `page-header` (text "E2E Tee sale", plus the "Catalog" type and "Active" status badges, `promotion-type-info` and `promotion-status-info`).
- Name input: `discount-name-input` (role textbox "Discount name"), value "E2E Tee sale".
- Rules card: `discount-rules-section` (heading "Rules", `add-rule` button "Add rule"). The list container is `rule-list`, and each rule card is `added-rule`.
- Within a rule card: `rule-name` ("Untitled rule", because the seeded rule has no name), `channel-display` ("Channel-USD"), `rule-value-chip` ("20%"), `rule-edit-button` (button "Edit"), `rule-delete-button` (button "Delete"), and `rule-summary` ("Applies to / Products / E2E Tee").
- Confirmation dialog: role dialog, `delete-rule-dialog`, title "Delete rule", body "Are you sure you want to delete this rule?". Buttons are `delete-rule-button` (role button "Delete"), `cancel-delete-rule-button` ("Back"), and `close-button` ("Close").
- Empty state after deletion: `rule-list` remains, with zero `added-rule` children and the text "Add your first rule to set up a promotion".
- Toast: "Success" / "Rule deleted" in the "Notifications alt+T" region.

PITFALL: the page has TWO buttons named "Delete". The save bar's `button-bar-delete` deletes the WHOLE PROMOTION. Always scope the rule delete with `getByTestId("rule-delete-button")` (or within `added-rule`), and confirm with `getByTestId("delete-rule-dialog").getByTestId("delete-rule-button")`. Never use `getByRole("button", { name: "Delete" })` unscoped. Deletion takes effect immediately; no Save is needed (the Save button stays disabled).

Exploration note: the flow was explored at http://localhost:9200 on the stable target. The agent seed restores `default`, so an equivalent one-rule "E2E Tee sale" catalogue promotion was created via the API for exploration. The UI, test ids and texts come from that run. In the real `orders` scenario, the rule's product summary reads "E2E Tee".

## Test Scenarios

### 1. Promotion rules - removal

**Seed:** `e2e/tests/seed.spec.ts`

#### 1.1. Removing the only rule leaves the promotion in place with no rules #e2e

**File:** `e2e/tests/discounts/promotion-remove-rule.spec.ts`

**Steps:**
  1. Arrange: start from a fresh restore of the `orders` scenario (`test.use({ scenario: ORDERS_SCENARIO })`, untagged so the database is reset before the test) while signed in as the default `admin` actor. Look up the id of the promotion named `PROMOTIONS.catalogue.name` ("E2E Tee sale") with a read-only GraphQL helper (`findPromotionId`), then navigate to `/discounts/sales/<id>` and wait for `discount-form` to be visible.
    - expect: The URL is /discounts/sales/<promotion id>
    - expect: `page-header` contains "E2E Tee sale" and the type badge `promotion-type-info` reads "Catalog"
    - expect: `discount-name-input` has the value "E2E Tee sale"
  2. Precondition check: inspect the Rules card (`discount-rules-section`).
    - expect: Exactly one rule card is shown: `rule-list` contains one `added-rule` (toHaveCount(1))
    - expect: That card shows `rule-value-chip` "20%" and `channel-display` "Channel-USD"
    - expect: The "Add your first rule to set up a promotion" empty-state text is not visible
  3. Act: inside the single `added-rule` card, click the rule's delete button (`rule-delete-button`, an icon button with accessible name "Delete"). Do NOT click the save-bar "Delete" (`button-bar-delete`), which deletes the whole promotion.
    - expect: A dialog (`delete-rule-dialog`, role dialog) opens with the title "Delete rule" and the text "Are you sure you want to delete this rule?"
    - expect: The dialog offers "Back" (`cancel-delete-rule-button`) and "Delete" (`delete-rule-button`) buttons
    - expect: The rule is still listed while the dialog is open
  4. Act: confirm by clicking "Delete" inside the dialog (`delete-rule-dialog` -> `delete-rule-button`).
    - expect: The dialog closes (`delete-rule-dialog` is hidden)
    - expect: A success notification "Rule deleted" appears
    - expect: `added-rule` has count 0 within `rule-list`
    - expect: The Rules card shows the empty state "Add your first rule to set up a promotion"
    - expect: The page is still the promotion detail page (the URL is unchanged), with `page-header` still "E2E Tee sale"; the app did not navigate to the promotions list
  5. Assert persistence: reload the page (`page.reload()`) and wait for `discount-form` to be visible.
    - expect: The URL is still /discounts/sales/<same promotion id> and the page loads rather than showing a not-found state, so the promotion was not deleted
    - expect: `page-header` contains "E2E Tee sale" and `discount-name-input` has the value "E2E Tee sale"
    - expect: `added-rule` has count 0, and "Add your first rule to set up a promotion" is visible in `discount-rules-section`
