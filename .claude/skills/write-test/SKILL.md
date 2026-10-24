---
name: write-test
description: Turn a ticket into a Playwright e2e spec for the Saleor Dashboard's `e2e/` suite, built on the suite's own scenarios, actors, page objects, fixture and database reset. Use when asked to write, add or implement e2e/Playwright test coverage for a ticket or behaviour.
---

# Write an e2e test from a ticket

The output is a test this team would merge: it runs on the suite's machinery, reads like the
specs already in `e2e/tests/orders/`, and fails if the feature in the ticket breaks.

Work through the steps in order. Do not skip step 6.

## 1. Read the ticket and the suite

1. Read the ticket. Write down each acceptance criterion; each one becomes an assertion.
2. Read, in full: `e2e/fixtures/test.ts`, `e2e/scenarios/orders.ts`, `e2e/lib/actors.ts`, every
   file in `e2e/pages/`, and the spec closest to the ticket in `e2e/tests/orders/`. They are short.
3. Skim `CONVENTIONS.md` and `CHECKLIST.md` at the repository root. The rules in `CLAUDE.md`
   ("E2E tests") are the summary.

## 2. Decide the data and the actor

- **Scenario.** Use the scenario that already holds what the ticket needs. `orders` has
  `PRODUCTS.tee` (on the `PROMOTIONS.catalogue` sale) and `PRODUCTS.hoodie`, the
  `PROMOTIONS.order` threshold promotion, `CUSTOMER`, `CHANNEL`, and the `unpaid` and
  `fulfilled` orders you reach with `findOrderId(config, "<key>")`. Import the constants; do not
  retype names or prices.
- **Do not arrange with API calls in the spec**, and do not re-create something the scenario
  has. If a ticket truly needs a state no scenario has, add it to the scenario (through the
  GraphQL API, with `assertNoMutationErrors`), not to the spec. A draft is the exception: start
  it with `DraftOrderPage.create({ from: "drafts", channel: CHANNEL.name })`.
- **Actor.** `admin` unless the ticket names a role. For a role, use the single-permission actor
  from `e2e/lib/actors.ts` (`order` is `order.manager@example.com`) with
  `test.use({ actor: "order" })`. Never sign in through the form.

## 3. Find the UI

The dashboard's source is in `src/`. For each step of the ticket:

1. Find the component and its `data-test-id`s: `grep -rn 'data-test-id=' src/orders/components/<Area>`.
   Check whether the locator already exists on a page object before adding it.
2. Note what the screen shows after the action (status text, totals, a section), and which
   element proves the step finished (a dialog closing, the URL changing, a status changing).
3. Where there is no test id, use `getByRole` with the accessible name the component renders
   (look for its `defaultMessage`). Never a CSS class, XPath or a positional index.

If you cannot tell from the source what the page renders, run the spec and read the failure:
the error context and trace under `e2e/test-results/` show the page.

## 4. Extend the page object

Add what the ticket needs to the page object that covers the screen: `DraftOrderPage` for
drafts, `OrderPage` for placed orders, `AddressDialog` for the address dialog. Follow the file's
existing shape:

```ts
// From e2e/pages/orderPage.ts
readonly addTrackingButton = this.page.getByTestId("add-tracking-button");

async addTracking(trackingNumber: string) {
  await this.timelineView.click();
  await this.addTrackingButton.click();
  await this.trackingNumberInput.fill(trackingNumber);
  await this.confirmTrackingButton.click();
  await this.dialog.waitFor({ state: "hidden" });
}
```

- Fields are `readonly` and built from `this.page` (or a container field such as `this.dialog`).
- Methods are named for the user's action and end by waiting for the state that proves it
  finished. Never `waitForTimeout`.
- Reuse what is there: `this.dialog`, `this.option`, `statusInfo`, `total`, `summary`,
  `discountToggle`, `fulfillButton`, `goto`, `create`, `addProduct`.
- No new page-object class unless the screen has none.

## 5. Write the spec

Put it in `e2e/tests/orders/` (or the area's folder), named for the behaviour in kebab case.

```ts
import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { OrderPage } from "../../pages/orderPage.ts";
import { findOrderId, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * What the spec covers, in a sentence or two, and why it matters.
 */
test.use({ scenario: ORDERS_SCENARIO });

const config = e2eConfig();

test("Staff does the thing and sees the outcome #e2e", async ({ page }) => {
  // Arrange
  const orderPage = new OrderPage(page);

  await orderPage.goto(await findOrderId(config, "unpaid"));

  // Act & Assert
  await test.step("the action the ticket describes", async () => {
    await orderPage.doTheThing();
    await expect(orderPage.statusInfo).toHaveText("Expected status");
  });

  await test.step("it is saved, not just shown", async () => {
    await page.reload();
    await expect(orderPage.statusInfo).toHaveText("Expected status");
  });
});
```

- One test per story, one `test.step` per stage. Title is a sentence ending in `#e2e`.
- Web-first assertions only (`await expect(locator)...`). Compute expected money from the
  scenario constants and compare with `.toFixed(2)`; guard arithmetic the way
  `draft-pricing.spec.ts` does when a threshold matters.
- Every acceptance criterion is asserted. Where the ticket says the change is saved, reload and
  assert again.
- No `afterEach`, no cleanup, no timestamps in names, no `retries`, no extra `timeout`s.
- Comments explain why, never narrate the next line.

## 6. Prove it

1. `pnpm run check-types:e2e` is clean.
2. `pnpm e2e tests/orders/<your-spec>.spec.ts --repeat-each=3` passes all three. Fix the cause of
   any failure; do not add waits or retries to get past it.
3. For each assertion, ask: if the server never applied this change, would this line fail? An
   assertion on something the UI does regardless (a dialog closing, a toast, a navigation, a field
   still holding what was typed) does not count. The reload step is what makes most of them count.
4. Run the `review-test` skill on your change and fix everything it reports, then repeat 1 and 2.

Hand back: the files changed, which acceptance criterion each assertion covers, and the
three-run result.
