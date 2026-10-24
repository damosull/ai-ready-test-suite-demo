# Draft order: manual percentage order discount on top of a catalogue promotion

## Application Overview

Ticket 01 (tickets/01.md). Staff add a manual percentage discount to a whole draft order from the draft's Summary card. The manual discount is applied on top of a catalogue promotion that is already on the line. This plan checks the arithmetic, the discount breakdown, and that the discount is saved.

**Target test file:** `e2e/tests/orders/draft-manual-discount.spec.ts`. It sits next to `draft-pricing.spec.ts` and uses the same structure: `test.use({ scenario: ORDERS_SCENARIO })`, a `money()` helper (`amount.toFixed(2)`), and Arrange / Act / Assert comments with `test.step`s.

**Reuse (no new infrastructure):**
- Fixture: `e2e/fixtures/test.ts` (`test`, `expect`). The default actor is `admin`, and the DB is restored before the test.
- Scenario/data: `e2e/scenarios/orders.ts`. Use `ORDERS_SCENARIO`, `CHANNEL` (name "Channel-USD"), `PRODUCTS.tee` ({ name "E2E Tee", sku "e2e-tee", price 10 }) and `PROMOTIONS` (catalogue "E2E Tee sale" 20%; order "E2E big basket" 10% at a subtotal of at least 30).
- Page object: `e2e/pages/draftOrderPage.ts`. Use `create({ from: "drafts", channel: CHANNEL.name })`, `addProduct(PRODUCTS.tee)`, `total` (`order-total`), `discountToggle` (`discount-section-toggle`), `summary` (`OrderSummary`) and `dialog`.
- Note: `e2e/tests/seed.spec.ts` runs on the *default* scenario, which has no E2E Tee. The spec must set `scenario: ORDERS_SCENARIO`.

**Expected amounts (derived from test data; compute them in the spec from the constants rather than hardcoding):**
- Tee list price: 10.00
- Catalogue promotion (20%): 2.00, so the promoted line/subtotal is 8.00. This is below the order promotion's threshold of 30, so "E2E big basket" does not apply. Guard this with `expect(8).toBeLessThan(PROMOTIONS.order.subtotalAtLeast)`, as draft-pricing does.
- Manual order discount 25% of 8.00: 2.00
- Draft total: 8.00 - 2.00 = **6.00** (no shipping address, so shipping is 0.00; taxes are 0.00 in this channel)
- Summary "Subtotal" row: 6.00. The subtotal shown is after discounts. The "before discounts" info icon (`subtotal-before-discounts`) appears because it differs from the undiscounted 10.00.
- "Discount (applied)" toggle total: line 2.00 + order 2.00 = **4.00**
- Expanded breakdown: under "Order", **Manual 25% 2.00**. Under "Lines", **Promotion (1 line) 2.00**.

**UI flow (confirmed by exploring the dashboard on stable 3.23 and reading `src/orders/components/OrderSummary/OrderValue.tsx`):**
- With no discounts at all, the Summary shows a top-level "Add Discount" button. Once the tee's catalogue promotion is on the line, that button is NOT rendered. Instead a "Discount (applied) 2.00" toggle (`discount-section-toggle`) appears. Clicking it expands the breakdown, which has an "Order" subgroup containing an "Add Discount" link button and a "Lines" subgroup containing "Promotion (1 line) 2.00". The manual discount must be added from that "Order" subgroup's "Add Discount".
- The "Order discount" dialog ("Discount this order by a percentage or fixed amount") has a radiogroup with "Percentage" (checked by default) and "Fixed Amount"; a "Discount value" textbox (`discount-value`) with a "%" suffix; a "Reason" textbox (`discount-reason`); and "Cancel" (`back`) and "Confirm" (`submit`) buttons. "Confirm" is disabled until a value is entered.
- When confirmed, the dialog closes, a "Saved changes" notification appears, and Order History gets an "Order was discounted" event. The manual row shows the percentage as a link button ("25%") whose `title` is the reason; clicking it reopens the dialog for editing or removal (`button-remove`).
- The expanded state of the breakdown is local React state, so it collapses after a reload. Click the toggle again after reloading before asserting on the breakdown.
- Verified live with a populatedb product (1.99): a 25% manual discount gave a 0.50 discount and a 1.49 total. The breakdown read "Order / Manual / 25% / 0.50", and the total and discount were unchanged after `page.reload()`.

