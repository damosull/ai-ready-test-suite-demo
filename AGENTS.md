# Saleor Dashboard

## Conventions

- Use `@saleor/macaw-ui-next` components and tokens; do not add usages of legacy
  `@saleor/macaw-ui`, Material-UI, or `makeStyles`.
- Import icons directly from `lucide-react`; Macaw icons are deprecated.
- Use CSS Modules (`.module.css`) for custom styles.
- Write new code with strict TypeScript checking; do not add `// @ts-strict-ignore`.
- Use named exports and direct imports. Do not introduce barrel exports;
  route entry points named `index.tsx` are allowed.
- Prefer destructured object parameters and typed declarations over type assertions.
  Explicitly type test fixtures.
- Internationalize user-facing text with `react-intl`. Check `src/intl.ts` and nearby
  component messages for reusable messages before defining new ones.
- Add a colocated `ComponentName.stories.tsx` for new UI components.
- In tests, use `// Arrange`, `// Act`, and `// Assert` comments. Mock GraphQL
  operations with typed fixtures.
- For lists that can contain 50+ items, keep navigation and controls usable and
  selected items discoverable. Choose scrolling, pagination, or virtualization to
  suit the component. Use skeletons for loading and handle empty states.

## Task-specific context

Read documentation when its subject is relevant to the task:

- `CONTEXT.md` for product terminology, especially modeling and navigation pins.
  Use its dashboard-facing names even when API names differ.
- Relevant decisions in `docs/adr/` when changing the behavior they govern.
  Surface conflicts with those decisions rather than silently overriding them.
- `docs/multi-schema.md` for GraphQL operations, generation, or schema selection.
- `docs/configuration.md` and `.env.template` when configuring or running the app.
- `docs/running-tests.md` when running Playwright tests.

Read current commands, dependencies, and runtime requirements from `package.json`,
including `packageManager` and `engines`; read aliases from `tsconfig.json`.

## Conditional workflows

- Install dependencies when missing or when dependency inputs change. Run
  `pnpm install` after modifying `package.json` or workspace dependency settings.
- Put dependency overrides in `pnpm-workspace.yaml` under `overrides`, never in
  `package.json` under `pnpm.overrides`.
- After changing GraphQL operations, fragments, or schemas, run `pnpm run generate`
  for both main and staging schemas. Do not hand-edit `.generated.ts` files.
- After changing `react-intl` messages, run `pnpm run extract-messages`.
- Set up a backend only when the task needs a running application or integration
  tests. Setup and code generation are not prerequisites for unrelated edits.
- Run `pnpm run dev` in the background. If background execution is unavailable,
  ask the user how to proceed. Its `predev` hook already runs code generation.

## Verification

Match verification to the affected code. Complete relevant checks before handing
back implementation work, and report any checks that could not run.

- Documentation-only changes: format the changed files with Prettier; application
  tests, type checks, and knip are unnecessary.
- Code changes: run oxlint with auto-fix and Prettier on the changed files before
  manually fixing lint errors. ESLint only runs GraphQL rules
  (`eslint.config.mjs`); run it on changed GraphQL operations. Run affected tests
  and the relevant `check-types:*` scripts from `package.json`.
- Use `pnpm run test:quiet <file_path>` for individual Jest files. Switch to
  `pnpm run test:debug <file_path>` when debugging requires console or DOM output.
- Add or update unit tests for changed utility behavior and complex components;
  use Playwright coverage for critical user flows.
- When changing dependencies, exports, or file organization, run `pnpm run knip`.
- For changes spanning application code, Playwright, and scripts, run
  `pnpm run check-types`. Use `pnpm run lint` for repository-wide lint, formatting,
  and changeset validation; it auto-fixes and formats files across the repository.
- Rerun affected checks after fixes. Broaden verification when shared behavior,
  configuration changes, or failures warrant it; avoid repeating successful checks
  without new changes or evidence.

## Conflict resolution and review

- Resolve source conflicts first, then regenerate derived files:
  `pnpm install` for `pnpm-lock.yaml`, and `pnpm run generate` for GraphQL outputs.
  Do not manually merge generated content.
- Resolve package-version conflicts against intended dependency constraints and
  preserve deliberate pins. Do not turn conflict resolution into an unrelated
  upgrade to the latest registry release.
- During code review, skip inspecting `.generated.ts` contents; review the source
  operations and generation configuration instead.

## Analytics

- When adding a substantial product feature, implement PostHog tracking for its key
  user interactions and outcomes, following existing analytics patterns.
- Do not add tracking for bug fixes, removals, refactors, or other maintenance-only changes.

## Contributions

