# Products: staff can rename a product (ticket 07)

## Application Overview

Covers ticket 07: a staff member (admin actor, the suite default) opens the "E2E Hoodie" product page, changes its name to "E2E Zip Hoodie", saves with the page's Save button, and the product carries the new name both immediately after save and after a full page reload.

Target spec: e2e/tests/products/product-rename.spec.ts. Seed: e2e/tests/seed.spec.ts (suite fixture from e2e/fixtures/test.ts; restored DB, signed-in admin). Dashboard: http://localhost:9200 (stable target; main target is 9300).

STARTING STATE / DATA

- The product comes from the `orders` scenario (e2e/scenarios/orders.ts): select it with `test.use({ scenario: ORDERS_SCENARIO })` and use `PRODUCTS.hoodie.name` ("E2E Hoodie") and `PRODUCTS.hoodie.sku` ("e2e-hoodie") instead of literal strings. Its product type is "E2E Simple" (no variants). Each untagged test starts from a freshly restored DB, so no cleanup or unique suffixes are needed.
- The seed runs the default scenario, so exploration was done on a populatedb product ("Monospace Tee"); the product page is the same component for every product, so the findings below apply to E2E Hoodie.

NAVIGATION (no hard-coded IDs)

- The product list is a Glide canvas datagrid: rows are not in the accessibility tree and `datagrid-row-anchor` only gets an href on hover, so opening a product by clicking a search result would need canvas/mouse coordinates. Do not navigate that way.
- Instead look up the product ID at test time with a read-only query and go to `/products/<id>`. Recommended: add `findProductId(config, sku)` next to `findOrderId` in e2e/scenarios/orders.ts, querying `productVariant(sku: $sku) { product { id } }` with `adminToken(config)` (exact match; does not depend on the search index). Since it calls tokenCreate, and the test writes data, the spec must stay untagged (serial) - do NOT tag it `parallel(...)`.

LOCATORS (verified in the running app)

- Name input: NO data-test-id. It is a macaw `Input` with `name="name"` and accessible name "Name" -> `page.getByRole("textbox", { name: "Name", exact: true })` works (exactly one match). Optionally add `data-test-id="product-name-input"` to the first `<Input>` in src/products/components/ProductDetailsForm/ProductDetailsForm.tsx (the same id is already used in CreateProductDialog, so it is consistent); getByRole is acceptable per CLAUDE.md either way.
- Page title: `getByTestId("page-header")` (TopNavWrapper). Its text is "<product name>\n<product type>" (e.g. "E2E Zip Hoodie" + "E2E Simple"), so use `toContainText(name)` or, more precisely, `pageHeader.getByTitle(name, { exact: true })` - ProductDetailsTitle renders the name in a Box with `title={product.name}`. The browser tab title also becomes "<name> | Saleor e-commerce" (optional `expect(page).toHaveTitle(...)`).
- Save button: `getByTestId("button-bar-confirm")` (Savebar). Disabled on a pristine form, enabled once the name is edited, disabled again after a successful save. It also carries `data-test-state` ("default" at rest). Back button: `button-bar-cancel`.
- Card wrapper: `getByTestId("product-general-settings")`; page form: `product-update-form`.
- Success toast: notification region contains "Product updated".

OBSERVED BEHAVIOUR / WAIT SIGNALS

- Clicking Save sends GraphQL operation `ProductUpdate` (response `data.productUpdate.errors: []`), followed by refetches `ProductDetails`, `ProductVariantsGrid`, `ProductDoctorVariants`.
- The page-header title is driven by the fetched product, not the form: it still shows the OLD name while the field is edited and right after the ProductUpdate response, and only switches after the ProductDetails refetch. So assert the title with a web-first `await expect(...)` (it retries), never with a one-shot innerText read.
- After reload, `product-general-settings` renders BEFORE data arrives with an empty Name value; wait with `await expect(nameInput).toHaveValue(newName)` rather than reading the value after waitFor().
- Do not use networkidle, waitForTimeout, nth or force.