## Test Scenarios

### 1. Draft order manual discount

**Seed:** `e2e/tests/seed.spec.ts`

#### 1.1. A 25% manual order discount applies on top of the tee's catalogue promotion and is saved #e2e

**File:** `e2e/tests/orders/draft-manual-discount.spec.ts`

**Steps:**
  1. Arrange: with `test.use({ scenario: ORDERS_SCENARIO })` and the default admin actor, compute teePrice = PRODUCTS.tee.price (10), teeDiscount = teePrice * PROMOTIONS.catalogue.percent / 100 (2), promoted = teePrice - teeDiscount (8), manualPercent = 25, manualDiscount = promoted * manualPercent / 100 (2), and expectedTotal = promoted - manualDiscount (6). Guard: expect(promoted).toBeLessThan(PROMOTIONS.order.subtotalAtLeast).
    - expect: The guard passes (8 < 30), so the 'E2E big basket' order promotion cannot interfere with the arithmetic
  2. Call `draft.create({ from: "drafts", channel: CHANNEL.name })` to open /orders/drafts, click 'Create order', pick 'Channel-USD' and submit
    - expect: The new draft page shows status 'Draft' (`status-info`)
    - expect: The Summary card shows Subtotal 0.00 and a top-level 'Add Discount' button
  3. Call `draft.addProduct(PRODUCTS.tee)` to add one E2E Tee
    - expect: `draft.total` has text '8.00'
    - expect: `draft.discountToggle` contains '2.00' (catalogue promotion only)
    - expect: The top-level 'Add Discount' button is no longer shown in the Summary
  4. Click `draft.discountToggle` to expand the discount breakdown
    - expect: The breakdown shows an 'Order' subgroup with an 'Add Discount' button, and a 'Lines' subgroup reading 'Promotion (1 line)' with 2.00
    - expect: No order promotion row ('E2E big basket') is present
  5. In the 'Order' subgroup click 'Add Discount' (scope it to `draft.summary.getByRole('button', { name: 'Add Discount' })`)
    - expect: The 'Order discount' dialog opens with 'Percentage' selected
    - expect: 'Confirm' is disabled while 'Discount value' is empty
  6. Fill 'Discount value' (`discount-value`) with '25' and 'Reason' (`discount-reason`) with 'Goodwill gesture', then click 'Confirm' (`dialog.getByTestId('submit')`) and wait for the dialog to be hidden
    - expect: The dialog closes and a 'Saved changes' notification appears
    - expect: `draft.total` has text '6.00' (= 8.00 less 25%)
    - expect: `draft.discountToggle` contains '4.00' (2.00 line promotion + 2.00 manual)
    - expect: The Summary 'Subtotal' row reads 6.00
  7. Expand the breakdown if collapsed (click `draft.discountToggle`) and read `draft.summary`
    - expect: The 'Order' subgroup shows 'Manual' with a '25%' link button and amount 2.00
    - expect: The 'Lines' subgroup still shows 'Promotion (1 line)' with amount 2.00 (the manual discount is shown alongside the line promotion, not replacing it)
    - expect: The '25%' button's title attribute equals the reason 'Goodwill gesture'
  8. Reload the page (`page.reload()`), wait for `draft.total` to be visible, then click `draft.discountToggle` to expand the breakdown again (its expanded state is not persisted)
    - expect: `draft.total` still has text '6.00'
    - expect: `draft.discountToggle` still contains '4.00'
    - expect: The breakdown still shows 'Manual' '25%' 2.00 under 'Order' and 'Promotion (1 line)' 2.00 under 'Lines', which proves the discount was saved on the server and not only shown on the client
    - expect: Status is still 'Draft'
