# Order cancel: staff cancel an unpaid, unfulfilled order (ticket 03)

## Application Overview

Covers ticket `tickets/03.md`: a staff member (the default `admin` actor) cancels the orders scenario's unpaid, unfulfilled order from the order page's "More actions" menu, confirms in the dialog, and the order ends up "Cancelled", can no longer be fulfilled, and stays cancelled after a reload.

TARGET FILE: `e2e/tests/orders/order-cancel.spec.ts` - one test, one user story, a `test.step` per stage.

HOW IT FITS THE E2E CONVENTIONS (CLAUDE.md, "E2E conventions"):
- Import `test`/`expect` from `../../fixtures/test.ts`, `e2eConfig` from `../../config.ts`, `OrderPage` from `../../pages/orderPage.ts`, `findOrderId` and `ORDERS_SCENARIO` from `../../scenarios/orders.ts` (relative imports with `.ts`).
- `test.use({ scenario: ORDERS_SCENARIO });` at file level. Default actor (`admin`), so no `actor` override and no UI sign-in.
- The order comes from `await findOrderId(config, "unpaid")` (`SCENARIO_ORDERS.unpaid`: one E2E Tee, unpaid, unfulfilled, looked up by `e2e` metadata). No hard-coded ids, no populatedb orders, no new order, no new scenario, no API writes in the spec.
- The database is restored before the test by the fixture: no cleanup, no `afterEach`, no unique names. Not tagged `parallel()` (the test writes). No retries, no timeout changes, no `waitForTimeout`, no `networkidle`.
- File opens with a comment saying what it covers and why (ticket 03: no e2e coverage of cancelling; a regression leaves orders staff cannot close and stock allocated).
- Title, e.g. `"Cancel an unpaid, unfulfilled order #e2e"`.
- `// Arrange` then `// Act & Assert` comments, like `order-payment-fulfillment.spec.ts`.
- All assertions web-first (`await expect(locator)...`).

PAGE OBJECT CHANGES (extend the existing `e2e/pages/orderPage.ts`, not a new class or a spec-local helper):
- `readonly moreActionsButton = this.page.getByTestId("page-header").getByTestId("show-more-button");` - scoped to the page header because `show-more-button` occurs 3 times on the order page (the header menu plus two in the lines datagrid). The `TopNav.Menu dataTestId="menu"` prop is NOT rendered to the DOM, so `getByTestId("menu")` matches nothing; do not use it. Accessible name of the trigger is "More actions" (role fallback: `getByTestId("page-header").getByRole("button", { name: "More actions" })`).
- `readonly cancelOrderMenuItem = this.page.getByTestId("cancel-order");` - an `li[role=menuitem]` with text "Cancel order", rendered in a portal (a `role=menu` outside the header), so it is located from `this.page`, not from the header. Only rendered while the order can be cancelled (it disappears from the menu once the order is cancelled).
- Reuse the existing `readonly dialog = this.page.getByRole("dialog")`. The confirmation dialog has no `data-test-id` on its root and no accessible name; its header's `data-test-id="dialog-title"` is NOT forwarded to the DOM. Title text "Cancel order #<number>", subtitle "Important: Refunds need to be issued manually after order cancelation.", buttons "Keep order" (`data-test-id="back"`) and "Cancel order" (`data-test-id="submit"`, ConfirmButton with `data-test-state`). Opening it adds `?action=cancel` to the URL.
- Confirm button: `this.dialog.getByTestId("submit")` - scoped to the dialog, as `markAsPaid` does, because `submit` exists on many screens.
- Existing `statusInfo` (`getByTestId("status-info")`) and `fulfillButton` (`getByTestId("order-items-fulfill-button")`) are used unchanged.
- New method, named for the user's action:
  ```ts
  async cancel() {
    await this.moreActionsButton.click();
    await this.cancelOrderMenuItem.click();
    await this.dialog.getByTestId("submit").click();
    await this.dialog.waitFor({ state: "hidden" });
  }
  ```
  (Matches the `markAsPaid` / `addTracking` pattern: the dialog closing is the named signal that the mutation round-trip finished; the spec then asserts the outcome.)

