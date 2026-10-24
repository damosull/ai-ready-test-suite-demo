I added an **End-to-end tests** section to `AGENTS.md`, between Verification and Conflict resolution. `CLAUDE.md` is a symlink to `AGENTS.md`, so it gets the section too. I couldn't run Prettier on the file because the session denied the command, so please run `pnpm exec prettier --write AGENTS.md` before committing.

**Where the rules come from.** I based them on `e2e/` only: the six specs, the fixtures, the page objects, the scenarios, the Playwright config and `e2e/README.md`. I left out `e2e-legacy/` because `docs/running-tests.md` says it's frozen and new tests don't go there. Most weight went to the three order specs, which were ported most carefully and agree with each other. The rules are grouped like this:

- **Data and isolation:** every test starts from a restored database. Data a test needs comes from a scenario built through the GraphQL API, with `parent: "default"`. No cleanup, no hardcoded IDs, and the API is used only to look up seeded data or check results.
- **Actors and parallelism:** use the single-permission actor for permission flows. Only tests that write nothing and don't sign in through the UI get the `parallel()` tag. No retries.
- **Spec structure:** a doc comment that names the legacy cases it replaces, plain-language titles ending in `#e2e`, one test per user story with one `test.step` per stage, and the test must pass on both the stable and main Saleor targets.
- **Page objects and waiting:** `readonly` locator fields, locators by `data-test-id` or role, methods that wait for their own result, and no `waitForTimeout` or raised timeouts.
- **Verification:** `check-types:e2e`, oxlint, Prettier, and running the spec with `pnpm e2e` (plus `pnpm e2e:main` when relevant).

**Existing code that breaks these rules.** I wrote down the team's majority practice rather than these outliers, so a reviewer will flag them:

- `e2e/scenarios/productMediaTranslations.ts` restores the default database by hand instead of using `parent: "default"`. That's the pattern the README asks for. It also doesn't export its scenario name as a constant, as `orders.ts` does.
- `e2e/tests/productMediaTranslations.spec.ts` puts `getByTestId` locators and a `saveAlt` helper directly in the spec instead of in a page object. Its file name is also camelCase, while the others are kebab-case.
- `e2e/tests/feedback.spec.ts` has no `#e2e` in its test titles. The new suite's runner doesn't filter on that tag (only the legacy runner does), so this is a naming convention and isn't enforced.

If you'd rather allow one of these instead of banning it, for example inline locators in single-use specs, tell me and I'll relax that rule.