# Order note by order-permission staff (ticket 05)

## Application Overview

Ticket 05 (Orders / History): a staff member who has only the order-management permission (MANAGE_ORDERS) leaves a note on an order. The note shows in the order history and is still there after a reload. No existing order spec runs as anyone other than the superuser.

TARGET FILE: e2e/tests/orders/order-note.spec.ts (one test, one user story, a `test.step` per stage). Model spec: e2e/tests/orders/order-payment-fulfillment.spec.ts.

SETUP (follows the E2E conventions in CLAUDE.md):
- Import `test` and `expect` from `../../fixtures/test.ts`, `e2eConfig` from `../../config.ts`, `OrderPage` from `../../pages/orderPage.ts`, and `findOrderId` and `ORDERS_SCENARIO` from `../../scenarios/orders.ts`. Use relative imports that keep the `.ts` extension.
- `test.use({ scenario: ORDERS_SCENARIO, actor: "order" })`. The `order` actor is order.manager@example.com from e2e/lib/actors.ts. Its only permission is MANAGE_ORDERS, in the "Orders management" group (checked against the seed). There is no UI sign-in and no credentials in the spec.
- Find the order with `await findOrderId(config, "unpaid")`, which looks it up by its `e2e` metadata. Do not hard-code ids or order numbers. Do not create a new order, because the scenario already has the unpaid one.
- No cleanup, no unique or timestamped note text, no `parallel()` tag (the test writes), no retries or timeout changes, no fixed waits, no `networkidle`.
- Spec header comment: say that it covers order notes added by an order-permission-only staff member, and that it is the first order spec run as a non-superuser.
- Title, for example: "Order staff can leave a note that stays in the order history #e2e".

LOCATORS FOUND (live dashboard on stable 3.23, and source):
The order history has no data-test-id on its note input, submit button, card, or entries. The source was checked: src/orders/components/OrderHistory/OrderHistory.tsx, src/components/Timeline/Timeline.tsx (TimelineAddNote) and src/components/Timeline/TimelineNote.tsx. The only test ids in that area are `timeline-note-connector` (a decorative stem), `edit-note` (the pencil on each note, hidden until hover) and `save-note` (the edit form). None of them fits these steps, so the plan uses role locators as rule 6.1 allows. Each was checked to be unique on the order page:
- Note field: `page.getByRole("textbox", { name: "Comment" })`. A Macaw Textarea, name="message", label "Comment", placeholder "Leave your note here...".
- Submit: `page.getByRole("button", { name: "Add Comment" })`. Disabled while the field is empty or whitespace. Clicking it clears the field before the mutation is sent.
- History entry: `page.getByText(<note>, { exact: true })`. The note card shows the actor's display name, "added", the relative time ("just now") and then the message. The order page also has a separate customer "Notes" card ("No notes from customer"). The note text does not collide with it.
- Existing test id reused: `status-info` (OrderPage.statusInfo, which `goto` already waits on).
- Non-superuser check: the sidebar test id `menu-item-label-products` (the "Catalog" group). It needs MANAGE_PRODUCTS, MANAGE_GIFT_CARD or MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES (src/components/Sidebar/menu/hooks/useMenuStructure.tsx), so it is hidden for the order actor and visible for admin. `menu-item-label-order-drafts` needs MANAGE_ORDERS and is unique, so it is a positive control. (`menu-item-label-orders` appears twice, on the Fulfillment group and on the Orders child, so do not use it with a strict locator.)
- Optional, if the team prefers test ids to role locators: add `data-test-id="order-history"` to the DashboardCard in OrderHistory.tsx. DashboardCard already forwards it, as in OrderDetailsRefundTable's `order-refund-section`. Then scope the field, button and entry inside that card (rule 6.2). This is not needed for the ticket. If it is done, it is a src change and needs no changeset (test-only).

PAGE OBJECT CHANGES (e2e/pages/orderPage.ts; extend it, no new class, rule 6.4):
- `readonly noteInput = this.page.getByRole("textbox", { name: "Comment" });`
- `readonly addNoteButton = this.page.getByRole("button", { name: "Add Comment" });`
- `historyNote(message: string)` returns `this.page.getByText(message, { exact: true })`. It is a method because the locator depends on the text.
- `async addNote(message: string)`: fill `noteInput`, click `addNoteButton`, then `await this.historyNote(message).waitFor()`. Add a why-comment: the field clears before the mutation is sent, so an empty field does not prove the save. The note only renders from the mutation result, because there is no optimistic update (src/orders/views/OrderDetails).

