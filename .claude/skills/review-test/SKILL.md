---
name: review-test
description: Review an AI-written (or any) Playwright e2e test for the Saleor Dashboard against CHECKLIST.md before it merges, and report blocker and minor findings with file and line. Use after writing a test, or when asked to review, check or audit an e2e spec.
---

# Review an e2e test against the checklist

Be the reviewer who would otherwise catch this in the pull request. Judge the change, not the
author's explanation of it.

## 1. Collect the change

1. `git status --porcelain` lists what changed. Read every added or modified file under `e2e/`
   in full: the spec, and any page object or scenario it touched.
2. Read the ticket the test is for. List its acceptance criteria.
3. Read `CHECKLIST.md`. For the "duplicated helper" check, also read the existing page objects
   in `e2e/pages/`, `e2e/lib/graphql.ts` and the scenario files the spec imports.

## 2. Go through every item

Take each item in `CHECKLIST.md` in order, B1 to B10 and M1 to M13, and decide **met** or
**failed**. For a failure, give the file and line and one sentence on what is wrong. Do not skip
an item because it seems unlikely; most misses are in the items that seemed fine.

The ones that need real work:

- **B1, would pass with the feature broken.** For each assertion, imagine the server ignored the
  action: the mutation never ran, or returned without changing anything. Would the assertion still
  pass? Things the UI does whether or not the server acted - a dialog closing, a navigation the
  client performs, a toast, an input still holding typed text, a button being clicked - do not
  prove the outcome. Values read back after `page.reload()`, or from the API, do. B1 fails if
  some acceptance criterion is only "proved" by assertions of the first kind.
- **B2, acceptance criteria.** Map each criterion to the line that asserts it. A criterion
  without a line is a failure.
- **B3, duplicates.** Search the page objects for the test id or the action before accepting a
  new locator or method.
- **B6, selectors.** Every locator: test id, or role with a name, scoped to its container when the
  id is shared (`submit`, `confirm-button`, `select-option` appear on many screens).
- **B7 and B8, data.** Where does every value the test relies on come from? The scenario's
  exported constants and `findOrderId` are fine; literals that happen to match the seed, ids, and
  API calls that arrange state are not.

## 3. Check it runs

- `pnpm run check-types:e2e`
- `pnpm e2e <spec path> --repeat-each=3`

A type error is B10. A failing or flaky run is reported as such; do not add retries or waits to
make it pass.

## 4. Report

```
Ticket: <id>
Files reviewed: <paths>

Blockers
- B1 met
- B4 FAILED e2e/pages/orderPage.ts:104 waitForTimeout(1000) after saving
...

Minors
- M1 met
...

Runs: check-types clean; 3/3 passed
Verdict: <merge | fix blockers first | fix minors>
```

If you wrote the test yourself, fix every failed item now and review again until no blocker is
left.
