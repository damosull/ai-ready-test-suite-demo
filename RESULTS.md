# Results

## Version 1.2: a fourth arm, conventions the AI tool wrote itself (headline)

Pre-registered in [SCORING.md, "Addendum for v1.2"](SCORING.md#addendum-for-v12-pre-registered-committed-before-any-v12-generation)
and committed (`25051f9`) and pushed before any v1.2 generation.

v1.1 compared conventions written by someone who knows the suite against no conventions. The free
alternative a team actually has is to ask the AI tool to write the conventions itself. That is the
fourth arm:

- `ai-conventions`: the baseline (Playwright's test agents) plus an `AGENTS.md` section written by
  one fresh Claude Code session from this prompt, verbatim: "Read this repository's e2e suite and
  write the conventions a reviewer on this team would enforce for new end-to-end tests, as a
  section to add to AGENTS.md." The session ran in a clean export of the Saleor commit, with none
  of this demo's files and no other branches. It took 2 minutes, added a 76-line "End-to-end
  tests" section to `AGENTS.md`, and the section was committed unedited. Its transcript, reply and
  change are in [`evidence/ai-conventions/`](evidence/ai-conventions/).

Tickets 06 to 08, one generation each, round 4 (`ai-conventions-r4-t06` to `t08`). The other three
arms are their round-3 results, not rerun. Same blind whole-change review, same three runs, same
breaks. Numbers come from [`demo/tally4.py`](demo/tally4.py).

#### Held-out tickets 06 to 08, four arms

##### Ticket 06

| Arm                   | Blockers | Minors      | 3x runs | Caught the broken feature | Review               |
| --------------------- | -------- | ----------- | ------- | ------------------------- | -------------------- |
| `baseline`            | 0        | 2 (M1, M13) | 3/3     | yes                       | `fad76700` (round 3) |
| `ai-conventions`      | 0        | 0           | 3/3     | yes                       | `c18bb572` (round 4) |
| `baseline-plus-rules` | 0        | 1 (M1)      | 3/3     | yes                       | `a52faa49` (round 3) |
| `with-setup`          | 0        | 0           | 3/3     | yes                       | `cdad8a58` (round 3) |

##### Ticket 07

| Arm                   | Blockers | Minors              | 3x runs | Caught the broken feature | Review               |
| --------------------- | -------- | ------------------- | ------- | ------------------------- | -------------------- |
| `baseline`            | 1 (B6)   | 4 (M1, M4, M8, M13) | 3/3     | yes                       | `80a33156` (round 3) |
| `ai-conventions`      | 0        | 0                   | 3/3     | yes                       | `06940040` (round 4) |
| `baseline-plus-rules` | 0        | 1 (M13)             | 3/3     | yes                       | `264e9819` (round 3) |
| `with-setup`          | 0        | 0                   | 3/3     | yes                       | `e78cc5bf` (round 3) |

##### Ticket 08

| Arm                   | Blockers | Minors          | 3x runs | Caught the broken feature | Review               |
| --------------------- | -------- | --------------- | ------- | ------------------------- | -------------------- |
| `baseline`            | 0        | 3 (M1, M8, M13) | 3/3     | yes                       | `baa7f8e0` (round 3) |
| `ai-conventions`      | 0        | 1 (M1)          | 3/3     | yes                       | `ed1fd1d2` (round 4) |
| `baseline-plus-rules` | 0        | 0               | 3/3     | yes                       | `f0549153` (round 3) |
| `with-setup`          | 0        | 0               | 3/3     | yes                       | `4e7e3762` (round 3) |

##### Totals

| Arm                   | Blockers | Minors | Findings | Green 3/3 | Caught the broken feature |
| --------------------- | -------- | ------ | -------- | --------- | ------------------------- |
| `baseline`            | 1        | 9      | 10       | 3/3       | 3/3                       |
| `ai-conventions`      | 0        | 1      | 1        | 3/3       | 3/3                       |
| `baseline-plus-rules` | 0        | 2      | 2        | 3/3       | 3/3                       |
| `with-setup`          | 0        | 0      | 0        | 3/3       | 3/3                       |

Pass rule, `with-setup` against `baseline`: zero blockers yes; at most half its findings (0 vs 10) yes; green 3/3 yes. **PASS**

Pass rule, `with-setup` against `ai-conventions`: zero blockers yes; at most half its findings (0 vs 1) yes; green 3/3 yes. **PASS**, by one minor finding, too small to call.

Pass rule, `with-setup` against `baseline-plus-rules`: zero blockers yes; at most half its findings (0 vs 2) yes; green 3/3 yes. **PASS**, by two minor findings, too small to call.

#### `ai-conventions` against `baseline-plus-rules`

| Ticket | `ai-conventions`            | `baseline-plus-rules`        |
| ------ | --------------------------- | ---------------------------- |
| 06     | 0 + 0, 3/3, caught yes      | 0 + 1 (M1), 3/3, caught yes  |
| 07     | 0 + 0, 3/3, caught yes      | 0 + 1 (M13), 3/3, caught yes |
| 08     | 0 + 1 (M1), 3/3, caught yes | 0 + 0, 3/3, caught yes       |
| Total  | 0 + 1 = 1                   | 0 + 2 = 2                    |

#### Every failed item, `ai-conventions`

- `ai-conventions` 08 **M1**: Line 119 (spec): the locator rule.getByTestId("rule-value-chip") is written inline in the spec instead of on PromotionPage.

**Verdict.** The conventions the AI tool wrote for itself did as well as the expert's, here:
`ai-conventions` scored 0 blockers and 1 minor finding over three tickets, `baseline-plus-rules`
0 and 2, `with-setup` 0 and 0, `baseline` 1 and 9. All four arms were green 3/3 and caught every
broken feature. The difference between the two written-convention arms is one minor finding the
other way, in one generation per ticket: they are level. `with-setup` still passes the pass rule
against every arm, including `ai-conventions` (0 findings against 1).

What the AI-written section covers is close to CONVENTIONS.md on the points that cost the baseline
its findings: locators and multi-step actions belong on page objects in `e2e/pages/`, no CSS
selectors, one `test.step` per stage, comments explain why rather than narrate. All three
`ai-conventions` changes added or extended page objects; none left the planner's `// spec:` or
`// seed:` lines in the code. Its one finding is a single inline locator in ticket 08.

One caution on reading this: the reviewer scores against CHECKLIST.md and CONVENTIONS.md, which the
`baseline-plus-rules` arm was handed and the `ai-conventions` arm was not. `ai-conventions` reached
the same level without seeing the rules it was scored against.

### v1.2 notes

- **Generation time.** Per session, round 4: 12.8, 8.6 and 10.1 minutes (06, 07, 08), plus 2
  minutes once to write the conventions. The other arms' times are in the v1.1 notes below.
- **MCP tool cap.** Playwright MCP calls were capped at 5 minutes for this arm
  (`MCP_TOOL_TIMEOUT=300000`). The cap never fired; no session hung. The MCP errors in the
  transcripts are ordinary 5 to 15 second locator timeouts while the agents explored the pages.
- **Formatting.** The conventions session asked for Prettier to be run on `AGENTS.md`; its tool
  permissions did not allow it. As pre-registered, the section was committed as written, without
  formatting.
- **Whole-diff review.** Each round-4 change touched only `e2e/` (new spec, new or extended page
  objects) and the agents' plan under `specs/`.
- No infrastructure re-runs, and no verdict looked plainly wrong, so there are no notes against
  any number.

### Supplementary: stability over 20 runs

Pre-registered in [SCORING.md, "Supplementary: stability"](SCORING.md#supplementary-stability-pre-registered-committed-before-any-stability-run)
and committed (`bb74f56`) and pushed before the run. This does not change any verdict above.

Each of the 12 held-out specs, from its scored branch and unedited, run once with
`pnpm e2e <spec> --workers=1 --repeat-each=20` on one stack, one arm at a time, on 2026-10-24.
Each spec holds one test, so each cell is 20 runs of one test. Numbers come from
[`demo/tally-stability.py`](demo/tally-stability.py); logs and JSON reports are in
`evidence/runs/stability/`.

| Arm                   | Ticket 06 | Ticket 07 | Ticket 08 | Total |
| --------------------- | --------- | --------- | --------- | ----- |
| `baseline`            | 20/20     | 20/20     | 20/20     | 60/60 |
| `ai-conventions`      | 20/20     | 20/20     | 20/20     | 60/60 |
| `baseline-plus-rules` | 20/20     | 20/20     | 20/20     | 60/60 |
| `with-setup`          | 20/20     | 20/20     | 20/20     | 60/60 |

No spec failed in any repetition, and no run had to be repeated for an infrastructure reason. Each
spec took 1 to 3 minutes for its 20 repetitions. On these specs, none of the difference between
the arms is flakiness.

## Version 1.1: held-out tickets, three arms

Pre-registered in [SCORING.md, "Addendum for v1.1"](SCORING.md#addendum-for-v11-pre-registered-committed-before-any-v11-generation)
and committed before any v1.1 generation. Three arms, each generated once per ticket as round 3:

- `baseline`: Playwright's test agents, as in version 1.
- `baseline-plus-rules`: the same, plus the full text of CONVENTIONS.md in `AGENTS.md`. No skills,
  no checklist, no review step.
- `with-setup`: frozen at its round-2 commit (`with-setup-frozen-v1`), unchanged since version 1.

Tickets 06 to 08 cover customers, products and discounts, areas none of the setups was written
against. Reviews in v1.1 see the whole change, not only `e2e/`. Numbers come from
[`demo/tally3.py`](demo/tally3.py).

#### Held-out tickets 06 to 08

##### Ticket 06

| Arm                   | Blockers | Minors      | 3x runs | Caught the broken feature | Review               |
| --------------------- | -------- | ----------- | ------- | ------------------------- | -------------------- |
| `baseline`            | 0        | 2 (M1, M13) | 3/3     | yes                       | `fad76700` (round 3) |
| `baseline-plus-rules` | 0        | 1 (M1)      | 3/3     | yes                       | `a52faa49` (round 3) |
| `with-setup`          | 0        | 0           | 3/3     | yes                       | `cdad8a58` (round 3) |

##### Ticket 07

| Arm                   | Blockers | Minors              | 3x runs | Caught the broken feature | Review               |
| --------------------- | -------- | ------------------- | ------- | ------------------------- | -------------------- |
| `baseline`            | 1 (B6)   | 4 (M1, M4, M8, M13) | 3/3     | yes                       | `80a33156` (round 3) |
| `baseline-plus-rules` | 0        | 1 (M13)             | 3/3     | yes                       | `264e9819` (round 3) |
| `with-setup`          | 0        | 0                   | 3/3     | yes                       | `e78cc5bf` (round 3) |

##### Ticket 08

| Arm                   | Blockers | Minors          | 3x runs | Caught the broken feature | Review               |
| --------------------- | -------- | --------------- | ------- | ------------------------- | -------------------- |
| `baseline`            | 0        | 3 (M1, M8, M13) | 3/3     | yes                       | `baa7f8e0` (round 3) |
| `baseline-plus-rules` | 0        | 0               | 3/3     | yes                       | `f0549153` (round 3) |
| `with-setup`          | 0        | 0               | 3/3     | yes                       | `4e7e3762` (round 3) |

##### Totals

| Arm                   | Blockers | Minors | Findings | Green 3/3 | Caught the broken feature |
| --------------------- | -------- | ------ | -------- | --------- | ------------------------- |
| `baseline`            | 1        | 9      | 10       | 3/3       | 3/3                       |
| `baseline-plus-rules` | 0        | 2      | 2        | 3/3       | 3/3                       |
| `with-setup`          | 0        | 0      | 0        | 3/3       | 3/3                       |

Pass rule, `with-setup` against `baseline`: zero blockers yes; at most half its findings (0 vs 10) yes; green 3/3 yes. **PASS**

Pass rule, `with-setup` against `baseline-plus-rules`: zero blockers yes; at most half its findings (0 vs 2) yes; green 3/3 yes. **PASS**, by two minor findings, too small to call.

**Verdict.** `with-setup` passes the pass rule against both arms on the held-out tickets: no
blockers, green 3/3, and fewer than half the findings of `baseline` (0 against 10) and of
`baseline-plus-rules` (0 against 2).

**Against `baseline-plus-rules` it is close to a tie, and that is the main finding of v1.1.**
Giving the AI the conventions as plain rules removed nearly all of the baseline's problems: no
blockers, and two minor findings in three tickets (one inline locator group, one leftover planner
comment) against the baseline's one blocker and nine minors. The skills' measurable extra on these
tickets is those two minors. The other difference is speed: with-setup sessions took 1.5 to 1.7
minutes per held-out ticket, the agent-based arms 6 to 40 (5.8 to 40.4; the two 40-minute
sessions were a tool call that hung, below).

### Tickets 01 to 05, three arms

Baseline from round 1, with-setup from round 2, baseline-plus-rules from round 3. Rounds 1 and 2
were reviewed on the `e2e/` part of each change, round 3 on the whole change.

#### Tickets 01 to 05

##### Ticket 01

| Arm                   | Blockers | Minors      | 3x runs | Caught the broken feature | Review               |
| --------------------- | -------- | ----------- | ------- | ------------------------- | -------------------- |
| `baseline`            | 0        | 2 (M1, M13) | 3/3     | yes                       | `f2a17f9c` (round 1) |
| `baseline-plus-rules` | 0        | 1 (M1)      | 3/3     | yes                       | `e9a832b5` (round 3) |
| `with-setup`          | 0        | 0           | 3/3     | yes                       | `e035a918` (round 2) |

##### Ticket 02

| Arm                   | Blockers | Minors      | 3x runs | Caught the broken feature | Review               |
| --------------------- | -------- | ----------- | ------- | ------------------------- | -------------------- |
| `baseline`            | 0        | 2 (M1, M13) | 3/3     | yes                       | `b4332ed0` (round 1) |
| `baseline-plus-rules` | 0        | 0           | 3/3     | yes                       | `a53e5c32` (round 3) |
| `with-setup`          | 0        | 0           | 3/3     | yes                       | `93b27983` (round 2) |

##### Ticket 03

| Arm                   | Blockers | Minors      | 3x runs | Caught the broken feature | Review               |
| --------------------- | -------- | ----------- | ------- | ------------------------- | -------------------- |
| `baseline`            | 0        | 2 (M1, M13) | 3/3     | yes                       | `ef6b1959` (round 1) |
| `baseline-plus-rules` | 0        | 0           | 3/3     | yes                       | `4b11fbde` (round 3) |
| `with-setup`          | 0        | 0           | 3/3     | yes                       | `7af20371` (round 2) |

##### Ticket 04

| Arm                   | Blockers | Minors      | 3x runs | Caught the broken feature | Review               |
| --------------------- | -------- | ----------- | ------- | ------------------------- | -------------------- |
| `baseline`            | 0        | 2 (M1, M13) | 3/3     | yes                       | `4e4276b9` (round 1) |
| `baseline-plus-rules` | 0        | 0           | 3/3     | yes                       | `1e0c7803` (round 3) |
| `with-setup`          | 0        | 0           | 3/3     | yes                       | `0c5b93c0` (round 2) |

##### Ticket 05

| Arm                   | Blockers | Minors              | 3x runs | Caught the broken feature | Review               |
| --------------------- | -------- | ------------------- | ------- | ------------------------- | -------------------- |
| `baseline`            | 1 (B6)   | 4 (M1, M4, M9, M13) | 3/3     | yes                       | `abe124a6` (round 1) |
| `baseline-plus-rules` | 0        | 0                   | 3/3     | yes                       | `67b1e44f` (round 3) |
| `with-setup`          | 0        | 0                   | 3/3     | yes                       | `13a1f536` (round 2) |

##### Totals

| Arm                   | Blockers | Minors | Findings | Green 3/3 | Caught the broken feature |
| --------------------- | -------- | ------ | -------- | --------- | ------------------------- |
| `baseline`            | 1        | 12     | 13       | 5/5       | 5/5                       |
| `baseline-plus-rules` | 0        | 1      | 1        | 5/5       | 5/5                       |
| `with-setup`          | 0        | 0      | 0        | 5/5       | 5/5                       |

Pass rule, `with-setup` against `baseline`: zero blockers yes; at most half its findings (0 vs 13) yes; green 3/3 yes. **PASS**

Pass rule, `with-setup` against `baseline-plus-rules`: zero blockers yes; at most half its findings (0 vs 1) yes; green 3/3 yes. **PASS**, by one minor finding, too small to call.

### Every failed item, v1.1 comparison

- `baseline` 06 **M1**: e2e/tests/customers/customer-note.spec.ts lines 25-33 and 58-66: every locator, plus the multi-step hover-and-click row opening, is defined inline in the spec instead of on a new customer page object in e2e/pages/ (the spec's own plan in specs/customer-note.md asks for one).
- `baseline` 06 **M13**: e2e/tests/customers/customer-note.spec.ts lines 7-8, 23, 36, 56, 76, 86 and 92: generated boilerplate ("// spec: ...", "// seed: ...") and numbered step comments ("// 2. Find the customer from the customers list") that repeat the next test.step title instead of explaining why.
- `baseline-plus-rules` 06 **M1**: `e2e/tests/customers/customer-note.spec.ts` (diff lines 102-106 and 115) builds locators inline in the spec (`customerPage.contactCard.getByTestId("customer-email")`, `"customer-first-name"`, `notifications.getByText("Customer updated")`) instead of defining them as fields on `CustomerPage`.
- `baseline` 07 **B6**: e2e/tests/products/product-rename.spec.ts diff lines 42-51 (spec lines 35-44): the row is found by the generated, positional id `#glide-cell-1-0` and opened by hovering at hard-coded pixel offsets for the first row, where text-filtering the grid (as the legacy `gridCanvas.getByText` pattern did) would work. The grid itself is found with a CSS attribute selector (diff line 35).
- `baseline` 07 **M1**: e2e/tests/products/product-rename.spec.ts diff lines 31-36 and 39-53: every locator (header, nameInput, saveButton, notifications, grid, rowAnchor) and the multi-step search-and-open flow are written inline in the spec instead of on a page object.
- `baseline` 07 **M4**: e2e/tests/products/product-rename.spec.ts diff lines 38-79: the test has four stages (open, rename, check after save, check after reload), marked by numbered comments instead of `test.step`.
- `baseline` 07 **M8**: e2e/tests/products/product-rename.spec.ts diff line 41: the URL assertion `/query=E2E%20Hoodie/` types in the product name instead of deriving it from `PRODUCTS.hoodie.name`.
- `baseline` 07 **M13**: e2e/tests/products/product-rename.spec.ts diff lines 7-8, 38, 61, 68, 74: generator boilerplate (`// spec: ...`, `// seed: ...`) and numbered step comments that restate the next lines instead of explaining why.
- `baseline-plus-rules` 07 **M13**: e2e/tests/products/product-rename.spec.ts diff lines 77-78: '// spec: specs/product-rename.md' and '// seed: e2e/tests/seed.spec.ts' are generated planner boilerplate, and the second one points to a seed file that does not exist.
- `baseline` 08 **M1**: promotion-remove-rule.spec.ts lines 62-70 (diff lines 62-70) define every locator inline in the spec, and the delete/confirm flow (93, 105) is clicked inline instead of living on a new promotion page object in e2e/pages/.
- `baseline` 08 **M8**: Line 87 types the literal "Channel-USD" instead of the scenario's exported CHANNEL.name.
- `baseline` 08 **M13**: Numbered step comments that restate the next line, such as '// 1. Open the "E2E Tee sale" promotion' (74), '// 4. Confirm by clicking "Delete" inside the dialog' (104) and '// 5. Reload the page' (117), narrate instead of explaining why.
- `baseline` 01 **M1**: e2e/tests/orders/draft-manual-discount.spec.ts:34-37 (diff lines 40-43) and :74-76 (diff lines 80-82): the spec defines the Add Discount button, subtotal amount, manual and promotion row locators, and the multi-step fill-and-submit discount action inline instead of on DraftOrderPage.
- `baseline` 01 **M13**: e2e/tests/orders/draft-manual-discount.spec.ts:21 (diff line 27), and similar at :39, :47, :74: generated numbered step comments ('// 1. Compute the expected amounts...', '// 3. Add one E2E Tee', '// 6. Fill the value and reason, then confirm') restate the next line, and lines 1-2 point to spec and seed files that do not exist.
- `baseline-plus-rules` 01 **M1**: e2e/tests/orders/draft-manual-discount.spec.ts (diff lines 107, 117, 126, 138, 141): the spec writes the locator getByTitle("Discount amount") inline five times, chained on page-object locators, instead of putting a discount-amount locator on DraftOrderPage.
- `baseline` 02 **M1**: change.diff:24, 38, 40 and 54 define the page-header, show-more-button, 'Cancel order' menu item and dialog 'Delete' button locators, plus the delete action itself, inline in the spec instead of on DraftOrderPage.
- `baseline` 02 **M13**: change.diff:7-8 are generated boilerplate ('// spec: specs/02-draft-order-delete.md', '// seed: ...') pointing at files that aren't in the change. The numbered comments at change.diff:27, 35, 51 and 64 only repeat the test.step titles.
- `baseline` 03 **M1**: e2e/tests/orders/order-cancel.spec.ts diff lines 43 and 51-66: the confirm-button locator (dialog.getByTestId("submit")), page.getByRole("menu") and the whole multi-step cancel flow are written inline in the spec instead of as a cancel method on OrderPage (like markAsPaid).
- `baseline` 03 **M13**: e2e/tests/orders/order-cancel.spec.ts diff lines 23-24, 45, 52, 63, 70 and 76: generated boilerplate ("// spec: specs/order-cancel.md", "// seed: ...") and numbered step comments ("// 2. Click \"More actions\"...", "// 5. Reload and check again") narrate the next lines instead of explaining why.
- `baseline` 04 **M1**: e2e/tests/orders/order-cancel-fulfillment.spec.ts:27-31 and 40-59: the fulfillment-menu, cancel-menu-item and warehouse-select locators, and the whole multi-step cancel flow, are written inline in the spec instead of as locators and a `cancelFulfillment` method on `OrderPage`.
- `baseline` 04 **M13**: e2e/tests/orders/order-cancel-fulfillment.spec.ts:1-2 and 34-72: generator boilerplate (`// spec: specs/...`, `// seed: ...`) plus numbered step comments ("// 3. Open the fulfillment card's \"Show more\" menu", "// 8. Reload the page and check the state again") that restate the next line instead of explaining why.
- `baseline` 05 **B6**: e2e/tests/orders/order-notes.spec.ts:33-37 (diff lines 39-43): the Order History card is found by filtering every generic `div` on the page and taking `.last()`, which is a positional pick over untargeted elements instead of a test-id or role-based locator.
- `baseline` 05 **M1**: e2e/tests/orders/order-notes.spec.ts:29-37 (diff lines 35-43): the comment input, the Add Comment button and the history-card locators, plus the add-note action, are written inline in the spec instead of on OrderPage.
- `baseline` 05 **M4**: e2e/tests/orders/order-notes.spec.ts:39-68 (diff lines 45-74): opening the order, adding the note and reloading are separate stages in one test with no test.step.
- `baseline` 05 **M9**: e2e/tests/orders/order-notes.spec.ts:26 (diff line 32): the note text gets a randomUUID suffix to make it unique, which is unnecessary because the database is reset before each test.
- `baseline` 05 **M13**: e2e/tests/orders/order-notes.spec.ts:15,25,39,47,63 (diff lines 21,31,45,53,69): numbered generated step comments such as "// 3. Open the order" and "// 5. Fill the Comment textbox ... and click Add Comment" restate the next line instead of explaining why.

### v1.1 notes

- **Generation time.** Per session, round 3: baseline 8.5, 40.4, 8.2 minutes (06, 07, 08);
  baseline-plus-rules 5.8, 10.3, 39.5 minutes (06, 07, 08) and 6.2 to 10.8 on tickets 01 to 05;
  with-setup 1.5 to 1.7. Wall-clock time of each headless session, from its transcript. The two
  40-minute sessions each lost 30 minutes to one call to the Playwright MCP server's `test_run`
  tool that never answered; Claude Code aborts an MCP tool call after 1800 seconds, and the session
  then carried on. It affects time only: scoring judges the code produced. A per-call MCP timeout
  of a few minutes would have avoided it; it was not changed mid-run.
- **Whole-diff review.** No round-3 session changed anything outside `e2e/` (and the agents' plan
  files under `specs/`).
- **Housekeeping.** Saleor's `.github/workflows` were removed from `main`; Actions stays disabled.

---

# Version 1 results (unchanged)

Scored exactly as [SCORING.md](SCORING.md) describes. Every number below is produced by
[`demo/tally.py`](demo/tally.py) from the files in [`evidence/`](evidence/): the blind
reviewers' verdicts (`evidence/reviews/`, with the submission-to-branch key in `key.tsv`), the
three-run and broken-feature logs (`evidence/runs/`), and the generation transcripts on each
ticket's branch (`evidence/transcripts/`).

**Ticket 01 is marked.** Baseline ticket 01's output was partly seen while the with-setup
rules file and skills were being written, and read in full before they were committed (see
[SCORING.md, "Disclosure: ticket 01"](SCORING.md#disclosure-ticket-01)). Every verdict is given
over all five tickets and over tickets 02 to 05 alone.

## Environment

|                  |                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------- |
| Saleor           | 3.23.44 (`ghcr.io/saleor/saleor:3.23`, image `64a790583512`)                            |
| Saleor Dashboard | 3.23.41, upstream commit `77dc49b`                                                      |
| Playwright       | 1.58.2, pinned in `package.json`, used for both branches and every run                  |
| Node / pnpm      | 24.22.1 / 11.13.1                                                                       |
| AI tool          | Claude Code 2.1.310, Claude Opus 5.5 (`claude-opus-5-5`), on a subscription, no API key |
| Machine          | Apple-silicon Mac, Docker Desktop                                                       |

## Final result (round 2)

The baseline was generated once. The with-setup branch was generated twice (round 1, then
round 2 after the change described below), each time all five tickets from scratch.

#### Totals: All five tickets

| Branch       | Blockers | Minors | Findings | Green 3/3 | Caught the broken feature |
| ------------ | -------- | ------ | -------- | --------- | ------------------------- |
| `baseline`   | 1        | 12     | 13       | 5/5       | 5/5                       |
| `with-setup` | 0        | 0      | 0        | 5/5       | 5/5                       |

Pass rule: zero blockers yes; at most half the baseline's findings (0 vs 13) yes; green 3/3 yes. **PASS**

#### Totals: Tickets 02 to 05 only

| Branch       | Blockers | Minors | Findings | Green 3/3 | Caught the broken feature |
| ------------ | -------- | ------ | -------- | --------- | ------------------------- |
| `baseline`   | 1        | 10     | 11       | 4/4       | 4/4                       |
| `with-setup` | 0        | 0      | 0        | 4/4       | 4/4                       |

Pass rule: zero blockers yes; at most half the baseline's findings (0 vs 11) yes; green 3/3 yes. **PASS**

**Verdict: the setup passes.** Over all five tickets and over tickets 02 to 05 alone, the
with-setup tests have no blockers, have fewer than half the baseline's findings (none against
13, or none against 11 without ticket 01), and are green three runs out of three.

What the difference is, in plain terms: both sides wrote tests that run, stay green and catch
the feature breaking. On this suite Playwright's agents did better than expected, because the
repository already carries Saleor's own `CLAUDE.md` and a seed that uses the suite's fixture.
What the baseline did not do is write tests the way this team writes them. In every ticket it
put locators and multi-step actions in the spec instead of on the page objects (M1), and it left
the generator's numbered narration and pointers to plan files (M13). In ticket 05 it located the
order history by filtering every `div` on the page and taking the last one (B6), salted the note
with a random UUID the suite does not need (M9), and skipped `test.step` (M4). Those are what a
reviewer on this team would send back.

### Per ticket (round 2)

#### Ticket 01 (see the disclosure)

| Branch       | Blockers | Minors      | 3x runs | Caught the broken feature | Review     |
| ------------ | -------- | ----------- | ------- | ------------------------- | ---------- |
| `baseline`   | 0        | 2 (M1, M13) | 3/3     | yes                       | `f2a17f9c` |
| `with-setup` | 0        | 0           | 3/3     | yes                       | `e035a918` |

#### Ticket 02

| Branch       | Blockers | Minors      | 3x runs | Caught the broken feature | Review     |
| ------------ | -------- | ----------- | ------- | ------------------------- | ---------- |
| `baseline`   | 0        | 2 (M1, M13) | 3/3     | yes                       | `b4332ed0` |
| `with-setup` | 0        | 0           | 3/3     | yes                       | `93b27983` |

#### Ticket 03

| Branch       | Blockers | Minors      | 3x runs | Caught the broken feature | Review     |
| ------------ | -------- | ----------- | ------- | ------------------------- | ---------- |
| `baseline`   | 0        | 2 (M1, M13) | 3/3     | yes                       | `ef6b1959` |
| `with-setup` | 0        | 0           | 3/3     | yes                       | `7af20371` |

#### Ticket 04

| Branch       | Blockers | Minors      | 3x runs | Caught the broken feature | Review     |
| ------------ | -------- | ----------- | ------- | ------------------------- | ---------- |
| `baseline`   | 0        | 2 (M1, M13) | 3/3     | yes                       | `4e4276b9` |
| `with-setup` | 0        | 0           | 3/3     | yes                       | `0c5b93c0` |

#### Ticket 05

| Branch       | Blockers | Minors              | 3x runs | Caught the broken feature | Review     |
| ------------ | -------- | ------------------- | ------- | ------------------------- | ---------- |
| `baseline`   | 1 (B6)   | 4 (M1, M4, M9, M13) | 3/3     | yes                       | `abe124a6` |
| `with-setup` | 0        | 0                   | 3/3     | yes                       | `13a1f536` |

### Every failed item (round 2 comparison)

- `baseline` 01 **M1**: e2e/tests/orders/draft-manual-discount.spec.ts:34-37 (diff lines 40-43) and :74-76 (diff lines 80-82): the spec defines the Add Discount button, subtotal amount, manual and promotion row locators, and the multi-step fill-and-submit discount action inline instead of on DraftOrderPage.
- `baseline` 01 **M13**: e2e/tests/orders/draft-manual-discount.spec.ts:21 (diff line 27), and similar at :39, :47, :74: generated numbered step comments ('// 1. Compute the expected amounts...', '// 3. Add one E2E Tee', '// 6. Fill the value and reason, then confirm') restate the next line, and lines 1-2 point to spec and seed files that do not exist.
- `baseline` 02 **M1**: change.diff:24, 38, 40 and 54 define the page-header, show-more-button, 'Cancel order' menu item and dialog 'Delete' button locators, plus the delete action itself, inline in the spec instead of on DraftOrderPage.
- `baseline` 02 **M13**: change.diff:7-8 are generated boilerplate ('// spec: specs/02-draft-order-delete.md', '// seed: ...') pointing at files that aren't in the change. The numbered comments at change.diff:27, 35, 51 and 64 only repeat the test.step titles.
- `baseline` 03 **M1**: e2e/tests/orders/order-cancel.spec.ts diff lines 43 and 51-66: the confirm-button locator (dialog.getByTestId("submit")), page.getByRole("menu") and the whole multi-step cancel flow are written inline in the spec instead of as a cancel method on OrderPage (like markAsPaid).
- `baseline` 03 **M13**: e2e/tests/orders/order-cancel.spec.ts diff lines 23-24, 45, 52, 63, 70 and 76: generated boilerplate ("// spec: specs/order-cancel.md", "// seed: ...") and numbered step comments ("// 2. Click \"More actions\"...", "// 5. Reload and check again") narrate the next lines instead of explaining why.
- `baseline` 04 **M1**: e2e/tests/orders/order-cancel-fulfillment.spec.ts:27-31 and 40-59: the fulfillment-menu, cancel-menu-item and warehouse-select locators, and the whole multi-step cancel flow, are written inline in the spec instead of as locators and a `cancelFulfillment` method on `OrderPage`.
- `baseline` 04 **M13**: e2e/tests/orders/order-cancel-fulfillment.spec.ts:1-2 and 34-72: generator boilerplate (`// spec: specs/...`, `// seed: ...`) plus numbered step comments ("// 3. Open the fulfillment card's \"Show more\" menu", "// 8. Reload the page and check the state again") that restate the next line instead of explaining why.
- `baseline` 05 **B6**: e2e/tests/orders/order-notes.spec.ts:33-37 (diff lines 39-43): the Order History card is found by filtering every generic `div` on the page and taking `.last()`, which is a positional pick over untargeted elements instead of a test-id or role-based locator.
- `baseline` 05 **M1**: e2e/tests/orders/order-notes.spec.ts:29-37 (diff lines 35-43): the comment input, the Add Comment button and the history-card locators, plus the add-note action, are written inline in the spec instead of on OrderPage.
- `baseline` 05 **M4**: e2e/tests/orders/order-notes.spec.ts:39-68 (diff lines 45-74): opening the order, adding the note and reloading are separate stages in one test with no test.step.
- `baseline` 05 **M9**: e2e/tests/orders/order-notes.spec.ts:26 (diff line 32): the note text gets a randomUUID suffix to make it unique, which is unnecessary because the database is reset before each test.
- `baseline` 05 **M13**: e2e/tests/orders/order-notes.spec.ts:15,25,39,47,63 (diff lines 21,31,45,53,69): numbered generated step comments such as "// 3. Open the order" and "// 5. Fill the Comment textbox ... and click Add Comment" restate the next line instead of explaining why.

## Round 1, and what changed

#### Totals: All five tickets

| Branch       | Blockers | Minors | Findings | Green 3/3 | Caught the broken feature |
| ------------ | -------- | ------ | -------- | --------- | ------------------------- |
| `baseline`   | 1        | 12     | 13       | 5/5       | 5/5                       |
| `with-setup` | 1        | 0      | 1        | 5/5       | 5/5                       |

Pass rule: zero blockers NO; at most half the baseline's findings (1 vs 13) yes; green 3/3 yes. **FAIL**

#### Totals: Tickets 02 to 05 only

| Branch       | Blockers | Minors | Findings | Green 3/3 | Caught the broken feature |
| ------------ | -------- | ------ | -------- | --------- | ------------------------- |
| `baseline`   | 1        | 10     | 11       | 4/4       | 4/4                       |
| `with-setup` | 1        | 0      | 1        | 4/4       | 4/4                       |

Pass rule: zero blockers NO; at most half the baseline's findings (1 vs 11) yes; green 3/3 yes. **FAIL**

**Round 1 failed the pass rule on one blocker:** with-setup ticket 05, B6. The session added a
`data-test-id="order-history"` to `src/orders/components/OrderHistory/OrderHistory.tsx` and built
its locators on it. The reviewer is given the change under `e2e/` only (SCORING.md), so it found a
test id that exists nowhere in `src/` and failed B6. The test itself ran green 3/3 and caught the
break, because the id did exist on that branch. The verdict stands as the reviewer gave it.

The lesson is still a real one: a test-only ticket should not depend on an unreviewed app change.
**What was changed for round 2** (commit `ba60244` on `with-setup`): the write-test skill now says
never to edit `src/` for a test ticket and to use an existing test id or a role and name instead,
and to confirm `git status` lists only `e2e/` files before handing back; the review-test skill
treats any change outside `e2e/` as a finding; the rules in `CLAUDE.md` say the same in one line.
Nothing else changed. In round 2 all five sessions changed files under `e2e/` only.

#### Per ticket (round 1)

##### Ticket 01 (see the disclosure)

| Branch       | Blockers | Minors      | 3x runs | Caught the broken feature | Review     |
| ------------ | -------- | ----------- | ------- | ------------------------- | ---------- |
| `baseline`   | 0        | 2 (M1, M13) | 3/3     | yes                       | `f2a17f9c` |
| `with-setup` | 0        | 0           | 3/3     | yes                       | `77f8e630` |

##### Ticket 02

| Branch       | Blockers | Minors      | 3x runs | Caught the broken feature | Review     |
| ------------ | -------- | ----------- | ------- | ------------------------- | ---------- |
| `baseline`   | 0        | 2 (M1, M13) | 3/3     | yes                       | `b4332ed0` |
| `with-setup` | 0        | 0           | 3/3     | yes                       | `6ae3c04b` |

##### Ticket 03

| Branch       | Blockers | Minors      | 3x runs | Caught the broken feature | Review     |
| ------------ | -------- | ----------- | ------- | ------------------------- | ---------- |
| `baseline`   | 0        | 2 (M1, M13) | 3/3     | yes                       | `ef6b1959` |
| `with-setup` | 0        | 0           | 3/3     | yes                       | `c9177058` |

##### Ticket 04

| Branch       | Blockers | Minors      | 3x runs | Caught the broken feature | Review     |
| ------------ | -------- | ----------- | ------- | ------------------------- | ---------- |
| `baseline`   | 0        | 2 (M1, M13) | 3/3     | yes                       | `4e4276b9` |
| `with-setup` | 0        | 0           | 3/3     | yes                       | `bdb82dad` |

##### Ticket 05

| Branch       | Blockers | Minors              | 3x runs | Caught the broken feature | Review     |
| ------------ | -------- | ------------------- | ------- | ------------------------- | ---------- |
| `baseline`   | 1 (B6)   | 4 (M1, M4, M9, M13) | 3/3     | yes                       | `abe124a6` |
| `with-setup` | 1 (B6)   | 0                   | 3/3     | yes                       | `8304d048` |

#### Every failed item (round 1)

- `baseline` 01 **M1**: e2e/tests/orders/draft-manual-discount.spec.ts:34-37 (diff lines 40-43) and :74-76 (diff lines 80-82): the spec defines the Add Discount button, subtotal amount, manual and promotion row locators, and the multi-step fill-and-submit discount action inline instead of on DraftOrderPage.
- `baseline` 01 **M13**: e2e/tests/orders/draft-manual-discount.spec.ts:21 (diff line 27), and similar at :39, :47, :74: generated numbered step comments ('// 1. Compute the expected amounts...', '// 3. Add one E2E Tee', '// 6. Fill the value and reason, then confirm') restate the next line, and lines 1-2 point to spec and seed files that do not exist.
- `baseline` 02 **M1**: change.diff:24, 38, 40 and 54 define the page-header, show-more-button, 'Cancel order' menu item and dialog 'Delete' button locators, plus the delete action itself, inline in the spec instead of on DraftOrderPage.
- `baseline` 02 **M13**: change.diff:7-8 are generated boilerplate ('// spec: specs/02-draft-order-delete.md', '// seed: ...') pointing at files that aren't in the change. The numbered comments at change.diff:27, 35, 51 and 64 only repeat the test.step titles.
- `baseline` 03 **M1**: e2e/tests/orders/order-cancel.spec.ts diff lines 43 and 51-66: the confirm-button locator (dialog.getByTestId("submit")), page.getByRole("menu") and the whole multi-step cancel flow are written inline in the spec instead of as a cancel method on OrderPage (like markAsPaid).
- `baseline` 03 **M13**: e2e/tests/orders/order-cancel.spec.ts diff lines 23-24, 45, 52, 63, 70 and 76: generated boilerplate ("// spec: specs/order-cancel.md", "// seed: ...") and numbered step comments ("// 2. Click \"More actions\"...", "// 5. Reload and check again") narrate the next lines instead of explaining why.
- `baseline` 04 **M1**: e2e/tests/orders/order-cancel-fulfillment.spec.ts:27-31 and 40-59: the fulfillment-menu, cancel-menu-item and warehouse-select locators, and the whole multi-step cancel flow, are written inline in the spec instead of as locators and a `cancelFulfillment` method on `OrderPage`.
- `baseline` 04 **M13**: e2e/tests/orders/order-cancel-fulfillment.spec.ts:1-2 and 34-72: generator boilerplate (`// spec: specs/...`, `// seed: ...`) plus numbered step comments ("// 3. Open the fulfillment card's \"Show more\" menu", "// 8. Reload the page and check the state again") that restate the next line instead of explaining why.
- `baseline` 05 **B6**: e2e/tests/orders/order-notes.spec.ts:33-37 (diff lines 39-43): the Order History card is found by filtering every generic `div` on the page and taking `.last()`, which is a positional pick over untargeted elements instead of a test-id or role-based locator.
- `baseline` 05 **M1**: e2e/tests/orders/order-notes.spec.ts:29-37 (diff lines 35-43): the comment input, the Add Comment button and the history-card locators, plus the add-note action, are written inline in the spec instead of on OrderPage.
- `baseline` 05 **M4**: e2e/tests/orders/order-notes.spec.ts:39-68 (diff lines 45-74): opening the order, adding the note and reloading are separate stages in one test with no test.step.
- `baseline` 05 **M9**: e2e/tests/orders/order-notes.spec.ts:26 (diff line 32): the note text gets a randomUUID suffix to make it unique, which is unnecessary because the database is reset before each test.
- `baseline` 05 **M13**: e2e/tests/orders/order-notes.spec.ts:15,25,39,47,63 (diff lines 21,31,45,53,69): numbered generated step comments such as "// 3. Open the order" and "// 5. Fill the Comment textbox ... and click Add Comment" restate the next line instead of explaining why.
- `with-setup` 05 **B6**: e2e/pages/orderPage.ts diff line 9: getByTestId("order-history") targets a data-test-id that does not exist anywhere in src/ (OrderHistory.tsx renders a plain DashboardCard), so the history container and the noteInput and addNoteButton locators scoped to it (lines 11, 13) match nothing. The container should be located by role and name or by a real test id instead.

## Generation time

| Ticket | Baseline (round 1) | With-setup round 1 | With-setup round 2 |
| ------ | ------------------ | ------------------ | ------------------ |
| 01     | 7.8 min            | 2.2 min            | 2.7 min            |
| 02     | 6.5 min            | 1.9 min            | 1.9 min            |
| 03     | 6.8 min            | 2.5 min            | 2.8 min            |
| 04     | 6.9 min            | 1.5 min            | 3.9 min            |
| 05     | 6.4 min            | 3.4 min            | 2.0 min            |

Wall-clock time of each headless session, from its transcript. The baseline drives a browser
through the Playwright MCP server in three agent passes; the with-setup sessions read the source
and run the suite.

## Notes and irregularities

- **Where the tests are.** Each ticket was generated and scored on its own branch, from the setup
  commit: `baseline-t01` to `baseline-t05`, and `with-setup-r2-t01` to `with-setup-r2-t05` (round
  1: `with-setup-t01` to `-t05`). The `baseline` and `with-setup` branches hold the setups. The
  with-setup tickets extend the same page objects independently, so combining all five is an
  ordinary merge with two conflicts; it was not done by hand, so that nothing scored was edited.
- **Reviewer scope.** Reviewers see the `e2e/` part of a change. The only session that changed
  anything outside `e2e/` (test code or app code) was with-setup round 1 ticket 05, above. One
  with-setup round-1 session also reformatted `demo/review-schema.json` with Prettier; it is not
  test code and played no part in scoring.
- **Discarded scoring attempt.** The first attempt at scoring round 2 broke on a git branch
  switch and ran its checks against `main`. It is kept, unused, in
  [`evidence/discarded/`](evidence/discarded/) with an explanation, and round 2 was scored again
  from the start.
- **The reviewer is a model.** Its full verdicts, with evidence for every item, are in
  `evidence/reviews/`. One round-1 verdict (above) was wrong on the facts because of its scope;
  no verdict was changed.
- **Same model on both sides.** Playwright's agents ship pinned to `model: sonnet`; they were set
  to `inherit` so both branches ran on Opus.
- **Rules file location.** Saleor's `CLAUDE.md` is a symlink to `AGENTS.md`, so the setup's rules
  are appended to `AGENTS.md`.