- Use the changesets CLI for user-facing features, enhancements, and bug fixes.
  Explain the user-visible behavior; for fixes, describe what failed and what works
  now. Skip changesets for internal refactors, style, tests, CI/CD, and internal docs.
- Follow scope policy in `.github/CONTRIBUTING.md` (Pull requests section) and
  title and description requirements in `.github/PULL_REQUEST_TEMPLATE.md`.
- Run the `saleor-dashboard-pr-quality-check` skill when planning (to keep the
  planned scope to one PR) and when work is done, including after each commit.
  Without an open PR it checks the local branch. If it recommends a split, surface
  that to the user before continuing.
- Prefer the `gh` CLI for GitHub operations.
- No agent-driven issue tracker is configured. Return issue or triage findings in
  the conversation; see `docs/agents/issue-tracker.md` when a skill expects a tracker.

## E2E conventions (e2e/)

These are the rules a reviewer on the Saleor Dashboard team would hold a new `e2e/` spec to.
Every rule is taken from the suite as it stands (upstream commit `77dc49b`) and cites the file
that sets it. Nothing here is invented for this demo; where the suite only shows a habit rather
than stating a rule, that is said.

Paths are relative to the repository root.

### 1. Where tests live and how they start

**1.1 New specs go in `e2e/tests/`. `e2e-legacy/` is frozen.**
`docs/running-tests.md` ("New tests belong in `e2e/`"), `e2e/README.md` ("Porting from
`e2e-legacy/`": "It is frozen - do not edit it").

**1.2 Specs import `test` and `expect` from `e2e/fixtures/test.ts`, never from
`@playwright/test`.**
The suite's `test` is what restores the database and loads the actor's session
(`e2e/fixtures/test.ts:24-68`). A spec built on Playwright's own `test` gets neither: it runs on
whatever the previous test left behind, signed in as nobody. Every spec follows this
(`e2e/tests/orders/order-creation.spec.ts:1`, `e2e/tests/login.spec.ts:2`). `Page` and other
types may still be imported from `@playwright/test` (`e2e/tests/productMediaTranslations.spec.ts:1`).

**1.3 Imports between suite files are relative and keep the `.ts` extension.**
`e2e/tsconfig.json:3-6` (type stripping under Node 24 needs it); every import in `e2e/`.

**1.4 Test titles describe the behaviour in a sentence and carry the `#e2e` tag.**
`e2e/tests/login.spec.ts:21`, `e2e/tests/orders/order-payment-fulfillment.spec.ts:16`. Area tags
may be added after it (`#translations` in `e2e/tests/productMediaTranslations.spec.ts:88`).

**1.5 Each spec file opens with a comment saying what it covers and why.**
Every spec does this; the order specs also name the legacy cases they replace
(`e2e/tests/orders/draft-pricing.spec.ts:5-9`).

### 2. Test shape

**2.1 Arrange, Act, Assert are marked with comments.**
Repository rule in `CLAUDE.md` ("In tests, use `// Arrange`, `// Act`, and `// Assert`
comments"). Where acting and asserting interleave by stage, the suite writes
`// Act & Assert` (`e2e/tests/orders/order-creation.spec.ts:19`).

**2.2 One test is one user story, with a `test.step` per stage, so a failure names the stage.**
`e2e/tests/orders/order-creation.spec.ts:11` states it; `draft-pricing.spec.ts:30-47` and
`order-payment-fulfillment.spec.ts:23-37` follow it. Separate tests are for separate stories,
not for each assertion.

**2.3 Assertions are web-first: `await expect(locator).toHaveText(...)`, not
`expect(await locator.textContent())`.**
Every UI assertion in `e2e/tests/orders/`. Reading a value out of the page is reserved for when
the test needs the number for arithmetic, and is wrapped in a page-object method that says why
(`e2e/pages/orderPage.ts:95-98`, used at `order-payment-fulfillment.spec.ts:46-47`).

**2.4 Assert the outcome the story is about, not only that the UI responded.**
The order specs check the resulting status, totals and sections after each action
(`order-creation.spec.ts:38-41`, `order-payment-fulfillment.spec.ts:29-32`). Where persistence
is the point, the suite proves it: a reload (`productMediaTranslations.spec.ts:117-120`) or a read
through the API (`productMediaTranslations.spec.ts:148-164`). A test whose assertions would
still pass with the feature broken is not doing its job.

**2.5 Expected values come from the scenario's exported constants, and arithmetic is guarded.**
`draft-pricing.spec.ts:16-25` derives every expected amount from `PRODUCTS` and `PROMOTIONS`
(`e2e/scenarios/orders.ts:41-50`) and asserts the preconditions its maths relies on. Values that
the seed randomises are read from the page instead, with a comment saying so
(`order-payment-fulfillment.spec.ts:46`).

**2.6 Money is compared as `amount.toFixed(2)`.**
`draft-pricing.spec.ts:12`, `e2e/pages/orderPage.ts:74`. The dashboard renders totals without a
currency symbol (`e2e/pages/orderPage.ts:95`).

### 3. Data: scenarios, not set-up code

**3.1 A test starts from a named scenario: `test.use({ scenario: ... })`.**
`e2e/fixtures/test.ts:26` (default `"default"`, Saleor's `populatedb`);
`e2e/tests/orders/order-creation.spec.ts:13`. The scenario name is imported from the scenario
file, not typed as a string (`ORDERS_SCENARIO`, `e2e/scenarios/orders.ts:18`).

**3.2 State a spec needs is a scenario, built once and restored, not something the spec creates
on the way past.**
`e2e/README.md` ("Isolation, and opting into parallel": "a state a spec needs is a scenario,
named and built, not something the spec creates on the way past"). The one exception the suite
makes is a draft order: drafts are cheap to start through the UI, and the draft specs do that in
their Arrange step with the existing page-object flow (`DraftOrderPage.create`,
`e2e/tests/orders/draft-pricing.spec.ts:27`). Arranging through direct API mutations inside a
spec, in a `beforeEach`, or re-creating something a scenario already holds (a new order when the
scenario has the unpaid one) is not the pattern.

**3.3 Use what the existing scenarios already provide before adding one.**
`e2e/scenarios/orders.ts` provides known products and prices, one customer, both promotion types
and an unpaid and a fulfilled order (`orders.ts:6-61`). A spec that needs one of these uses it.

**3.4 A new scenario builds on `default` with `parent: "default"`, goes through the GraphQL API,
fails loudly on mutation errors, and is registered.**
`e2e/README.md` ("Seeds are built, not written"), `e2e/scenarios/scenario.ts:10-23`,
`e2e/scenarios/orders.ts:342-345` (`parent`), `orders.ts:71-80` and
`e2e/lib/graphql.ts:55-63` (`assertNoMutationErrors`), `e2e/scenarios/registry.ts`. Raw SQL is
only for states the API cannot express (`e2e/scenarios/scenario.ts:10-13`).

**3.5 No hard-coded ids. Look rows up at test time by a stable key.**
Ids change with every build of the dump. `findOrderId` finds orders by `e2e` metadata
(`e2e/scenarios/orders.ts:52-55`, `391-411`). Reads like this are safe at test time; writes are
not (3.2).

**3.6 Do not depend on what `populatedb` happens to generate.**
Its orders, customers and promotions are random (`e2e/scenarios/orders.ts:9-16`). A spec that
asserts on a populatedb product name, price or order number will break on the next seed build.

**3.7 GraphQL from test code goes through `e2e/lib/graphql.ts`.**
`gql`, `signIn`, `adminToken` and `assertNoMutationErrors` (`e2e/lib/graphql.ts`). No hand-rolled
`fetch` against the API, no second copy of these helpers.

### 4. Isolation and cleanup

**4.1 The database is restored before every test, so specs carry no cleanup code and no
unique-name tricks.**
`e2e/README.md` ("Specs need no cleanup discipline and no unique names, and nothing in the seed
is ever consumed"), `e2e/fixtures/test.ts:28-55`. `afterEach` deletes, timestamped names and
"delete if exists" steps are noise here, and a sign the author did not know how the suite works.

**4.2 Nothing may outlive the test's own reset.**
What _can_ leave data behind in this suite: tagging a test that writes as `parallel()` (its group
shares one database, `e2e/config.ts:48-74`), writing to the scenario dumps or the cached sessions
under `e2e/.cache/` at test time (`e2e/lib/seed.ts:17`), or changing seed state from global setup. Each of these
leaks into later tests.

**4.3 `parallel()` is only for blocks that read without writing, and never for tests that sign in
through the UI.**
`e2e/config.ts:48-74`, `e2e/README.md` ("What cannot be tagged: signing in").

**4.4 No retries, and no per-test changes to timeouts without a stated reason.**
`e2e/playwright.config.ts:84-90` (`retries: 0`: "a retry mostly hides a real defect"),
`playwright.config.ts:103-110` (`actionTimeout`, `expect` timeout).

### 5. Actors

**5.1 Pick who is signed in with `test.use({ actor: ... })`. The default is `admin`.**
`e2e/fixtures/test.ts:25`, `e2e/README.md` ("Actors"), `e2e/lib/actors.ts:13-28`.

**5.2 Do not sign in through the UI except in the login spec. `anonymous` is for that.**
Stored sessions are loaded by the fixture (`e2e/fixtures/test.ts:57-67`); UI sign-in is
throttled per IP (`e2e/README.md`, "What cannot be tagged: signing in"). `e2e/tests/login.spec.ts`
is the one spec that signs in itself.

**5.3 Permission stories use the single-permission actor for that permission.**
`e2e/lib/actors.ts:3-28`; `e2e/tests/productMediaTranslations.spec.ts:261-275` uses
`translations` and checks its permissions.

**5.4 Credentials come from `e2e/config.ts` and `e2e/lib/actors.ts`, never literals in a spec.**
`ADMIN`, `STAFF_PASSWORD`, `credentialsFor` (`e2e/config.ts:43-46`, `e2e/lib/actors.ts:38-50`).

### 6. Locators and page objects

**6.1 Locate by `data-test-id` with `getByTestId`; otherwise by role and accessible name.**
`e2e/playwright.config.ts:105` (`testIdAttribute: "data-test-id"`); `e2e/README.md` ("The
locators are `data-test-id`s"). Role locators where no test id exists
(`e2e/pages/addressDialog.ts:23-27`). No CSS class selectors, no XPath, no `nth-child`, no text of
generated ids. `.filter({ hasText })` narrows a test-id list to the row wanted
(`e2e/pages/draftOrderPage.ts:85-88`).

**6.2 Scope locators to the container they belong to.**
Dialog buttons are found inside the dialog (`this.dialog.getByTestId("submit")`,
`e2e/pages/addressDialog.ts:49`, `e2e/pages/orderPage.ts:67`), because `submit` exists on many
screens.

**6.3 Locators live in page objects in `e2e/pages/`, as `readonly` fields initialised from
`this.page`, with `constructor(readonly page: Page) {}`.**
`e2e/README.md` ("Porting": "Locators become `readonly` class fields initialized from
`this.page`, with an empty `constructor(readonly page: Page) {}`"); `e2e/pages/orderPage.ts:10-57`.
Specs call page-object methods and assert on page-object locators. The suite's one inline helper
(`saveAlt` in `e2e/tests/productMediaTranslations.spec.ts:81-86`) predates this and is not the
pattern to copy.

**6.4 Reuse the page object that already covers the screen, and extend it there.**
`DraftOrderPage` covers drafts (`e2e/pages/draftOrderPage.ts`), `OrderPage` placed orders
(`e2e/pages/orderPage.ts`), `AddressDialog` the address dialog both open
(`e2e/pages/addressDialog.ts`, composed at `draftOrderPage.ts:12` and `orderPage.ts:11`). A new
action on an order belongs on `OrderPage`, not in a second class or a spec-local helper. A new
page object is for a screen no existing one covers.

**6.5 Page-object methods are named for the user's action and carry a comment when they handle
something non-obvious.**
`addProduct`, `assignCustomer`, `fulfillAll`, `markAsPaid`; the comments at
`e2e/pages/draftOrderPage.ts:76-80` and `e2e/pages/orderPage.ts:79` explain why the method waits
the way it does.

### 7. Waiting

**7.1 No fixed waits. No `waitForTimeout`, no `setTimeout` sleeps.**
Nowhere in `e2e/tests/` or `e2e/pages/`. The suite waits on something it can name.

**7.2 Wait on the UI state that proves the step finished.**
A web-first assertion (`await expect(this.statusInfo).toHaveText("Draft")`,
`e2e/pages/draftOrderPage.ts:73`), a dialog closing (`this.dialog.waitFor({ state: "hidden" })`,
`e2e/pages/addressDialog.ts:84`), a URL change (`page.waitForURL(...)`,
`e2e/pages/orderPage.ts:82-84`), or a list settling before acting in it
(`e2e/pages/draftOrderPage.ts:84`).

**7.3 Waiting on network responses is for asserting on the response itself.**
`e2e/tests/productMediaTranslations.spec.ts:231-246` waits for one named GraphQL operation because
the test asserts on its error payload. The suite never uses `networkidle`.

### 8. Code quality

**8.1 Strict TypeScript; no `any`; typed GraphQL responses.**
`e2e/tsconfig.json:18` (`strict`), repository `CLAUDE.md` ("strict TypeScript"), `gql<T>`
(`e2e/lib/graphql.ts:23`). The repository's Claude hooks also block `as any`
(`.claude/hooks/check-as-any-pre.py`).

**8.2 It type-checks and lints.**
`pnpm run check-types:e2e` (`package.json`), and the repository lint (`CLAUDE.md`,
"Verification").

**8.3 Comments explain why, not what.**
Every comment in `e2e/pages/` and `e2e/tests/orders/` explains a reason (a wait, a dropped
assertion, a value read rather than computed). Comments narrating the next line are not the
house style.
