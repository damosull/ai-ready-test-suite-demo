# Products: staff can rename a product (ticket 07)

## Application Overview

Covers ticket tickets/07.md. An admin opens the product "E2E Hoodie" from the orders scenario, renames it to "E2E Zip Hoodie", and saves with the savebar's Save button. The new name shows in the page header right away and is still there after a reload, which proves it persisted.

## Setup, following CLAUDE.md "E2E conventions" and e2e/README.md

- Spec file: e2e/tests/products/product-rename.spec.ts. It opens with a comment saying what it covers and why: there is no product-page coverage yet, and a rename that silently fails to save is the kind of failure nobody notices.
- Import test and expect from "../../fixtures/test.ts", never from @playwright/test. Relative imports keep the .ts extension.
- Use test.use({ scenario: ORDERS_SCENARIO }). ORDERS_SCENARIO and PRODUCTS are imported from "../../scenarios/orders.ts". The original name is PRODUCTS.hoodie.name ("E2E Hoodie"). The new name is a spec constant: const NEW_NAME = "E2E Zip Hoodie".
- Actor: the default admin, so the spec needs no actor override and no UI sign-in.
- No new scenario, no API set-up, no beforeEach or afterEach, no cleanup, no unique or timestamped names. The fixture restores the database before every test. Do not tag the test parallel(), because it writes.
- No hard-coded product ids, since ids change with every dump build. The test reaches the product through the UI by name (see "Reaching the product" below).
- Title is a sentence ending in the #e2e tag, for example "staff can rename a product and the new name persists #e2e". An area tag such as #products may follow it.
- One test with three test.step stages: "open the product", "rename and save", "reload and verify". Mark the set-up with // Arrange. Mark the steps // Act & Assert, because acting and asserting alternate stage by stage.
- No waitForTimeout and no networkidle. Do not change retries or timeouts. Assertions are web-first, for example await expect(locator).toHaveValue(...).

## Reaching the product (no stable id)

The Products list (/products) is a Glide data grid drawn on a canvas. Its rows are not real DOM rows or links, and the only way into them is the legacy fiber hack (clickGridCell in e2e-legacy/pages/basePage.ts). Do not use it. The tile view (tile-view-button) does have DOM tiles, but each tile's test id contains the product id (product-tile-<id>), and the chosen view is remembered between visits.

The best route is the dashboard's global Search page, /search?q=<name>&scope=products. It renders a real, accessible table. Each result is a role=row, and its cells are links to /products/<id>. The search index for the scenario's products is filled at seed time by lib/beat.ts (update_products_search_vector_task). That is the same index the draft-order product picker relies on in draft-pricing.spec.ts.

The search is full-text, so the query "E2E Hoodie" can also return populatedb's own "Hoodie". Narrow the rows with .filter({ hasText: PRODUCTS.hoodie.name }) and wait for exactly one row before clicking, in the same way as DraftOrderPage.addProduct.

## Locators verified in the running dashboard (stable target, :9200)

New page object e2e/pages/productPage.ts, class ProductPage. Locators are readonly fields initialised from this.page, with constructor(readonly page: Page) {}. Nothing in e2e/pages/ covers products today: the folder has addressDialog, draftOrderPage, homePage, loginPage and orderPage only.

Search page (/search):

- searchInput = page.getByTestId("search-input"). The search box (role textbox, name "Search") also uses data-test-id search-input inside list-search-field. It is only needed if the test types the query instead of navigating to the query URL.
- searchResultRow = page.getByRole("row"). There are no data-test-ids on src/search. Use .filter({ hasText: name }) to narrow it. Each row has three links (type, name with category, date) and all three point to the product URL. Click the link that holds the name: row.getByRole("link").filter({ hasText: name }).

Product details page (/products/<id>):

- pageHeader = page.getByTestId("page-header"). This is the top bar. Its text is the product name plus the product type (for example "Hoodie" then "Sweatshirt"), so do not assert toHaveText on the whole header.
- Page title (product name in the header): pageHeader.getByText(name, { exact: true }). The name lives in a Box with title={product.name} (src/products/components/ProductUpdatePage/Title.tsx), which has no test id. Expose a method or getter that takes the name, for example title(name). Optional, out of scope for this test-only ticket: adding data-test-id="product-details-title" to that Box would allow toHaveText. The loading skeleton is data-test-id product-details-title-skeleton.
- Browser tab title: the document title also follows the name ("Hoodie | Saleor e-commerce" became "Zip Hoodie | Saleor e-commerce" after saving). It can be checked with expect(page).toHaveTitle(new RegExp(`^${NEW_NAME} \|`)) as a supporting assertion.
- generalInformation = page.getByTestId("product-general-settings"). This is the General Information card.
- nameInput = this.generalInformation.getByRole("textbox", { name: "Name" }). It is the input name="name" and has no own test id. Scope it to the card, because other "Name"-like fields exist on the page.
- saveButton = page.getByTestId("button-bar-confirm"). This is the savebar Save button. It is disabled while the form is clean, enabled once the name is edited, and disabled again after a successful save (the form is clean again). It carries data-test-state (default, loading, success). The savebar Back button is button-bar-cancel.
- Save-success signal: the toast "Product updated" (from src/products/views/ProductUpdate/handlers/useProductUpdateHandler.ts). Locate it as page.getByRole("region", { name: /Notifications/ }).getByText("Product updated"). The toast element carries data-test-type="success" but no data-test-id. After the toast, the Save button returning to disabled proves the form took the saved value.
- Other ids seen in the header that the test does not need: app-header-back-button, product-type-display, show-product-metadata, show-more-button. The page form is product-update-form.