OBSERVED BEHAVIOUR (explored on a populatedb unpaid/unfulfilled order with the same page; the plan itself uses only the scenario order):
- Before: `status-info` reads "Unfulfilled"; `order-items-fulfill-button` ("Fulfill") is rendered and visible. Note: on the explored populatedb order it was rendered disabled, so the precondition asserts visibility, not enabled-ness.
- After confirming: the dialog closes, URL returns to `/orders/<id>` (no `?action=cancel`), `status-info` reads "Cancelled", `order-items-fulfill-button` is removed from the DOM entirely (count 0; only "Return" remains in that toolbar), the "Cancel order" menu item is no longer offered (menu only has "Open this order in GraphiQL"), and Order History shows "Order was cancelled by admin@example.com".
- After `page.reload()`: `status-info` still reads "Cancelled" and the fulfil button is still absent.

Locator summary:
| Element | Locator |
|---|---|
| Order page menu (kebab) trigger | `getByTestId("page-header").getByTestId("show-more-button")` (button "More actions") |
| "Cancel order" menu item | `getByTestId("cancel-order")` (role menuitem, name "Cancel order") |
| Confirmation dialog | `getByRole("dialog")` (existing `OrderPage.dialog`) |
| Dialog confirm button | `dialog.getByTestId("submit")` (button "Cancel order") |
| Dialog dismiss button | `dialog.getByTestId("back")` (button "Keep order") - not used by this test |
| Status pill | `getByTestId("status-info")` (existing `OrderPage.statusInfo`) |
| Fulfil button | `getByTestId("order-items-fulfill-button")` (existing `OrderPage.fulfillButton`) |

OUT OF SCOPE (deliberately, to keep one story per ticket): "Keep order" dismissal, cancelling paid/fulfilled orders, stock de-allocation checks, permission actors. These are candidates for separate tickets.

## Test Scenarios

### 1. Order cancellation

**Seed:** `e2e/tests/seed.spec.ts`

#### 1.1. Cancel an unpaid, unfulfilled order #e2e

**File:** `e2e/tests/orders/order-cancel.spec.ts`

**Steps:**
  1. Arrange: file-level `test.use({ scenario: ORDERS_SCENARIO })`, `const config = e2eConfig()`. In the test, `const orderPage = new OrderPage(page)` and `await orderPage.goto(await findOrderId(config, "unpaid"))` (goto already waits for `status-info`). Default `admin` actor; no sign-in, no order creation, no API writes.
    - expect: The scenario's unpaid order page at `/orders/<id>` loads (id resolved at test time by `e2e` metadata, never hard-coded)
  2. test.step("the unpaid order can be fulfilled") - precondition, so a later 'fulfil button gone' assertion cannot pass vacuously.
    - expect: `await expect(orderPage.statusInfo).toHaveText("Unfulfilled")`
    - expect: `await expect(orderPage.fulfillButton).toBeVisible()`
  3. test.step("cancel from the menu and confirm") - `await orderPage.cancel()`: clicks `getByTestId("page-header").getByTestId("show-more-button")`, clicks `getByTestId("cancel-order")`, clicks `dialog.getByTestId("submit")` ("Cancel order"), waits for the dialog to be hidden.
    - expect: `await expect(orderPage.dialog).toBeHidden()`
    - expect: `await expect(orderPage.statusInfo).toHaveText("Cancelled")`
    - expect: `await expect(orderPage.fulfillButton).toBeHidden()` (the button is removed from the DOM after cancelling; `toHaveCount(0)` is an equally valid, stricter alternative)
  4. test.step("the cancellation persists") - `await page.reload()` then `await orderPage.statusInfo.waitFor()` (or call `orderPage.goto(orderId)` again, keeping the id in a const from Arrange).
    - expect: `await expect(orderPage.statusInfo).toHaveText("Cancelled")`
    - expect: `await expect(orderPage.fulfillButton).toBeHidden()`