DATA: the note text is a literal constant in the spec, for example "Customer called, wants delivery after 5pm" (taken from the ticket). The database is restored before each test, so it does not need to be unique. Do not assert on the note author's display name. For order.manager the dashboard shows "firstName lastName" (getActorDisplayName), and populatedb randomises those names ("Amanda Phelps" in the current seed, rule 3.6). Admin has no name and shows its email.

OBSERVED BEHAVIOUR (explored as admin on a populatedb unpaid order, #19, Channel-PLN; the history UI is the same for the scenario's unpaid order):
- The add-note form sits at the top of the "Order History" card, and the button is disabled until there is text.
- After "Add Comment": the toast "Note added" appears, a note card appears under the "Today" date group with the actor, "added" and "just now", the field is empty and the button is disabled again.
- After `page.reload()` the note text is still there, exactly once.
- The scenario's unpaid order (created through draftOrderComplete) will already have history events such as "placed". That is harmless, because the assertions target the note text only.

OUT OF SCOPE: editing notes, empty or whitespace validation, keyboard submit (Cmd/Ctrl+Enter), draft-order notes, other actors. The ticket asks for one story only.

## Test Scenarios

### 1. Order notes as order-permission staff

**Seed:** `e2e/tests/seed.spec.ts`

#### 1.1. Order staff can leave a note that stays in the order history #e2e

**File:** `e2e/tests/orders/order-note.spec.ts`

**Steps:**
  1. Arrange: the spec declares `test.use({ scenario: ORDERS_SCENARIO, actor: "order" })`, so the fixture restores the `orders` scenario and loads the stored session of order.manager@example.com. Create `const orderPage = new OrderPage(page)` and define `const note = "Customer called, wants delivery after 5pm"`. Call `await orderPage.goto(await findOrderId(config, "unpaid"))`; `goto` navigates to `/orders/<id>` and waits on `getByTestId("status-info")`.
    - expect: The order details page for the scenario's unpaid order loads, and `orderPage.statusInfo` is visible (expected text "Unfulfilled"; asserting it is optional)
    - expect: The "Order History" card shows the `Comment` textbox and a disabled "Add Comment" button
  2. test.step("signed in with only the order permission"): assert on the sidebar, which reflects the signed-in user's permissions. Keep this minimal: it proves the session is not the superuser's.
    - expect: `await expect(page.getByTestId("menu-item-label-products")).toBeHidden()`: the Catalog navigation group needs a product or gift-card permission, which the order actor does not have (admin would see it, so a superuser session fails here)
    - expect: `await expect(page.getByTestId("menu-item-label-order-drafts")).toBeVisible()`: a positive control that the MANAGE_ORDERS navigation is rendered, so the hidden check is not passing only because the sidebar did not render
  3. test.step("add a note"): call `await orderPage.addNote(note)`. It fills `getByRole("textbox", { name: "Comment" })`, clicks `getByRole("button", { name: "Add Comment" })` and waits for the note to render in the history.
    - expect: `await expect(orderPage.historyNote(note)).toBeVisible()`: the note text appears in the order history (acceptance criterion 2)
    - expect: Optional supporting checks: `await expect(orderPage.noteInput).toHaveValue("")` (the form reset). Do not use the "Note added" toast as the main assertion, because it shows that the UI responded, not the outcome
  4. test.step("the note survives a reload"): call `await page.reload()`, then `await orderPage.statusInfo.waitFor()` (or reuse `orderPage.goto(orderId)` with the id kept from Arrange) so the order has loaded again.
    - expect: `await expect(orderPage.historyNote(note)).toBeVisible()`: after the reload the note is still in the history, which proves it was stored by the API and was not only client state (acceptance criterion 3)
    - expect: Optional: `await expect(orderPage.historyNote(note)).toHaveCount(1)`. The note is shown once and was not added twice
  5. Failure conditions to keep in mind when reviewing the spec.
    - expect: The test fails if the session is the superuser (the Catalog item is visible), so acceptance criterion 1 is proved in the UI and does not rest on `test.use` alone
    - expect: The test fails if the note is not saved (no history entry, because nothing is rendered optimistically) or is lost on reload
    - expect: The spec contains no `waitForTimeout`, `networkidle`, CSS or XPath selectors, hard-coded order ids, or populatedb names or numbers, and no cleanup code