PAGE OBJECT

- A page object is appropriate: add e2e/pages/productPage.ts (`ProductPage`) following e2e/pages/orderPage.ts conventions - `readonly` locator fields from `this.page` (`nameInput`, `pageHeader`, `saveButton`, `generalSettings`), empty `constructor(readonly page: Page) {}`, `goto(productId)` that navigates to `/products/${productId}` and waits for the name input to have a non-empty value (or for `generalSettings`), and `rename(name)` / `save()` that fills the name, starts `page.waitForResponse` for operationName `ProductUpdate`, clicks Save and waits for the response and for the save button to become disabled again. Assertions stay in the spec. Import `type Page` from @playwright/test in the page object; the spec imports `test`/`expect` from ../../fixtures/test.ts with .ts extensions.

SPEC SHAPE

- Doc comment describing the flow (no legacy SALEOR\_<n> replacement unless one is identified). Title as a user story ending in #e2e (e.g. "Staff can rename a product and the new name persists #e2e #products"). Multi-stage: `// Arrange`, then `// Act & Assert` with one `test.step` per stage (rename and save; reload). Runs on both stable and main targets; no target gating needed.
- Verify with `pnpm run check-types:e2e`, oxlint, Prettier, `pnpm e2e tests/products/product-rename.spec.ts` (and optionally `pnpm e2e:main ...`).

## Test Scenarios

### 1. Products - rename

**Seed:** `e2e/tests/seed.spec.ts`

#### 1.1. Staff can rename a product and the new name persists #e2e #products

**File:** `e2e/tests/products/product-rename.spec.ts`

**Steps:**

1. Arrange: with `test.use({ scenario: ORDERS_SCENARIO })` and the default admin actor, look up the E2E Hoodie product ID with a read-only query (e.g. `findProductId(config, PRODUCTS.hoodie.sku)` using `productVariant(sku:) { product { id } }`), then navigate to `/products/<id>` via `ProductPage.goto(id)`.


    - expect: The product page loads at /products/<id>
    - expect: The Name textbox (getByRole('textbox', { name: 'Name', exact: true })) has value "E2E Hoodie" (web-first toHaveValue; the field is briefly empty while loading)
    - expect: getByTestId('page-header') contains "E2E Hoodie"
    - expect: getByTestId('button-bar-confirm') is disabled (pristine form)

2. Act & Assert, step 'rename and save': clear the Name textbox and fill "E2E Zip Hoodie".


    - expect: The Name textbox has value "E2E Zip Hoodie"
    - expect: The Save button (button-bar-confirm) becomes enabled
    - expect: The page header still shows "E2E Hoodie" (title follows saved data, not the form) - optional check

3. Register `page.waitForResponse` for a POST whose postDataJSON().operationName === 'ProductUpdate', click the Save button (button-bar-confirm), and await the response.


    - expect: The ProductUpdate response returns `data.productUpdate.errors` equal to []
    - expect: A success notification "Product updated" appears
    - expect: The Save button becomes disabled again
    - expect: The page header (getByTestId('page-header')) contains / has a child with title exactly "E2E Zip Hoodie" (web-first; it updates after the ProductDetails refetch)
    - expect: The page header no longer contains "E2E Hoodie" as the product title (getByTitle('E2E Hoodie', { exact: true }) has count 0)

4. Act & Assert, step 'reload': call page.reload().


    - expect: The Name textbox has value "E2E Zip Hoodie" (web-first toHaveValue, since it renders empty before data loads)
    - expect: The page header contains the title "E2E Zip Hoodie"
    - expect: The browser tab title is "E2E Zip Hoodie | Saleor e-commerce" (optional)
    - expect: The Save button is disabled (nothing unsaved)
    - expect: Failure condition: if the field or header shows "E2E Hoodie" after reload, the rename did not persist
