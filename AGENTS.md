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

## End-to-end tests

Read `e2e/README.md` before writing or reviewing a spec; it explains the reasons behind
these rules.

- Put new specs in `e2e/`. `e2e-legacy/` is frozen, so do not edit or extend it. When a spec
  replaces legacy coverage, list the replaced `SALEOR_<n>` cases in the spec's doc comment,
  along with any case deliberately left out and why.
- Import `test` and `expect` from `e2e/fixtures/test.ts`, not `@playwright/test`. Use
  relative imports with the `.ts` extension.
- Each untagged test starts from a freshly restored database. Do not add cleanup,
  unique-name suffixes, or dependencies between tests.
- Build the state a spec needs as a scenario instead of creating it in the test. Add a file
  in `e2e/scenarios/`, register it in `scenarios/registry.ts`, and select it with
  `test.use({ scenario })`. Set `parent: "default"` unless the scenario replaces the
  default scenario. Build through the GraphQL API, checking each mutation with
  `assertNoMutationErrors`. Use SQL only for states the API cannot express. If the build
  creates something that a beat task settles, add that task to `e2e/lib/beat.ts`.
- Never hard-code entity IDs, because every dump build mints new ones. Export known names
  and values from the scenario, and look up IDs at test time with read-only queries (see
  `findOrderId`). Do not assert on `populatedb`'s random data. Seed known values, or read
  the value from the page and comment why.
- Use API calls during a test only for lookups and for checking persisted state.
- Choose the signed-in user with `test.use({ actor })`. `admin` is the default. Use the
  single-permission actors in `e2e/lib/actors.ts` for permission flows. Use `anonymous`
  only for specs that sign in through the UI.
- Tests run serially by default. Tag a block with `{ tag: parallel(scenario) }` only when
  it leaves no change another test could notice and never calls `tokenCreate`. That
  includes UI sign-in, `signIn`, `adminToken`, and helpers such as `findOrderId`, because
  Saleor throttles logins per IP.
- Specs run against both the `stable` and `main` targets. Gate target-specific features
  with `test.skip(config.stagingSchema, "<reason>")`, and make the scenario build skip the
  same work on the other target.
- Keep page objects in `e2e/pages/`. Declare locators as `readonly` fields initialized
  from `this.page` with an empty `constructor(readonly page: Page) {}`. Methods wrap
  multi-step UI actions and wait until those actions finish, for example a hidden dialog
  or a changed URL. Specs own the assertions about outcomes.
- Open each spec with a doc comment describing the flow it covers. Write test titles as
  plain-language user stories; existing titles end in `#e2e` and an optional area tag. For
  multi-stage flows, use `// Arrange`, then `// Act & Assert` with one `test.step` per
  stage. For single-action tests, use `// Arrange`, `// Act`, and `// Assert`.
- Locate elements with `getByTestId` (`data-test-id`) or `getByRole` and its accessible
  name, using `exact: true` where text could match more than one element. If no test ID
  exists, add one to the component. Use CSS selectors only for third-party DOM. Do not use
  `nth`, `force: true`, `waitForTimeout`, or `networkidle`.
- Use web-first `await expect(locator)` assertions and wait on concrete signals:
  `waitFor`, `waitForURL`, `waitForResponse`, or a list that has finished narrowing.
- Do not add retries or raise timeouts to make a test pass. The suite sets `retries: 0`
  so that failures can be reproduced.
- Intercept external services with `page.route` at a test host so nothing reaches the
  real service. Skip environment-dependent specs with a reason that points to
  `e2e/README.md`.
- Verify with `pnpm run check-types:e2e`, oxlint, and Prettier. Run the spec with
  `pnpm e2e <spec>`, and also run `pnpm e2e:main <spec>` when its behavior depends on the
  target. Both need Docker. If they cannot run, say so.

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
