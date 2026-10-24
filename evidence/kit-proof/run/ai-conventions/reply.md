I added an "End-to-end tests" section to `AGENTS.md`, just before "Conflict resolution and review". `CLAUDE.md` is a symlink to `AGENTS.md`, so both pick it up. Prettier did not run: the command needed approval and this session can't grant it. Please run `pnpm exec prettier --write AGENTS.md`.

I based the rules on the whole `e2e/` suite (6 specs, page objects, scenarios, fixtures, config, `e2e/README.md`, the nightly CI workflow). The main ones:

- **Where tests go:** new specs belong in `e2e/`. `e2e-legacy/` is frozen. A spec that replaces legacy tests names the `SALEOR_<n>` cases it covers.
- **Test data:** each test starts from a freshly restored database. Data a spec needs is set up as a named scenario, not created inside the test. Scenarios build on `parent: "default"`, use the GraphQL API, and check every mutation for errors.
- **IDs:** never hard-coded, because they change on every rebuild. Specs look them up at test time with read-only queries, the way `findOrderId` does.
- **Signed-in user:** chosen per spec with `test.use({ actor })`. The single-permission users cover permission flows.
- **Parallel runs:** tests run one at a time unless tagged `parallel()`. A tagged test must leave nothing behind and must not sign in. That includes the `signIn`, `adminToken` and `findOrderId` helpers, because Saleor throttles logins by IP. The README only mentions UI logins, but the throttle sits in `tokenCreate` itself.
- **Saleor versions:** tests run against both stable and unreleased main. A feature that exists on only one is skipped with `test.skip(config.stagingSchema, …)`.
- **Code style:** page objects use `readonly` locator fields and an empty constructor. Locators use `data-test-id` or roles. No `waitForTimeout`, `force`, `nth`, retries or raised timeouts. External services are intercepted with `page.route`.

The existing specs don't all follow these rules, so a reviewer would hit this on day one:

- **`e2e/scenarios/productMediaTranslations.ts`** restores the default scenario by hand instead of setting `parent: "default"`, which is what the README asks for.
- **`productMediaTranslations.spec.ts`** and **`feedback.spec.ts`** use raw locators in the test bodies and no page objects. `feedback.spec.ts` also creates `new HomePage(page)` twice in a row.
- **The `#e2e` title tag** has no effect in this suite: only the legacy CI command filters on it. I recorded it as the current habit rather than a requirement. `feedback.spec.ts` already leaves it out.

These could be fixed or written up as exceptions.
