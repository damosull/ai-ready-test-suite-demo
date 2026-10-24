# Order history notes as order staff (ticket 05)

## Application Overview

Covers ticket 05 (tickets/05.md): a customer-service staff member whose only permission is MANAGE_ORDERS leaves a note on an order in the Order History card, and the note persists after a reload.

Starting state and conventions (from e2e/README.md, e2e/fixtures/test.ts, e2e/scenarios/orders.ts):
- Import `test`/`expect` from `e2e/fixtures/test.ts`. The `seed` fixture restores the database before every test, so the test starts from a fresh state, needs no cleanup and is independent of run order. Leave the spec untagged (serial phase), like the other order specs, because it writes data.
- Auth as the order staff user: `test.use({ actor: "order", scenario: ORDERS_SCENARIO })`. Actor `order` maps to `order.manager@example.com` in `PERMISSION_ACTORS` (e2e/lib/actors.ts), the populatedb staff user whose only permission is MANAGE_ORDERS (verified via tokenCreate: userPermissions = [MANAGE_ORDERS]). `e2e/global-setup.ts` signs every actor in over the API and `writeStorageState` (e2e/lib/auth.ts) caches a storage state holding only `localStorage._saleorRefreshToken`; the fixture's `storageState` override hands that file to the browser context. No UI login is involved (so no login throttling), and the default actor `admin` (superuser) must NOT be used.
- The unpaid order: `ORDERS_SCENARIO` ("orders", parent "default") creates `SCENARIO_ORDERS.unpaid` (one E2E Tee, unpaid, unfulfilled, customer e2e.customer@example.com, metadata e2e=unpaid). Resolve its id at test time with `await findOrderId(e2eConfig(), "unpaid")` from e2e/scenarios/orders.ts (a read-only API lookup by metadata; it uses an admin token for the lookup only, the browser session stays the order user). Never hardcode an order id or number; ids change per dump build.
- Navigation: `new OrderPage(page).goto(orderId)` (e2e/pages/orderPage.ts) opens `/orders/<id>` and waits for `data-test-id="status-info"`.
- Order History UI (src/orders/components/OrderHistory/OrderHistory.tsx, src/components/Timeline/Timeline.tsx): a card titled "Order History" containing a textbox with accessible name "Comment" (placeholder "Leave your note here...") and a button "Add Comment" that is disabled while the textbox is empty/whitespace. Submitting shows a "Note added" success notification, clears the textbox, and renders a note entry at the top of the timeline showing the author's name (the order staff user, a random populatedb name) + "added" + the message; each note has an `edit-note` test id button. Ctrl/Cmd+Enter also submits. The card has no data-test-id; scope assertions to the Order History card (e.g. a locator filtered by the "Order History" title and the "Comment" textbox) because the right-hand "Notes" card (customer note: "No notes from customer") is a different feature and must not be confused with it. Consider adding locators (commentInput, addCommentButton, history) to OrderPage when implementing.
- Unique note text per run, e.g. `Customer called, wants delivery after 5pm (${testInfo.testId}-${Date.now()})` or a randomUUID suffix, so the assertion can only match the note this run created.
- Follow repo test conventions: `// Arrange`, `// Act`, `// Assert` comments, named test with `#e2e` suffix as in sibling order specs.

Verified manually in the running stable dashboard (http://localhost:9200) signed in as order.manager@example.com: adding a comment showed "Note added", the textbox cleared, the note rendered under "Today" with the staff user as author, and it was still present after page.reload().

## Test Scenarios

### 1. Order history notes (order staff, MANAGE_ORDERS only)

**Seed:** `e2e/tests/seed.spec.ts`

#### 1.1. Order staff adds a note to the unpaid order's history and it persists after reload #e2e

**File:** `e2e/tests/orders/order-notes.spec.ts`

**Steps:**
  1. Configure the spec with `test.use({ actor: "order", scenario: ORDERS_SCENARIO })` so the browser context is restored onto the orders scenario and signed in via the cached storage state of order.manager@example.com (MANAGE_ORDERS only), not the admin superuser.
    - expect: The fixture restores the orders scenario before the test and the context carries the order actor's `_saleorRefreshToken`.
  2. Arrange: build a unique note text for this run, e.g. `Customer called, wants delivery after 5pm (e2e-<randomUUID>)`. Resolve the unpaid order id with `await findOrderId(e2eConfig(), "unpaid")`.
    - expect: findOrderId returns an id (it throws if the orders scenario has no 'unpaid' order).
  3. Open the order with `new OrderPage(page).goto(orderId)`.
    - expect: The order details page loads (status-info visible, showing 'Unfulfilled').
    - expect: The dashboard is not redirected to the login page and no permission error is shown, i.e. the order staff user can view the order.
    - expect: The 'Order History' card is visible with an empty 'Comment' textbox and a disabled 'Add Comment' button.
  4. Optionally confirm the session identity: the signed-in user is the order staff user, not the superuser (e.g. the sidebar user menu does not show the admin; or assert via the note's author link later pointing to a staff page different from the admin). Keep this lightweight; the actor option is the primary guarantee.
    - expect: The session belongs to order.manager@example.com.
  5. Act: fill the 'Comment' textbox (getByRole('textbox', { name: 'Comment' })) in the Order History card with the unique note text, then click the 'Add Comment' button.
    - expect: The 'Add Comment' button becomes enabled once text is entered.
    - expect: A 'Note added' success notification appears.
    - expect: The 'Comment' textbox is cleared and 'Add Comment' is disabled again.
  6. Assert: look for the unique note text inside the Order History card.
    - expect: Exactly one element with the unique note text is visible in the Order History timeline.
    - expect: The note entry reads '<staff user name> added' (author is the order staff user, not the admin).
  7. Reload the page (page.reload()) and wait for status-info.
    - expect: The order page reloads successfully for the order staff user.
  8. Assert again: look for the unique note text inside the Order History card after the reload.
    - expect: The note with the unique text is still shown in the Order History card (persisted server-side, not just optimistic UI state).
    - expect: It appears exactly once (no duplicate note from the submit).
