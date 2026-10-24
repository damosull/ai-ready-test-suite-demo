# 02 · Draft order: staff can delete a draft they no longer need

## Application Overview

Staff delete a draft order from the draft page's "More actions" menu, after a confirmation dialog. If deletion silently failed, the drafts list would keep filling with orders nobody can get rid of. This plan covers ticket 02 with one focused, self-contained test, using only existing infrastructure.

Starting state: every test starts from a restored database and a signed-in admin (suite fixture `e2e/fixtures/test.ts`, via seed `e2e/tests/seed.spec.ts`). The spec should follow the existing order specs: `test.use({ scenario: ORDERS_SCENARIO })`, `CHANNEL` from `e2e/scenarios/orders.ts` (`CHANNEL.name` = "Channel-USD"), `// Arrange` / `// Act & Assert` comments, one `test.step` per stage, and the `#e2e` tag in the title. No new page object methods, scenarios or helpers are required. Locators the page object doesn't have yet can go inline in the spec.

Starting the draft (required by the ticket). Use `DraftOrderPage` from `e2e/pages/draftOrderPage.ts`: `const draft = new DraftOrderPage(page); await draft.create({ from: "drafts", channel: CHANNEL.name });`. `create` opens `/orders/drafts`, clicks "Create order" (`create-draft-order-button`), picks "Channel-USD" in the "Select a channel" dialog (`channel-autocomplete` / `select-option`), confirms (dialog `submit`), and waits until `draft.statusInfo` (`status-info`) reads "Draft". The browser is then on `/orders/drafts/<id>`, titled "Draft Order #<n> | Saleor e-commerce", with the header "Order #<n>" plus the "Draft" pill and "Channel-USD". After `create`, record the draft's address with `const draftUrl = page.url()`.

UI observed on the stable target (http://localhost:9200, Saleor 3.23):

- Draft page menu: an icon button in the page header, accessible name "More actions", `data-test-id="show-more-button"`, sitting next to "Edit order metadata". It opens a `menu` with ONE item: menuitem "Cancel order". The label says "Cancel order" even though the action deletes the draft. The source sets `testId: "cancel-order"`, but no `data-test-id` reaches the DOM, so use `page.getByRole("menuitem", { name: "Cancel order" })`. Clicking it appends `?action=cancel` to the URL.
- Delete confirmation dialog (`role="dialog"`, component `OrderDraftCancelDialog`): title "Delete Draft Order", body "Are you sure you want to delete draft <n>?". Buttons: "Close" (X, `close-button`), "Keep draft" (`back`) and "Delete" (`submit`). Use `draft.dialog.getByRole("button", { name: "Delete" })` (or `draft.dialog.getByTestId("submit")`).
- After confirming: the app goes to the drafts list at `/orders/drafts?asc=false&sort=number` (page title "Orders | Saleor e-commerce"). The page header (`data-test-id="page-header"`) shows "Drafts" with the subtitle "All draft orders" and the "Create order" button (`create-draft-order-button`). It isn't an ARIA heading, so assert with text (for example `page.getByTestId("page-header")` toContainText "Drafts"), not `getByRole("heading")`. A success toast also appears: "Success" / "Order cancelled". Its wording is legacy, so don't assert on it.
- "Page was not found" screen (`src/components/NotFoundPage/NotFoundPage.tsx`, no test ids): "Ooops!...", "Something's missing", "Sorry, the page was not found", and a "Go back to dashboard" button. The URL stays on `/orders/drafts/<id>`, and the page title changes to "Orders | Saleor e-commerce". Assert with `page.getByText("Sorry, the page was not found")`, and check that the draft UI is absent (`draft.statusInfo` not visible).

Out of scope: the "Keep draft" or Close paths, deletion from the drafts list, and non-admin actors. Those would be follow-up tickets.

Target test file: e2e/tests/orders/draft-delete.spec.ts.

## Test Scenarios

### 1. Draft order deletion

**Seed:** `e2e/tests/seed.spec.ts`

#### 1.1. Staff deletes a draft order from its menu #e2e

**File:** `e2e/tests/orders/draft-delete.spec.ts`

**Steps:**

1. Arrange: in a spec with `test.use({ scenario: ORDERS_SCENARIO })`, create `const draft = new DraftOrderPage(page)`. Step "start a draft in the USD channel": call `await draft.create({ from: "drafts", channel: CHANNEL.name })`, then store `const draftUrl = page.url()`.


    - expect: `draft.statusInfo` reads "Draft". `create` already asserts this.
    - expect: The URL matches `/orders/drafts/<id>` (for example `expect(page).toHaveURL(/\/orders\/drafts\/[^/?]+$/)`), so `draftUrl` really is the draft's address.
    - expect: The page header shows "Channel-USD".

2. Step "delete it from the draft's menu": click the "More actions" button in the draft header (`page.getByTestId("show-more-button")`), then click the menuitem "Cancel order" (`page.getByRole("menuitem", { name: "Cancel order" })`).


    - expect: The confirmation dialog (`draft.dialog`) is visible, with the title "Delete Draft Order" and the text "Are you sure you want to delete draft".
    - expect: The dialog offers "Keep draft" and "Delete" buttons.
    - expect: The draft isn't deleted yet: the URL is still the draft's, with `?action=cancel` added.

3. Step "confirm": click "Delete" in the dialog (`draft.dialog.getByRole("button", { name: "Delete" })`).


    - expect: The dialog closes.
    - expect: Staff land back on the drafts list: the URL pathname is `/orders/drafts`, query `?asc=false&sort=number` (assert the path, for example `expect(page).toHaveURL(/\/orders\/drafts(\?|$)/)`, so the sort params don't make the test brittle).
    - expect: The drafts list header (`page.getByTestId("page-header")`) contains "Drafts" and "All draft orders", and the "Create order" button (`draft.createDraftButton`) is visible.

4. Step "the deleted draft's address is gone": `await page.goto(draftUrl)`.


    - expect: The not-found screen is shown: `page.getByText("Sorry, the page was not found")` is visible, along with "Something's missing" and a "Go back to dashboard" button.
    - expect: The draft isn't rendered: `draft.statusInfo` isn't visible, and no "Order #<n>" draft header or "Finalize" button appears.
    - expect: Failure condition: if the draft page (status "Draft") loads again, deletion silently failed and the test must fail.
