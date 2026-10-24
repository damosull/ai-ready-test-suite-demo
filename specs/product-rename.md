# Products: staff can rename a product

## Application Overview

Ticket 07. Merchandisers rename a product on its product page (Catalog > Products > product details). The name is edited in the "Name" field of the General Information card and saved with the page's Save button in the bottom save bar. The page title (the TopNav heading at the top of the product page, `data-test-id="page-header"`) follows the saved name.

Target spec: `e2e/tests/products/product-rename.spec.ts`, signed in as the default `admin` actor, with `test.use({ scenario: ORDERS_SCENARIO })`. Import `ORDERS_SCENARIO` and `PRODUCTS` from `e2e/scenarios/orders.ts` and use `PRODUCTS.hoodie.name` ("E2E Hoodie") rather than a string literal. The new name "E2E Zip Hoodie" can be a constant in the spec. Title: `Rename a product #e2e`. Use `// Arrange`, `// Act`, `// Assert` comments like `e2e/tests/orders/*.spec.ts`. The DB is restored before every test, so the spec needs no cleanup and no unique names.

How this was explored: the seed (`e2e/tests/seed.spec.ts`) uses the suite fixture's default `scenario: "default"`, so planner_setup_page only gives the populatedb catalogue. Searching for "E2E Hoodie" there correctly returns "No products found". I walked the same flow on the populatedb product "Monospace Tee" (renamed it to "Monospace Zip Tee"). The page structure and locators are the same for any product. The spec itself MUST use the orders scenario, which creates E2E Hoodie and runs the beat tasks so it can be found by search.

Locators checked in the running dashboard (stable target, http://localhost:9200):
- Products list: `/products/`. Search box is `getByTestId("search-input")` (placeholder "Search products..."). Filling it updates the URL to `?query=...&sort=rank`. Results are rendered in a Glide datagrid canvas (`[data-testid="data-grid-canvas"]`, note the attribute is `data-testid` here). Its accessible mirror table holds rows such as "<name> ... Live in N channels ..." (row 0 is the header). Clicking the row opens the product. The canvas also has an overlay link `getByTestId("datagrid-row-anchor")`, which follows the hovered row: hover over the row first, then click. Waiting for the URL `/products/<id>` confirms navigation.
- Product page: URL `/products/<base64 id>`. Document title "<name> | Saleor e-commerce".
- Page title (TopNav heading): `getByTestId("page-header")`. Its inner text is "<name>\n<product type>" (for example "Monospace Tee\nTop"), so do not assert exact text on the whole header. The name element has a `title` attribute equal to the name. Use `getByTestId("page-header").getByTitle(name, { exact: true })` and assert `toHaveText(name)` on it, or use `toContainText` on the header. Observed: the heading does NOT change while typing. It only updates after a successful save.
- Name field: `getByRole("textbox", { name: "Name" })`. The input has `name="name"` and no data-test-id; the legacy page object used `[name='name']`. Assert with `toHaveValue`.
- Save button: `getByTestId("button-bar-confirm")` (label "Save"), in the bottom save bar next to "Back". It is disabled while the form is pristine, enabled after an edit, and disabled again after save and after reload.
- Success notification: a Sonner toast in the region "Notifications alt+T" showing "Success" / "Product updated". It has no data-test-id. Use `page.getByRole("region", { name: /Notifications/ }).getByText("Product updated")`, or `[data-sonner-toast]` filtered by text.

Suggested page object: `e2e/pages/productPage.ts` (readonly fields from `this.page`, empty `constructor(readonly page: Page) {}`, as in `e2e/pages/orderPage.ts`). Fields: `header`, `nameInput`, `saveButton`, `notifications`. Methods: `title(name)` -> `header.getByTitle(name, { exact: true })` and `rename(name)` (fill + save). A small products-list page object (or a method) for search-and-open. Alternative robust route, if the canvas click proves flaky: look up the product id by name over GraphQL (a read, like `findOrderId`) and go to `/products/<id>`. The ticket asks for opening the product as a user would, so list search is preferred.

## Test Scenarios

### 1. Products: rename

**Seed:** `e2e/tests/seed.spec.ts`

#### 1.1. Rename a product #e2e

**File:** `e2e/tests/products/product-rename.spec.ts`

**Steps:**
  1. Arrange: the spec uses `test.use({ scenario: ORDERS_SCENARIO })` and the default admin actor, so the DB is restored to the orders scenario and the browser is signed in. Go to `/products/`.
    - expect: The Products list loads with the heading "Products" in `page-header` and the search box `getByTestId("search-input")` visible
  2. Arrange: fill the search box with `PRODUCTS.hoodie.name` ("E2E Hoodie").
    - expect: The URL gains `query=E2E%20Hoodie`
    - expect: The datagrid (`[data-testid="data-grid-canvas"]`) shows a row with the text "E2E Hoodie" (wait for it, as the legacy `gridCanvas.getByText(...)` pattern does)
  3. Arrange: open the E2E Hoodie row. Hover over the row in the canvas, then click it (or click `datagrid-row-anchor`). Wait for the URL to match `/products/<id>`.
    - expect: The product page opens
    - expect: `getByTestId("page-header").getByTitle("E2E Hoodie", { exact: true })` has the text "E2E Hoodie"
    - expect: The Name field (`getByRole("textbox", { name: "Name" })`) has the value "E2E Hoodie"
    - expect: The Save button (`getByTestId("button-bar-confirm")`) is disabled
  4. Act: clear the Name field and fill it with "E2E Zip Hoodie".
    - expect: The Name field has the value "E2E Zip Hoodie"
    - expect: The Save button is enabled
    - expect: The page title still reads "E2E Hoodie" (the title follows the saved name, not the draft). Optional check, observed during exploration
  5. Act: click the Save button.
    - expect: A success notification "Product updated" appears in the Notifications region
    - expect: The page title (`page-header` element titled "E2E Zip Hoodie") shows "E2E Zip Hoodie" (acceptance criterion 1)
    - expect: `page-header` no longer contains "E2E Hoodie" as its title element (`getByTitle("E2E Hoodie", { exact: true })` has count 0)
    - expect: The Save button is disabled again
  6. Assert: reload the page (`page.reload()`) and wait for the Name field to be visible.
    - expect: The URL is still the same `/products/<id>`
    - expect: The Name field has the value "E2E Zip Hoodie" (acceptance criterion 2, persisted)
    - expect: The page title shows "E2E Zip Hoodie" (acceptance criterion 2)
    - expect: The Save button is disabled (no unsaved changes)
