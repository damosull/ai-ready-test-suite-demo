# Draft order deletion

## Application Overview

Ticket 02 (Orders / Drafts): staff delete a draft order they no longer need from the draft page's top-nav "More actions" menu, after confirming in a dialog. After confirming they land on the drafts list, and reopening the deleted draft's address shows the dashboard's "page was not found" screen instead of the draft.

Target spec: e2e/tests/orders/draft-deletion.spec.ts. Seed file used for exploration: e2e/tests/seed.spec.ts.

Conventions the generated spec must follow (CLAUDE.md "E2E conventions", e2e/README.md):

- Import `test`/`expect` from `../../fixtures/test.ts`; relative imports with `.ts` extensions.
- Open with a comment saying what the spec covers and why (deletion had no e2e coverage; a silently failing delete would let drafts pile up).
- `test.use({ scenario: ORDERS_SCENARIO })`, imported from `../../scenarios/orders.ts`; default actor (admin). No `parallel()` tag (the test writes).
- One test, one user story, title ending in `#e2e`, e.g. "Staff delete a draft order from its menu after confirming #e2e". `// Arrange` then `// Act & Assert` with one `test.step` per stage.
- Arrange through the existing `DraftOrderPage.create({ from: "drafts", channel: CHANNEL.name })` (CHANNEL.name is "Channel-USD"). No API arranging, no beforeEach, no cleanup, no unique names, no hard-coded ids: the draft's URL is read from `page.url()` after creation, because the id is minted at test time.
- New locators and the delete action go into the existing `e2e/pages/draftOrderPage.ts` (readonly fields from `this.page`), not into the spec and not into a new page object.
- No fixed waits, no `networkidle`; wait on URL changes and web-first assertions.

Locators recorded while exploring (Saleor 3.23 stable, dashboard on http://localhost:9200):

- Draft page header: `getByTestId("page-header")`. Draft URL shape: `/orders/drafts/<base64 id>`; title "Order #<n>", status `getByTestId("status-info")` = "Draft".
- Top-nav menu trigger: `getByTestId("show-more-button")` (button, title/accessible name "More actions", aria-haspopup="menu"). It is the only one on the draft page; scoping it to `page-header` is safe. NOTE: OrderDraftPage passes `dataTestId="menu"` to TopNav.Menu but that id is NOT rendered in the DOM (`getByTestId("menu")` matches nothing) - do not use it.
- Delete menu item: `getByTestId("cancel-order")` (li role="menuitem", label "Cancel order", rendered in a portal `role="menu"`). Despite the label, on a draft this opens the delete confirmation. Clicking it adds `?action=cancel` to the URL.
- Confirmation dialog: `getByRole("dialog")` (no data-test-id on the dialog; `DraftOrderPage.dialog` already exists). Title "Delete Draft Order", body "Are you sure you want to delete draft <n>?". Buttons inside it: confirm `dialog.getByTestId("submit")` (text "Delete"), cancel `dialog.getByTestId("back")` (text "Keep draft"), close `dialog.getByTestId("close-button")`. `submit` exists on many screens, so it must be scoped to the dialog.
- After confirming: URL becomes `/orders/drafts?asc=false&sort=number` (pathname exactly `/orders/drafts`); page title "Orders | Saleor e-commerce"; `getByTestId("page-header")` contains "Drafts" and "All draft orders"; `getByTestId("create-draft-order-button")` ("Create order") is visible; a success toast "Order cancelled" appears (toast text is not the outcome; do not rely on it). The list grid is `getByTestId("list")`; in the explored seed it showed `getByTestId("empty-data-grid-text")` "No orders found", but do not assert emptiness - populatedb content must not be relied on.
- Not-found screen (src/components/NotFoundPage/NotFoundPage.tsx): no data-test-id. Text "Ooops!...", "Something's missing", "Sorry, the page was not found", and a button with accessible name "Go back to dashboard". URL stays the draft's URL; `status-info` is absent. Locate by `page.getByText("Sorry, the page was not found")` and/or `page.getByRole("button", { name: "Go back to dashboard" })`.

Suggested DraftOrderPage additions (names for the user's action):

- `readonly moreActionsButton = this.page.getByTestId("page-header").getByTestId("show-more-button");`
- `readonly deleteMenuItem = this.page.getByTestId("cancel-order");` with a comment that the item is labelled "Cancel order" but deletes a draft.
- `readonly notFoundMessage = this.page.getByText("Sorry, the page was not found");` with a comment that the not-found screen carries no test id.
- `async delete()`: click moreActionsButton, click deleteMenuItem, click `this.dialog.getByTestId("submit")`, then `await this.page.waitForURL(url => url.pathname === "/orders/drafts")` (comment: the list pathname has no trailing segment, unlike a draft's).

Out of scope for this story (separate stories if wanted later): cancelling the dialog with "Keep draft", deleting from the drafts list bulk action, permission-restricted actors.

## Test Scenarios

### 1. Draft order deletion

**Seed:** `e2e/tests/seed.spec.ts`

#### 1.1. Staff delete a draft order from its menu after confirming #e2e

**File:** `e2e/tests/orders/draft-deletion.spec.ts`

**Steps:**

1. Arrange: with test.use({ scenario: ORDERS_SCENARIO }) and the default admin actor, create `new DraftOrderPage(page)` and call `draft.create({ from: "drafts", channel: CHANNEL.name })` (opens /orders/drafts, clicks create-draft-order-button, picks "Channel-USD" from channel-autocomplete, submits the dialog).


    - expect: The draft page opens with `status-info` showing "Draft" (asserted inside `create`)
    - expect: The URL pathname starts with /orders/drafts/ followed by the new draft's id

2. Arrange: store the draft's address with `const draftUrl = page.url()` - the id is minted by this test, so it is read, never hard-coded.


    - expect: draftUrl is the draft's /orders/drafts/<id> address

3. test.step "deleting the draft from its menu takes staff back to the drafts list": call `draft.delete()` - clicks the page-header `show-more-button` ("More actions"), clicks the `cancel-order` menu item, then clicks `submit` ("Delete") inside `getByRole("dialog")` and waits for the URL pathname to be exactly /orders/drafts.


    - expect: The confirmation dialog appears with title "Delete Draft Order" before confirming (optionally assert `draft.dialog` toContainText "Delete Draft Order")
    - expect: After confirming, `await expect(page).toHaveURL(/\/orders\/drafts(\?|$)/)` - pathname /orders/drafts, not the draft's address
    - expect: `draft.dialog` is hidden
    - expect: `getByTestId("page-header")` contains "Drafts" and `draft.createDraftButton` is visible (the drafts list, not the orders list or the draft)

4. test.step "the deleted draft's address shows the not-found screen": `await page.goto(draftUrl)`.


    - expect: `draft.notFoundMessage` ("Sorry, the page was not found") is visible
    - expect: `page.getByRole("button", { name: "Go back to dashboard" })` is visible
    - expect: `draft.statusInfo` is not visible / has count 0 - the draft itself does not render
    - expect: The URL is still draftUrl (no redirect elsewhere)
