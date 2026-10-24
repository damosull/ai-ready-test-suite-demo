# Repo check: the Saleor Dashboard

2026-10-24. 1 of your own tickets (07), on your own Playwright suite,
written three ways by the same AI tool and checked the same way.

## The result

|                                                  | Playwright's free test agents | Free agents + conventions the AI wrote itself | Tailored setup |
| ------------------------------------------------ | ----------------------------- | --------------------------------------------- | -------------- |
| Blockers (would not merge)                       | 1                             | 0                                             | 0              |
| Minor findings (would be sent back)              | 4                             | 1                                             | 0              |
| Stability: passes out of 20 repeats, all tickets | 20/20                         | 20/20                                         | 20/20          |
| Green every run, tickets                         | 1/1                           | 1/1                                           | 1/1            |
| Caught the break, tickets                        | 1/1                           | 1/1                                           | 1/1            |
| Minutes per ticket                               | 8.8                           | 7.8                                           | 1.9            |

- **Blockers**: a reviewer would not merge the test until they are fixed.
- **Minor findings**: the test works, but a reviewer would send it back to read like the rest of
  your suite.
- **Stability**: how many of 20 repeated runs per ticket passed, after 3 runs in a
  row.
- **Caught the break**: before any test was written, we made a small change to your app for each
  ticket that breaks the feature while the screen still responds. A good test fails when that
  change is in.

## The three sides

- **Playwright's free test agents**: Playwright's own planner, generator and healer, set up as
  Playwright documents them.
- **Free agents + conventions the AI wrote itself**: the same agents, plus the conventions an AI
  session wrote after reading your suite, from one fixed prompt, used unedited. This is what your
  team can do today for free.
- **Tailored setup**: rules and a write-and-review workflow built from your suite's conventions.

## The three most common problems in the free sides' tests

1. **Locators defined in the spec** (M1, minor): in 2 of 2 free-side changes.
   - Playwright's free test agents, ticket 07: e2e/tests/products/product-rename.spec.ts:25 defines every locator (search input, grid canvas, row anchor, name input, save button, header, toast) and the multi-step hover-and-open-row flow inline in the spec, instead of on a new ProductPage page object.
   - Free agents + conventions the AI wrote itself, ticket 07: e2e/tests/products/product-rename.spec.ts:126 the toast locator page.getByText("Product updated") and the header-title locators pageHeader.getByTitle(...) (lines 115, 128, 129, 136) are built inline in the spec instead of being exposed on ProductPage.
2. **Selectors ignore the suite's locator rules** (B6, blocker): in 1 of 2 free-side changes.
   - Playwright's free test agents, ticket 07: e2e/tests/products/product-rename.spec.ts:41 finds the product-name cell with the CSS selector 'td[role="gridcell"][id^="glide-cell-1-"]', which relies on Glide's generated cell ids and a column position. A role-based gridcell locator filtered by name could be used instead.
3. **Expected values typed in** (M8, minor): in 1 of 2 free-side changes.
   - Playwright's free test agents, ticket 07: e2e/tests/products/product-rename.spec.ts:38 types the product name into the URL regex /query=E2E(%20|\+)Hoodie/ instead of building it from PRODUCTS.hoodie.name.

## What this means for your team

<!-- Operator: drafted from the numbers by fixed rules. Read it against the evidence before sending. -->

- Out of the box, Playwright's agents wrote tests a reviewer would send back: 1 blocker and 4 minor findings over 1 ticket. That is review work your team does before an AI-written test can merge.
- Asking the AI tool to write down your suite's conventions first took that from 5 to 1 finding. That costs your team nothing but a few minutes.
- The tailored setup's tests had 0 findings, against 1 for the best free side. A gap of 1 on 1 ticket is too small to call: what the setup adds is mainly speed and a review step, not a different class of test.
- Every side's tests passed all 20 repeated runs, so none of the difference above is flakiness.
- Every side's tests failed when the feature was broken, as they should.
- Minutes per ticket: Playwright's free test agents, 8.8; Free agents + conventions the AI wrote itself, 7.8; Tailored setup, 1.9.

## Per ticket

#### Ticket 07

| Side                                          | Blockers | Minors               | 3x runs | Stability (20 repeats) | Caught the break | Minutes | Review     |
| --------------------------------------------- | -------- | -------------------- | ------- | ---------------------- | ---------------- | ------- | ---------- |
| Playwright's free test agents                 | 1 (B6)   | 4 (M1, M8, M10, M13) | 3/3     | 20/20                  | yes              | 8.8     | `ebc55959` |
| Free agents + conventions the AI wrote itself | 0        | 1 (M1)               | 3/3     | 20/20                  | yes              | 7.8     | `e200b47f` |
| Tailored setup                                | 0        | 0                    | 3/3     | 20/20                  | yes              | 1.9     | `9841cb29` |

## How it was checked

- Each change was reviewed blind, by a fresh AI reviewer that did not know which side wrote it,
  against a checklist of your suite's own conventions. Its verdicts are in the evidence.
- Each ticket's tests ran 3 times in a row, then 20 more times, with your own
  runner and config.
- The tickets, the breaks, the checklist and the conventions were fixed (sha256 recorded) on
  2026-10-24, before any test was generated.
- One AI generation per ticket per side. On 1 tickets, a gap of one or two minor
  findings is within what a second generation could change.

Evidence: reviews, run logs and transcripts are in the run folder, `/Users/damien/.cache/ai-ready-demo/kit-proof/out`.