Suggested ProductPage methods (named for the user's action, with a why-comment where needed):

- open(name): goto /search?q=<encodeURIComponent(name)>&scope=products. Wait for searchResultRow.filter({ hasText: name }) to have count 1, then click its name link. Wait for nameInput toHaveValue(name). Comment: the product list is a canvas grid with no clickable rows, and ids differ per dump, so the global search is the route.
- rename(name): nameInput.fill(name), then saveButton.click(). Then wait for the "Product updated" toast and expect saveButton toBeDisabled. Comment: Save is also disabled before any edit, so the toast is what proves this save landed, and the disabled state that follows proves the form took the saved value.

## Checked during exploration

The seed's default scenario has no E2E Hoodie, so I explored with populatedb's "Hoodie", reached through /search?q=Hoodie&scope=products. Renaming it and clicking Save showed the "Product updated" toast. The header and the tab title changed to the new name at once, and Save became disabled. After page.reload(), the Name input and the header both showed the new name. The test itself must use the orders scenario and PRODUCTS.hoodie.name.

## Out of scope for this ticket

Validation of an empty name, renaming from the variant page, and product-list display of the new name. They could be separate stories later. The ticket asks for one user story.

## Test Scenarios

### 1. Products: rename

**Seed:** `e2e/tests/seed.spec.ts`

#### 1.1. staff can rename a product and the new name persists #e2e

**File:** `e2e/tests/products/product-rename.spec.ts`

**Steps:**

1. Arrange: the spec uses test.use({ scenario: ORDERS_SCENARIO }) with the default admin actor. Create const productPage = new ProductPage(page) and take the original name from PRODUCTS.hoodie.name ("E2E Hoodie"). NEW_NAME is "E2E Zip Hoodie". The database starts freshly restored by the fixture, with no set-up and no cleanup.
   - expect: Nothing is created through the API, and no product id is hard-coded
2. test.step "open the product": call productPage.open(PRODUCTS.hoodie.name). It navigates to /search?q=E2E%20Hoodie&scope=products, waits until exactly one result row (getByRole('row') filtered by hasText 'E2E Hoodie') is present, and clicks that row's name link.
   - expect: The URL is a product details page (/products/...)
   - expect: The General Information Name input (getByTestId('product-general-settings') > textbox 'Name') has the value 'E2E Hoodie'
   - expect: The page header (getByTestId('page-header')) shows the text 'E2E Hoodie' exactly (getByText with exact: true)
   - expect: The savebar Save button (getByTestId('button-bar-confirm')) is disabled, because the form is clean
3. test.step "rename and save": call productPage.rename(NEW_NAME). It fills the Name input with 'E2E Zip Hoodie' and clicks the savebar Save button (button-bar-confirm).
   - expect: Before the click, the Save button is enabled once the name has changed
   - expect: The 'Product updated' success toast appears in the Notifications region
   - expect: The Save button goes back to disabled after the save, so the form is clean against the saved value
   - expect: Acceptance 1: the page header shows 'E2E Zip Hoodie' (pageHeader.getByText('E2E Zip Hoodie', { exact: true }) is visible)
   - expect: The page header no longer shows 'E2E Hoodie' as an exact text match
   - expect: Supporting check: the browser tab title starts with 'E2E Zip Hoodie |'
4. test.step "reload and verify": call page.reload() on the same product URL.
   - expect: Acceptance 2a: the Name input has the value 'E2E Zip Hoodie' (toHaveValue)
   - expect: Acceptance 2b: the page header shows 'E2E Zip Hoodie' (exact text)
   - expect: The Save button is disabled after the reload, so the loaded value is the saved one and not an unsaved edit
   - expect: Failure condition: the reload shows 'E2E Hoodie'. That means the rename did not persist, which is the defect the ticket worries about
