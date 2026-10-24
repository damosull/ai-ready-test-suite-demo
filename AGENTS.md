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

## E2E tests (`e2e/`)

Rules for writing and reviewing Playwright specs. `CONVENTIONS.md` has the reasons and file
references; `CHECKLIST.md` is what a reviewer checks. To write a test from a ticket use the
`write-test` skill; before handing a test back use the `review-test` skill.

- New specs go in `e2e/tests/`. Never edit `e2e-legacy/` (frozen).
- Import `test` and `expect` from `e2e/fixtures/test.ts`, never from `@playwright/test`. That
  fixture restores the database before every test and loads the actor's session.
- Relative imports keep the `.ts` extension.
- Data comes from a scenario: `test.use({ scenario: ORDERS_SCENARIO })`, importing the name and
  the known values (`PRODUCTS`, `PROMOTIONS`, `CUSTOMER`, `CHANNEL`) from `e2e/scenarios/`. Find
  scenario rows at test time by stable key (`findOrderId(config, "unpaid")`); never hard-code
  ids or assert on values `populatedb` randomises. Do not arrange data with API calls in a spec;
  a state a spec needs is a scenario. Starting a draft with `DraftOrderPage.create` is fine.
- No cleanup code, no unique names, no retries: the database is reset before each test.
- Sign in with `test.use({ actor: "order" })` etc. from `e2e/lib/actors.ts` (default `admin`).
  Never through the login form outside `login.spec.ts`; never type credentials.
- Locate by `getByTestId` (the attribute is `data-test-id`); otherwise `getByRole` with a name.
  Scope to the container (`this.dialog.getByTestId("submit")`). No CSS classes, XPath or
  positional `nth`. Find test ids in `src/` with grep.
- Locators and multi-step actions live on the page object for that screen, as `readonly` fields
  from `this.page` with `constructor(readonly page: Page) {}`. Extend `DraftOrderPage`,
  `OrderPage` or `AddressDialog` rather than writing a new class or a spec-local helper.
- Never wait a fixed time. Wait on the state that proves the step finished: a web-first
  assertion, a dialog hidden, `waitForURL`.
- Web-first assertions only. Assert the outcome the ticket is about, and prove persistence with a
  `page.reload()` when the ticket says "saved". Every assertion must fail if the feature broke.
- Shape: header comment saying what the spec covers; title is a sentence ending `#e2e`;
  `// Arrange`, then `// Act & Assert` with one `test.step` per stage; money as `toFixed(2)`.
- Done means: `pnpm e2e <spec> --repeat-each=3` passes and `pnpm run check-types:e2e` is clean.
