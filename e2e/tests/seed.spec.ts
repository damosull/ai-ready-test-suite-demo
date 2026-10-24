import { test } from "../fixtures/test.ts";

/**
 * Seed for Playwright's test agents (`npx playwright init-agents`). It uses the suite's own
 * fixture, so the agents start from a restored database and a signed-in admin session, and
 * opens the dashboard.
 */
test("seed", async ({ page }) => {
  await page.goto("/");
});
