# Results

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
