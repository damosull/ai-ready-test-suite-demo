# Customers: customer manager saves a note on a customer (ticket 06)

## Application Overview

Coverage for ticket `tickets/06.md`. Customer service staff hold only the customer-management permission (MANAGE_USERS) and keep short notes on a customer's record. The note is the "Note" textarea in the Contact card on the customer details page and is saved with the page's Save button. There is no e2e coverage of the Customers area yet.

## Intended implementation

- Spec file: `e2e/tests/customers/customer-note.spec.ts` (new `customers/` area folder). Import `test`/`expect` from `../../fixtures/test.ts`; import `CUSTOMER` and `ORDERS_SCENARIO` from `../../scenarios/orders.ts`.
- Seed file used for planning/exploration: `e2e/tests/seed.spec.ts` (restores `default`, signs in as admin, opens `/`). Note: the seed restores the `default` scenario, where Ada Lovelace does NOT exist; during exploration she was created temporarily and the UI was then signed in as `user.manager@example.com`. The real spec must use `ORDERS_SCENARIO`, which already contains her.
- `test.use({ actor: "customer" })` -> `user.manager@example.com`, whose only permission is MANAGE_USERS (`e2e/lib/actors.ts`). Not `admin`, not a UI login.
- `test.use({ scenario: ORDERS_SCENARIO })`. Do not create data at test time; no hardcoded IDs (the customer's ID changes per dump build, so reach her through the list search, not a URL).
- Expected values come from `CUSTOMER` (`email: "e2e.customer@example.com"`, `firstName: "Ada"`, `lastName: "Lovelace"`). The scenario's `customerCreate` sets no `note`, so the note starts empty; guard that with an assertion before writing.
- Serial (untagged): the test writes, so it must not be tagged `parallel(...)`. No retries, no `waitForTimeout`.
- Doc comment describing the flow; title `Customer manager saves a note on a customer #e2e`; `// Arrange` then `// Act & Assert` with named `test.step`s.
- Page objects (new): `e2e/pages/customerListPage.ts` and `e2e/pages/customerDetailsPage.ts`, `readonly` fields from `this.page`, empty `constructor(readonly page: Page) {}`, methods that wait for their result, assertions left to the spec.
- Run with `pnpm e2e tests/customers/customer-note.spec.ts` and `pnpm e2e:main tests/customers/customer-note.spec.ts`; `pnpm run check-types:e2e`, oxlint and Prettier on changed files.

## Locators observed in the live UI (stable target, http://localhost:9200)

Customers list (`/customers/`):
- Sidebar link: `getByRole("link", { name: "Customers", exact: true })` -> `/customers/?asc=true&sort=name`. Visible to the customer manager (their sidebar shows only Home, Customers, Extensions).
- Search box: `getByTestId("search-input")` (accessible name "Search customers"; wrapper `list-search-field`). Typing updates the URL to `...&query=e2e.customer%40example.com` after a debounce.
- Grid container: `getByTestId("list")`. The grid is a Glide canvas; its rows are NOT clickable DOM. Glide renders a zero-size accessibility table inside it: `getByTestId("list").getByRole("row", { includeHidden: true })` (header + body rows) and `getByRole("gridcell", { name: CUSTOMER.email, exact: true, includeHidden: true })`. These are attached but not visible, so use them only for waiting (`toBeAttached` / `toHaveCount`), never for clicking.
- Opening a row: hovering a body row activates `getByTestId("datagrid-row-anchor")`, a real `<a>` whose `href` becomes `/customers/<id>?`. Observed geometry: header row ~41px, body row ~41px; hovering `getByTestId("list")` at `position: { x: 150, y: 60 }` targets the first body row. Then click the anchor and `waitForURL` to the details path. Wait for the search to narrow (body rows == 1 and the email gridcell attached) BEFORE hovering, because the grid re-renders when the search lands (same pattern as `DraftOrderPage.addProduct`). Comment this non-obvious hover in the page object.
- With the email query the "All" tab showed 1 matching row: `Ada Lovelace | e2e.customer@example.com`.

Customer details page (`/customers/<id>`):
- Title shows "Ada Lovelace" with "Active" / "Unverified" badges (`account-status-active`, `account-status-email-unverified`).
- Contact card: `getByTestId("customer-details")`; fields `customer-first-name`, `customer-last-name`, `customer-email`, and the note `getByTestId("customer-note")` (a `<textarea>`; also `getByRole("textbox", { name: "Note", exact: true })`). Editable for the customer manager.
- Save: `getByTestId("button-bar-confirm")` (also `getByRole("button", { name: "Save", exact: true })`). Disabled while the form is pristine; enabled after editing the note.
- Back/cancel: `getByTestId("button-bar-cancel")` ("Back").
- Unsaved-changes hint in the savebar: `getByTestId("customer-save-composition")`, text "Unsaved changes: details" after editing the note; removed after a successful save.
- Save completion signals (observed in order): mutation `UpdateCustomer` returns no errors; toast in `getByRole("region", { name: /Notifications/ })` with "Success" / "Customer updated"; `button-bar-confirm` gets `data-test-state="success"`; the composition hint disappears. Recommended page-object wait: the "Customer updated" toast (user-visible) and/or `customer-save-composition` hidden. After a reload, Save is disabled again with `data-test-state="default"`.
- Leaving with unsaved changes (e.g. `getByRole("link", { name: "All customers" })`) opens `getByRole("dialog")` "Leave without saving changes?" with `getByTestId("back")` ("Keep editing"), `getByTestId("ignore-changes")` ("Ignore changes") and `close-button`.
- For the customer manager, cards gated on other permissions (Recent Orders / Total orders KPIs need MANAGE_ORDERS, Gift cards need MANAGE_GIFT_CARD) are hidden. Do not assert staff names (seed-random, e.g. the manager rendered as "William Archer").

## Exploration findings to surface

- The customer manager CAN reach the customers list and the details page, and can edit and save the note. Verified end to end: note "Prefers delivery after 5pm" saved, toast "Customer updated", value persisted after reload.
- Observed with `order.manager@example.com` (MANAGE_ORDERS only): the Customers nav item is visible, but opening a customer details URL shows "Sorry, the page was not found" plus an error toast "To access this path, you need one of the following permissions: MANAGE_USERS, MANAGE_STAFF ... MANAGE_USERS, OWNER". That contradicts the comment in `CustomerDetailsPage.tsx` ("Users with only MANAGE_ORDERS / MANAGE_STAFF can read this page" with a read-only savebar `savebar-read-only`). Out of scope for ticket 06; raise separately rather than encoding it in this spec.

## Test Scenarios

### 1. Customer note (ticket 06) - e2e/tests/customers/customer-note.spec.ts

**Seed:** `e2e/tests/seed.spec.ts`

#### 1.1. Customer manager saves a note on a customer #e2e

**File:** `e2e/tests/customers/customer-note.spec.ts`

**Steps:**
  1. Arrange: spec uses `test.use({ actor: "customer" })` (user.manager@example.com, MANAGE_USERS only) and `test.use({ scenario: ORDERS_SCENARIO })`. Define `const note = "Prefers delivery after 5pm";` (a fixed string is fine: the database is restored before the test, so no uniquifying). Instantiate `CustomerListPage` and `CustomerDetailsPage`.
    - expect: The browser starts already signed in as the customer manager; no UI login is performed
    - expect: The restored database contains Ada Lovelace (CUSTOMER.email) with no note
  2. Step "the customer manager finds the customer by email": navigate to `/customers/` (via `customerList.goto()` that waits for `search-input`), then `customerList.search(CUSTOMER.email)`: fill `getByTestId("search-input")` and wait until `getByTestId("list").getByRole("gridcell", { name: CUSTOMER.email, exact: true, includeHidden: true })` is attached and the grid has exactly one body row (rows with includeHidden == 2, header included).
    - expect: The Customers list loads for the customer manager (no permission error, no 'page not found')
    - expect: The grid narrows to a single row whose email cell is exactly `e2e.customer@example.com` and name cell is `Ada Lovelace` (`${CUSTOMER.firstName} ${CUSTOMER.lastName}`)
  3. Step "opening the customer shows her details": `customerList.openFirstRow()` - hover `getByTestId("list")` at the first body row (position ~{ x: 150, y: 60 }), click `getByTestId("datagrid-row-anchor")`, `waitForURL` to `/customers/<id>` (no `/add`, not the list), and wait for `getByTestId("customer-note")` to be visible.
    - expect: The details page shows the customer's email in `getByTestId("customer-email")` (toHaveValue CUSTOMER.email) and first/last name fields with Ada / Lovelace
    - expect: Guard: `getByTestId("customer-note")` has value "" before writing, so the later assertion proves the save, not seed data
    - expect: `getByTestId("customer-note")` is editable and `getByTestId("button-bar-confirm")` is disabled while nothing has changed
  4. Step "writing a note and saving shows the new note": `customerDetails.saveNote(note)` - fill `getByTestId("customer-note")`, click `getByTestId("button-bar-confirm")`, then wait for the save to complete: the notification `getByText("Customer updated", { exact: true })` is visible and `getByTestId("customer-save-composition")` is hidden.
    - expect: Before clicking Save, the savebar hint `customer-save-composition` reads "Unsaved changes: details" and Save is enabled
    - expect: After saving, a success notification "Customer updated" appears
    - expect: `getByTestId("customer-note")` has value `note` (acceptance criterion: the note field shows the new note)
    - expect: The unsaved-changes hint is gone
  5. Step "the note survives a reload": `page.reload()` then wait for `getByTestId("customer-note")` and the email field to be populated (toHaveValue CUSTOMER.email, so the form has loaded rather than showing the loading skeleton `customer-details-loading`).
    - expect: `getByTestId("customer-note")` still has value `note` (acceptance criterion: persisted after reload)
    - expect: `getByTestId("button-bar-confirm")` is disabled again (form pristine with the saved value)

### 2. Customer note - optional follow-up scenarios (not required by ticket 06)

**Seed:** `e2e/tests/seed.spec.ts`

#### 2.1. Customer manager discards an unsaved note when leaving the page #e2e

**File:** `e2e/tests/customers/customer-note.spec.ts`

**Steps:**
  1. Arrange: same `actor: "customer"` and `ORDERS_SCENARIO`. Find and open Ada via the list search as in the main test.
    - expect: Details page is shown with an empty note
  2. Fill `getByTestId("customer-note")` with "Unsaved draft note" and click the top-nav `getByRole("link", { name: "All customers" })` without saving.
    - expect: `getByRole("dialog")` appears with text "Leave without saving changes?" and buttons `back` ("Keep editing") and `ignore-changes` ("Ignore changes")
  3. Click `getByRole("dialog").getByTestId("ignore-changes")`; wait for the URL to be the customers list; reopen Ada (search + row anchor).
    - expect: The list URL keeps the `query=e2e.customer%40example.com` search
    - expect: On reopening, `customer-note` is empty: the discarded note was not saved

#### 2.2. Customer manager clears an existing note (requires a scenario with a pre-set note)

**File:** `e2e/tests/customers/customer-note.spec.ts`

**Steps:**
  1. Only if wanted: add a scenario (parent "default" or built on the orders data) that sets a known note on a customer via `customerUpdate`, export it as a constant, and use it with `test.use({ scenario })`. Do not set the note at test time.
    - expect: Scenario is registered in `e2e/scenarios/registry.ts` and exports the note constant
  2. Open the customer, clear `customer-note`, Save, then reload.
    - expect: "Customer updated" notification appears
    - expect: After reload the note field is empty
