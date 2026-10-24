# Products: staff can rename a product (ticket 07)

## Application Overview

Covers ticket .repo-check/ticket-07.md: a staff member renames an existing product from its product page and the new name persists. One happy-path scenario, scoped to the acceptance criteria.

TARGET FILE: e2e/tests/products/product-rename.spec.ts

SETUP / CONVENTIONS (from e2e/README.md and e2e/tests/orders/*.spec.ts)
- Import `test` and `expect` from `../../fixtures/test.ts` (NOT from @playwright/test).
- Import `ORDERS_SCENARIO` and `PRODUCTS` from `../../scenarios/orders.ts` and declare `test.use({ scenario: ORDERS_SCENARIO });` at file level. The default scenario (used by e2e/tests/seed.spec.ts) does NOT contain "E2E Hoodie"; the "orders" scenario creates it (PRODUCTS.hoodie = { name: "E2E Hoodie", sku: "e2e-hoodie", price: 50 }).
- Reference the product by `PRODUCTS.hoodie.name`; never hard-code a product id. Ids (e.g. /products/UHJvZHVjdDoxNTI%3D) are minted per seed build, so reach the product through the products list search.
- Actor: default `admin` (no `test.use({ actor })` needed). Starting state: signed in, database freshly restored to the orders scenario before the test - no cleanup and no unique names needed. Do not tag `parallel()` - the test writes.
- Test title ends with `#e2e`, e.g. "Staff renames a product and the new name persists after reload #e2e".
- Body uses `// Arrange`, `// Act & Assert` comments and one `test.step` per stage (open product, rename and save, reload and verify), matching order-creation.spec.ts.
- Put locators in a new page object `e2e/pages/productPage.ts` (class `ProductPage`, `readonly` fields initialized from `this.page`, empty `constructor(readonly page: Page) {}`), with a method such as `openFromList(name: string)`. Playwright testIdAttribute is `data-test-id`, so `getByTestId(...)` maps to `data-test-id`.

LOCATORS DISCOVERED (verified live against the stable 3.23 stack on a default-seed product)
Products list (/products/):
- Search input: `page.getByTestId("search-input")` (<input>, accessible name/placeholder "Search products..."; wrapper `list-search-field`). Typing updates the URL with `query=<text>` and sort switches to `sort=rank`.
- The list is a Glide data grid drawn on a canvas - rows are NOT DOM links. An accessible shadow table exists inside `page.locator('[data-testid="data-grid-canvas"]')` (note: `data-testid`, not `data-test-id`) with `role="grid"`, rows `tr[role=row][aria-rowindex]` (header row is aria-rowindex=1, first data row 2) and cells `td[role=gridcell]` with ids `glide-cell-<col>-<row>`; the Product name is column 1 (e.g. `glide-cell-1-0` = "Apple Juice"). These cells are attached but not visible, so use them to locate/wait (`toBeAttached`, text matching), not to click.
- Product row link: `page.getByTestId("datagrid-row-anchor")` - a single <a> overlay whose `href` becomes `/products/<id>?` for whichever row the mouse hovers. Verified recipe: hover the canvas over the target row (header ~48px, rows ~40px tall: data row N centre ~= canvas.y + 48 + 40*(N-1) + 20), then `datagridRowAnchor.click()` and `page.waitForURL(/\/products\/[^/?]+/)`. Find the target row index by matching the gridcell text exactly to PRODUCTS.hoodie.name (search "E2E Hoodie" may also return "E2E Tee" by rank), rather than assuming the first row. (Legacy equivalent: e2e-legacy/pages/basePage.ts `clickGridCell` / `findRowIndexBasedOnText`.)
Product detail page (/products/<id>):
- Product name input: `page.getByRole("textbox", { name: "Name", exact: true })` (underlying `input[name="name"]`; there is no `product-name-input` test id on the edit page - that id only exists in the create dialog). IMPORTANT: right after load/reload the input briefly renders empty before data arrives - always assert with web-first `toHaveValue(...)`, never read `inputValue()` immediately.
- Save button: `page.getByTestId("button-bar-confirm")` (accessible name "Save", in the bottom savebar). Disabled until the form is dirty; becomes enabled after editing the name; disabled again after a reload. Sibling: `button-bar-cancel` ("Back").
- Page title: header container `page.getByTestId("page-header")` whose innerText is "<product name>\n<product type>" (e.g. "Apple Juice\nJuice"), so do not use `toHaveText` on the whole header. The title element itself is `page.getByTestId("page-header").getByTitle(name, { exact: true })` (a <div title="<name>">; exposed in the a11y tree as generic "<name>", NOT role=heading). Back link in header: `app-header-back-button` ("All products"); product type chip: `product-type-display`. The header reflects SAVED data only: after typing a new name but before saving it still shows the old name, which makes it a meaningful post-save assertion. The browser document title also follows: "<name> | Saleor e-commerce" (`expect(page).toHaveTitle(...)` is an optional extra check).
- Success notification: Sonner toast in region "Notifications alt+T"; success content is `page.locator('[data-test-type="success"]')` containing "Success" and the message "Product updated" (has a "Close notification" button). Legacy locator was the same `[data-test-type="success"]`.

OBSERVED BEHAVIOUR (exploration on default-seed "Apple Juice"): fill Name -> Save enabled -> click Save -> toast "Success / Product updated" -> header title and document title switch to the new name, field keeps new value -> reload -> field, header title and document title show the new name, Save disabled. Search of products created via API works because the scenario build runs the beat search-index task (README).

OUT OF SCOPE (per ticket): validation of empty/too-long names, slug changes, cancel/discard flows, other fields.

## Test Scenarios

### 1. Products - rename

**Seed:** `e2e/tests/seed.spec.ts`

#### 1.1. Staff renames a product and the new name persists after reload #e2e

**File:** `e2e/tests/products/product-rename.spec.ts`

**Steps:**
  1. Arrange: the spec declares `test.use({ scenario: ORDERS_SCENARIO })` (imported from e2e/scenarios/orders.ts) and imports `test`/`expect` from e2e/fixtures/test.ts. Define `const newName = "E2E Zip Hoodie";` and create `new ProductPage(page)`. Fresh state: signed in as admin, DB restored to the orders scenario.
    - expect: No setup or cleanup is performed by the test; PRODUCTS.hoodie.name ("E2E Hoodie") exists in the restored database
  2. Step "open the product from the products list": navigate to `/products/`, fill `getByTestId("search-input")` with PRODUCTS.hoodie.name.
    - expect: URL contains `query=E2E%20Hoodie` (or equivalent encoding)
    - expect: The grid's shadow table (`[data-testid="data-grid-canvas"]`) contains a gridcell whose text is exactly "E2E Hoodie"
  3. Determine the row index of the "E2E Hoodie" gridcell, hover the canvas over that row, then click `getByTestId("datagrid-row-anchor")`.
    - expect: URL changes to `/products/<id>` (match `/\/products\/[^/?]+/`)
    - expect: `getByRole("textbox", { name: "Name", exact: true })` has value "E2E Hoodie"
    - expect: `getByTestId("page-header").getByTitle("E2E Hoodie", { exact: true })` is visible
    - expect: `getByTestId("button-bar-confirm")` (Save) is disabled
  4. Step "rename and save": fill the Name textbox with "E2E Zip Hoodie".
    - expect: Save button `button-bar-confirm` becomes enabled
    - expect: (optional) page header title still shows "E2E Hoodie" - the header only follows saved data
  5. Click the Save button `getByTestId("button-bar-confirm")`.
    - expect: Success toast `[data-test-type="success"]` is visible and contains "Product updated"
    - expect: ACCEPTANCE 1: `getByTestId("page-header").getByTitle("E2E Zip Hoodie", { exact: true })` is visible (page title shows the new name)
    - expect: (optional) `expect(page).toHaveTitle(/^E2E Zip Hoodie \|/)`
  6. Step "reload and verify the name persisted": `page.reload()`.
    - expect: ACCEPTANCE 2a: Name textbox `toHaveValue("E2E Zip Hoodie")` (web-first assertion - the field is briefly empty while loading)
    - expect: ACCEPTANCE 2b: `getByTestId("page-header").getByTitle("E2E Zip Hoodie", { exact: true })` is visible
    - expect: Save button `button-bar-confirm` is disabled (nothing unsaved)
    - expect: Failure condition: the field or title showing "E2E Hoodie" after reload means the rename did not persist
