# Order: cancelling a fulfillment puts the order back to unfulfilled

## Application Overview

Ticket 04. Warehouse staff cancel a fulfillment from the fulfillment card's "Show more" menu on the order details page, picking the warehouse the stock is restocked to. Afterwards the order goes back to needing fulfillment: the status pill reads "Unfulfilled", the "Fulfill" action is offered again, and both survive a page reload. Fulfilling is already covered by e2e/tests/orders/order-payment-fulfillment.spec.ts. Cancelling is not.

Target test file: e2e/tests/orders/order-cancel-fulfillment.spec.ts
Seed file used for exploration: e2e/tests/seed.spec.ts (suite fixture e2e/fixtures/test.ts: restored DB plus signed-in admin, dashboard at http://localhost:9200).

Test data and setup (follow the existing order specs):
- The seed restores the "default" scenario, which does NOT contain the scenario orders. The spec must declare `test.use({ scenario: ORDERS_SCENARIO })` (from e2e/scenarios/orders.ts) so the fixture restores the "orders" dump before the test.
- The order is the scenario order keyed "fulfilled" (SCENARIO_ORDERS.fulfilled): one "E2E Tee", paid with orderMarkAsPaid, fulfilled with one fulfillment from the warehouse that ships to US in default-channel (Channel-USD). It is tagged with metadata e2e=fulfilled. Order ids change with every dump build, so look the id up at test time with `await findOrderId(e2eConfig(), "fulfilled")` and open it with `OrderPage.goto(id)`, which waits for the status pill.
- Leave the test untagged (serial, with its own DB reset), because it mutates the order. Do not use parallel(). Tag the title with "#e2e", the same as the sibling order specs.
- Follow the Arrange / Act / Assert comments and test.step() style used in order-payment-fulfillment.spec.ts.

Confirmed UI flow and selectors (seen on a populatedb fulfilled order, same components):
- Status pill: getByTestId("status-info") (OrderPage.statusInfo). Reads "Fulfilled" before and "Unfulfilled" after.
- The order lines card opens in the "Line matrix" view in a fresh browser context, and that view has no fulfillment card. Switch to "Timeline" first: getByTestId("order-items-view-timeline") (OrderPage.timelineView). The choice persists in browser storage across reloads, but each test starts from a fresh context.
- Fulfillment card: getByTestId("fulfilled-order-section"). Its header shows the date, "From <warehouse>", "Fulfilled", "Add tracking", and a "Show more" icon button getByTestId("fulfillment-menu-button").
- Menu item: role menuitem "Cancel fulfillment", data-test-id "cancel-fulfillment". The same test id is also used in OrderLineExpandedPanel (Line matrix view), so scope it with getByRole("menuitem", { name: "Cancel fulfillment" }) or getByRole("menu").getByTestId("cancel-fulfillment").
- Clicking it adds ?action=cancel-fulfillment&id=<fulfillmentId> to the URL and opens a dialog (getByRole("dialog"), OrderPage.dialog) titled "Cancel Fulfillment". Body text: "...Canceling a fulfillment will restock products at the selected warehouse. The warehouse this fulfillment shipped from is pre-selected."
- Warehouse field: wrapper getByTestId("cancel-fulfillment-select-field"), containing combobox "Select Warehouse". The fulfillment's source warehouse is pre-selected, and the submit button is enabled straight away. Opening the combobox shows a listbox of role option / data-test-id "select-option" with every warehouse (populatedb: Oceania, Europe, Default Warehouse, Default for click and collect, Default, Asia, Americas, Africa). The ticket accepts any warehouse.
- Buttons: dialog getByTestId("back") ("Back"), getByTestId("close-button") (X), and getByTestId("submit") ("Cancel fulfillment").
- On success the dialog closes, a toast shows "Success / Fulfillment cancelled", the status pill reads "Unfulfilled", the "Fulfill" button getByTestId("order-items-fulfill-button") (OrderPage.fulfillButton) appears in both views, the lines card shows "Unfulfilled order lines" plus a "Show 1 canceled shipment" button, and Order History adds "Fulfillment was cancelled" and "Restocked 1 item to <warehouse>".

Page-object reuse and suggested additions (e2e/pages/orderPage.ts):
- Reuse: goto(orderId), statusInfo, fulfillButton, timelineView, dialog.
- Add locators: fulfillmentMenuButton = getByTestId("fulfillment-menu-button"), cancelFulfillmentMenuItem = getByRole("menuitem", { name: "Cancel fulfillment" }), cancelFulfillmentWarehouse = dialog.getByTestId("cancel-fulfillment-select-field").getByRole("combobox").
- Add a helper `cancelFulfillment(warehouse?: string)`: click timelineView, click fulfillmentMenuButton, click cancelFulfillmentMenuItem, optionally open the combobox and pick getByRole("option", { name: warehouse, exact: true }), click dialog.getByTestId("submit"), then wait for the dialog to be hidden. This matches the pattern of markAsPaid / addTracking.

## Test Scenarios

### 1. Order fulfillment cancellation

**Seed:** `e2e/tests/seed.spec.ts`

#### 1.1. Cancelling a fulfillment returns the order to unfulfilled #e2e

**File:** `e2e/tests/orders/order-cancel-fulfillment.spec.ts`

**Steps:**
  1. Arrange: with `test.use({ scenario: ORDERS_SCENARIO })` in effect (fresh restore of the "orders" dump, signed in as admin), resolve the order id with `await findOrderId(e2eConfig(), "fulfilled")` and open it with `orderPage.goto(id)` (navigates to /orders/<id> and waits for getByTestId("status-info")).
    - expect: The order details page loads for the scenario's paid and fulfilled order
    - expect: The status pill getByTestId("status-info") reads exactly "Fulfilled" (precondition)
    - expect: The payment badges getByTestId("payment-status-badges") contain "Fully charged" (optional precondition check)
    - expect: The "Fulfill" button getByTestId("order-items-fulfill-button") is not visible
  2. Act: click the "Timeline" toggle getByTestId("order-items-view-timeline") in the order lines card. A fresh context opens in "Line matrix".
    - expect: The Timeline toggle is pressed
    - expect: A fulfillment card getByTestId("fulfilled-order-section") is shown with status "Fulfilled" and "From <warehouse>"
  3. Act: click the card's "Show more" button getByTestId("fulfillment-menu-button").
    - expect: A menu opens with one menuitem, "Cancel fulfillment" (data-test-id "cancel-fulfillment")
  4. Act: click the menuitem getByRole("menuitem", { name: "Cancel fulfillment" }).
    - expect: A dialog getByRole("dialog") opens, titled "Cancel Fulfillment", saying stock will be restocked at the selected warehouse
    - expect: The URL gains ?action=cancel-fulfillment&id=<fulfillmentId>
    - expect: The warehouse field getByTestId("cancel-fulfillment-select-field") shows combobox "Select Warehouse" with the source warehouse pre-selected
    - expect: The dialog button getByTestId("submit") ("Cancel fulfillment") is enabled
  5. Act: choose the warehouse to return the stock to. Open the "Select Warehouse" combobox and click any listed option, getByRole("option", { name: <warehouse>, exact: true }) (data-test-id "select-option"). Keeping the pre-selected warehouse is fine too. Picking it explicitly covers the ticket's "choosing the warehouse".
    - expect: The listbox lists the shop's warehouses
    - expect: After selection the combobox shows the chosen warehouse and the listbox closes
  6. Act: confirm with the dialog's getByTestId("submit") ("Cancel fulfillment") and wait for the dialog to be hidden.
    - expect: The dialog closes
    - expect: A toast reads "Fulfillment cancelled" (optional assertion)
  7. Assert: check the order state straight after confirming.
    - expect: getByTestId("status-info") has text exactly "Unfulfilled" (acceptance criterion 1)
    - expect: getByTestId("order-items-fulfill-button") is visible with text "Fulfill" (acceptance criterion 2)
    - expect: The fulfillment card getByTestId("fulfilled-order-section") with status "Fulfilled" is gone. The card shows "Unfulfilled order lines" and a "Show 1 canceled shipment" button (optional)
    - expect: Order History shows "Fulfillment was cancelled" and "Restocked 1 item to <chosen warehouse>" (optional, confirms the warehouse choice was applied)
  8. Act: reload the page (page.reload()) and wait for getByTestId("status-info").
    - expect: getByTestId("status-info") still has text exactly "Unfulfilled" (acceptance criterion 3)
    - expect: getByTestId("order-items-fulfill-button") is still visible
