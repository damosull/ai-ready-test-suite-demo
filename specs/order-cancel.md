# Order cancel - staff can cancel an unpaid, unfulfilled order (ticket 03)

## Application Overview

Ticket 03 (Orders, High): there is no e2e coverage of cancelling an order. Staff cancel from the order page's top-right "More actions" menu, then confirm in a dialog. This plan has one scenario, which runs against the `unpaid` order (one E2E Tee, unpaid, unfulfilled) in the `orders` scenario (e2e/scenarios/orders.ts, SCENARIO_ORDERS). The test must NOT create a new order.

TARGET FILE: e2e/tests/orders/order-cancel.spec.ts. SEED: e2e/tests/seed.spec.ts.

SETUP (same as the sibling e2e/tests/orders/order-payment-fulfillment.spec.ts):
- import { e2eConfig } from "../../config.ts"; import { expect, test } from "../../fixtures/test.ts"; import { OrderPage } from "../../pages/orderPage.ts"; import { findOrderId, ORDERS_SCENARIO } from "../../scenarios/orders.ts";
- test.use({ scenario: ORDERS_SCENARIO }); const config = e2eConfig();
- Title: "Cancel an unpaid, unfulfilled order #e2e". Use // Arrange, // Act, // Assert comments. Optionally wrap each step in test.step, like the sibling spec does.
- Do NOT add a parallel() tag. Without it, the `seed` fixture in e2e/fixtures/test.ts restores the orders scenario before the test. That makes the test independent of the sibling specs, which also use (and change) the `unpaid` order.

SELECTORS OBSERVED IN THE LIVE UI (testIdAttribute = data-test-id; checked on Saleor 3.23 / dashboard at http://localhost:9200):
- Order status pill: data-test-id="status-info". Text is "Unfulfilled" before and "Cancelled" after. EXISTING: OrderPage.statusInfo.
- Fulfill button: data-test-id="order-items-fulfill-button", label "Fulfill". EXISTING: OrderPage.fulfillButton. After cancelling, the element is removed from the DOM (count 0), both straight away and after a reload. Only "Return" (data-test-id="order-items-return-button") is left in that toolbar.
- "More actions" menu trigger in the page header: data-test-id="show-more-button", title/accessible name "More actions". The same test id also appears on order line rows, so scope it to the header: page.getByTestId("page-header").getByTestId("show-more-button"). NEW locator, e.g. `moreActionsButton`.
- Menu (role="menu") items: "Open this order in GraphiQL" (data-test-id="graphiql-redirect") and "Cancel order" (data-test-id="cancel-order", role="menuitem"). NEW locator `cancelOrderMenuItem` = page.getByTestId("cancel-order"). After cancelling, the menu only offers "Open this order in GraphiQL".
- Opening the cancel item adds ?action=cancel to the URL and opens a role="dialog" with heading "Cancel order #<number>" and body "Important: Refunds need to be issued manually after order cancelation." Buttons: "Keep order" (data-test-id="back"), "Cancel order" (data-test-id="submit", carries data-test-state) and a close X (data-test-id="close-button"). EXISTING: OrderPage.dialog (getByRole("dialog")). Confirm with dialog.getByTestId("submit"), the same pattern markAsPaid() uses. NEW locator could be `confirmCancelButton` = this.dialog.getByTestId("submit").
- After confirming: the dialog closes, the URL loses ?action=cancel, a toast reads "Success / Order cancelled", and Order History gets an "Order was cancelled by admin@example.com" entry.

SUGGESTED PAGE-OBJECT EXTENSION (e2e/pages/orderPage.ts):
  readonly moreActionsButton = this.page.getByTestId("page-header").getByTestId("show-more-button");
  readonly cancelOrderMenuItem = this.page.getByTestId("cancel-order");
  async cancelOrder() { await this.moreActionsButton.click(); await this.cancelOrderMenuItem.click(); await this.dialog.getByTestId("submit").click(); await this.dialog.waitFor({ state: "hidden" }); }
Reuse the existing statusInfo, fulfillButton, dialog and goto(). goto() already waits for status-info.

EXPLORATION NOTE: The flow was walked on a default-scenario order (#9, Channel-USD, unpaid, Unfulfilled), not on the orders-scenario `unpaid` order itself. That default order has a refunded transaction, so its Fulfill button was present but DISABLED before cancelling. Whether Fulfill is enabled on the scenario `unpaid` order before payment was not verified. So the precondition only asserts that the button is visible, not that it is enabled. The post-cancel assertion (button removed) does not depend on this.

## Test Scenarios

### 1. Order cancel

**Seed:** `e2e/tests/seed.spec.ts`

#### 1.1. Cancel an unpaid, unfulfilled order #e2e

**File:** `e2e/tests/orders/order-cancel.spec.ts`

**Steps:**
  1. // Arrange - Run with test.use({ scenario: ORDERS_SCENARIO }) and no parallel() tag, so the orders scenario is restored and the admin is signed in. Create `const orderPage = new OrderPage(page)` and open the scenario's unpaid order: `await orderPage.goto(await findOrderId(config, "unpaid"))`. Do not create an order.
    - expect: The order page loads (OrderPage.goto waits for data-test-id="status-info")
    - expect: Precondition: orderPage.statusInfo has text "Unfulfilled"
    - expect: Precondition: orderPage.fulfillButton (data-test-id="order-items-fulfill-button") is visible. This shows the post-cancel 'not offered' check is meaningful
  2. // Act - Click the page header's "More actions" trigger: page.getByTestId("page-header").getByTestId("show-more-button") (new OrderPage.moreActionsButton). Then click the "Cancel order" menu item, page.getByTestId("cancel-order") (new OrderPage.cancelOrderMenuItem).
    - expect: A role="menu" opens with a "Cancel order" menuitem
    - expect: After clicking it, orderPage.dialog (role="dialog") is visible and contains "Cancel order #" plus the buttons "Keep order" (data-test-id="back") and "Cancel order" (data-test-id="submit")
  3. // Act - Confirm with orderPage.dialog.getByTestId("submit").click() and wait for the dialog to be hidden. Steps 2 and 3 can be wrapped in the new OrderPage.cancelOrder() helper.
    - expect: The dialog closes (toBeHidden)
    - expect: Optional: a success toast "Order cancelled" appears
  4. // Assert - Check the status and the fulfil action on the same page, without reloading.
    - expect: await expect(orderPage.statusInfo).toHaveText("Cancelled")
    - expect: await expect(orderPage.fulfillButton).toHaveCount(0) (or toBeHidden). The Fulfill button is removed from the DOM for a cancelled order
  5. // Assert - Reload with `await page.reload()` and wait for orderPage.statusInfo, or call orderPage.goto(orderId) again with the same id.
    - expect: await expect(orderPage.statusInfo).toHaveText("Cancelled") after the reload, so the cancellation was saved
    - expect: await expect(orderPage.fulfillButton).toHaveCount(0) still holds after the reload
