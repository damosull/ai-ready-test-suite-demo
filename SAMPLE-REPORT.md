# Sample repo check: saleor/saleor-dashboard

This is what a repo check gives a team, run on Saleor's open-source dashboard and its Playwright
suite. It is written as if Saleor's team were the buyer.

- **The review history is real.** It was read from Saleor's own pull requests on GitHub on
  2026-10-25, with read-only access.
- **The tests are the public demo's.** Three tickets (06, 07, 08), written for the demo in areas
  none of the setups was built for. Each was written three ways by the same AI tool and checked
  the same way. The method and evidence are in this repository ([README.md](README.md),
  [RESULTS.md](RESULTS.md), [SCORING.md](SCORING.md), [`evidence/`](evidence/)).
- **No reviewer conversation was held.** It is a public project, so there was no reviewer to ask.
  The questions are shown as they would be put to yours.

Every figure below comes from a run file or the demo's results. Nothing is estimated. The repo
check's own report script filled it in, from the demo's evidence laid out as a repo check writes
it. The only changes from its wording are the ones a sample needs: what the tickets are, how the
method was fixed in advance, and where the evidence is.

### Words used here

- **Test**, or **spec**: one Playwright test file.
- **Locator**: how a test finds something on the screen, such as a button.
- **Page object**: a shared file that holds one screen's locators and actions, so tests don't
  repeat them.
- **Scenario**: a named set of starting data that the suite restores before each test.
- **Convention**: a rule a reviewer on the team holds a new test to.
- **Send-back**: a pull request a reviewer asked to change before it merged.
- **Force-push**: replacing a pull request's commits, often after review.
- **Bot account**, **AI reviewer**: an automated reviewer on GitHub, here Copilot's.
- **Blocker**, **minor finding**: see "The result" below.
- **The guarantee**: the setup is paid for only if, on tickets agreed up front, your own engineer
  would merge each test, it runs green repeatedly in your CI, and it fails when the feature is
  broken on purpose.

It starts from what your reviewers already send back, because that is the part your AI tool cannot
read for itself.

## What your reviewers send back today

Your suite moved: new tests go in `e2e/`, and the old suite is kept, frozen, in `e2e-legacy/`
([CONVENTIONS.md](CONVENTIONS.md), rule 1.1). `e2e/` is young, so its history is short. The old
path, `playwright/`, is shown after it, and the candidate conventions come from there.

From the 6 most recently closed pull requests in `saleor/saleor-dashboard` that change `e2e/` (closed 2026-09-22 to 2026-10-07; 6 merged). Only 6 such pull requests exist; 50 were asked for.

**Send-back rate: 1 of 6 (17%).**

How it is counted: a pull request is sent back when a human reviewer (anyone but its author) requested changes, or left a review comment on any of its files and the pull request then got a new commit or a force-push. Merge commits from the base branch do not count. A rebase after a comment counts as a change. Comments from bot accounts, your AI reviewer's included, are not in this rate; they are reported apart below.

- Changes requested: 1
- Changed after a review comment: 1
- Both: 1

### Why tests are sent back

1 reviewer comment on files under `e2e/`, none on a reason raised on 2 or more pull requests.

Few comments on test code is a finding in itself, not a clean bill: it usually means test code is reviewed somewhere other than the pull request, or not closely at all. The reviewer conversation asks which.

### Cost in engineer hours

1 send-back × \_\_\_ hours each = \_\_\_ engineer hours; × \_\_\_ per hour = **\_\_\_**, over 2026-09-22 to 2026-10-07.

The hours one send-back costs your team, and the cost of an engineer hour, are yours to give; no figure is assumed.

### Conventions drafted from these reasons

None: no reason recurred often enough to write down.

### Your AI reviewer flagged, and your team changed

No bot account left an inline comment on a file under `e2e/` in these pull requests.

### Before the suite moved: `playwright/`

From the 50 most recently closed pull requests in `saleor/saleor-dashboard` that change `playwright/` (closed 2025-05-23 to 2026-09-03; 45 merged).

**Send-back rate: 5 of 50 (10%).**

How it is counted: a pull request is sent back when a human reviewer (anyone but its author) requested changes, or left a review comment on any of its files and the pull request then got a new commit or a force-push. Merge commits from the base branch do not count. A rebase after a comment counts as a change. Comments from bot accounts, your AI reviewer's included, are not in this rate; they are reported apart below.

- Changes requested: 1
- Changed after a review comment: 5
- Both: 1

#### Why tests are sent back

3 reviewer comments on files under `playwright/`, none on a reason raised on 2 or more pull requests.

Few comments on test code is a finding in itself, not a clean bill: it usually means test code is reviewed somewhere other than the pull request, or not closely at all. The reviewer conversation asks which.

#### Cost in engineer hours

5 send-backs × \_\_\_ hours each = \_\_\_ engineer hours; × \_\_\_ per hour = **\_\_\_**, over 2025-05-23 to 2026-09-03.

The hours one send-back costs your team, and the cost of an engineer hour, are yours to give; no figure is assumed.

#### Conventions drafted from these reasons

None: no reason recurred often enough to write down.

#### Your AI reviewer flagged, and your team changed

Bot accounts left 40 inline comments on files under `playwright/` (`copilot-pull-request-reviewer` 40). **18 were followed by a commit in the same pull request that changed the lines they were about**; 21 were not (14 of those had their thread resolved, which on its own does not count); 1 could not be checked (a comment on removed lines).

These are not in the send-back rate above, which counts human reviewers only. They are never evidence for the guarantee.

What the changed ones were about (11 fall into a reason said in at least 2 comments; one pull request is enough here):

1. **Commented-out code left in**: 7 comments on 1 pull request. Test or page-object lines were commented out instead of being deleted or the test being skipped with test.skip\(\).
   - [#6176](https://github.com/saleor/saleor-dashboard/pull/6176#discussion_r2589486378) `playwright/tests/home.spec.ts`: "Instead of commenting out code, consider removing it entirely or using \`test.skip\(\)\` on a separate test that can be re-enabled later. Comme…"
   - [#6176](https://github.com/saleor/saleor-dashboard/pull/6176#discussion_r2602035831) `playwright/tests/customers.spec.ts`: "These commented lines should be removed rather than left in the code. If the grid interaction checks are no longer needed, remove them enti…"
   - [#6176](https://github.com/saleor/saleor-dashboard/pull/6176#discussion_r2602035930) `playwright/pages/ordersPage.ts`: "These commented lines should be removed rather than left in the code. If the grid wait calls are no longer needed, delete them entirely. \`\`…"
2. **Garbled test titles**: 2 comments on 1 pull request. Test names had a wrong or missing word, so the title did not read as a correct sentence.
   - [#6176](https://github.com/saleor/saleor-dashboard/pull/6176#discussion_r2600158887) `playwright/tests/permissionGroup.spec.ts`: "The test name contains a typo: "edit on existing" should be "edit an existing" or "edit existing". \`\`\`suggestion test\("TC: SALEOR_134 Shoul…"
   - [#6176](https://github.com/saleor/saleor-dashboard/pull/6176#discussion_r2600158925) `playwright/tests/permissionGroup.spec.ts`: "The test name is missing the word "members" between "edit" and "existing". It should read "Should be able to edit members of existing permi…"
3. **Hand-made API request context**: 2 comments on 1 pull request. An APIRequestContext was created by hand with playwrightRequest.newContext\(\) in beforeAll, so it had no authentication and was never disposed, when the built-in request fixture should have been used.
   - [#6460](https://github.com/saleor/saleor-dashboard/pull/6460#discussion_r2974908623) `playwright/tests/appSmokeTests.spec.ts`: "\`playwrightRequest.newContext\(\)\` creates an unauthenticated APIRequestContext \(it won’t include the admin \`storageState\` from \`testWithPerm…"
   - [#6460](https://github.com/saleor/saleor-dashboard/pull/6460#discussion_r2974908651) `playwright/tests/appSmokeTests.spec.ts`: "The APIRequestContext created in \`beforeAll\` is never disposed. Please add an \`afterAll\` hook to call \`requestContext.dispose\(\)\` \(or avoid…"

Candidate conventions, strongest first (most changed comments behind them, then most pull requests), each traced to the comments behind it. A candidate becomes a convention only when your reviewer confirms it in the reviewer conversation, or a human comment gives the same reason. At most 5 are raised in the conversation.

- **AR1 Delete code a test or page object no longer needs instead of commenting it out, and use test.skip\(\) for a test that must be turned off for now.** From 7 comments on 1 pull request.
- **AR2 Proofread test titles so each one reads as a correct sentence describing the behaviour under test.** From 2 comments on 1 pull request.
- **AR3 Use Playwright's built-in request fixture for API calls instead of creating a context with playwrightRequest.newContext\(\).** From 2 comments on 1 pull request.

Conventions and candidates in this report, by the history they come from: `e2e/`: none; `playwright/`: AR1, AR2, AR3.

## Reviewer conversation

**Not held.** Saleor is a public project, so there was no reviewer to ask. These are the questions
for your reviewer: about 30 minutes, with the pull requests open. The answers decide which
candidates become conventions.

### The last tests you sent back

For each of the last three tests your reviewer sent back, newest first:

1. Which test was it, and what was wrong with it when you first saw it?
2. What did you ask the author to change, and what did they change?
3. Why did it matter: what would have gone wrong if it had merged as it was?
4. Have you had to say the same thing on other tests? Which ones?

### What your AI reviewer flagged

5. Your AI reviewer flagged each of these on test code, and the author changed the lines. For
   each: would you have asked for it yourself? Point to a recent pull request where you did, or
   say why not.

| Candidate | Rule                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| AR1       | Delete code a test or page object no longer needs instead of commenting it out, and use test.skip\(\) for a test that must be turned off for now |
| AR2       | Proofread test titles so each one reads as a correct sentence describing the behaviour under test                                                |
| AR3       | Use Playwright's built-in request fixture for API calls instead of creating a context with playwrightRequest.newContext\(\)                      |

## The result

|                                                  | Playwright's free test agents | Free agents + conventions the AI wrote itself | Tailored setup |
| ------------------------------------------------ | ----------------------------- | --------------------------------------------- | -------------- |
| Blockers (would not merge)                       | 1                             | 0                                             | 0              |
| Minor findings (would be sent back)              | 9                             | 1                                             | 0              |
| Stability: passes out of 20 repeats, all tickets | 60/60                         | 60/60                                         | 60/60          |
| Green every run, tickets                         | 3/3                           | 3/3                                           | 3/3            |
| Caught the break, tickets                        | 3/3                           | 3/3                                           | 3/3            |
| Minutes per ticket                               | 8.2 to 40.4                   | 8.6 to 12.8                                   | 1.5 to 1.7     |

- **Blockers**: a reviewer would not merge the test until they are fixed.
- **Minor findings**: the test works, but a reviewer would send it back to read like the rest of
  your suite.
- **Stability**: how many of 20 repeated runs per ticket passed, after 3 runs in a
  row.
- **Caught the break**: before any test was written, we made a small change to the dashboard for
  each ticket that breaks the feature while the screen still responds. A good test fails when that
  change is in.

## The three sides

- **Playwright's free test agents**: Playwright's own planner, generator and healer, set up as
  Playwright documents them.
- **Free agents + conventions the AI wrote itself**: the same agents, plus the conventions an AI
  session wrote after reading your suite, from one fixed prompt, used unedited. This is what your
  team can do today for free.
- **Tailored setup**: rules and a write-and-review workflow built from your suite's
  conventions ([CONVENTIONS.md](CONVENTIONS.md)). It was built before this review history was
  read, so nothing above went into it.

## The three most common problems in the free sides' tests

1. **Locators defined in the spec** (M1, minor): in 4 of 6 free-side changes.
   - Playwright's free test agents, ticket 06: e2e/tests/customers/customer-note.spec.ts lines 25-33 and 58-66: every locator, plus the multi-step hover-and-click row opening, is defined inline in the spec instead of on a new customer page object in e2e/pages/ (the spec's own plan in specs/customer-note.md asks for one).
   - Playwright's free test agents, ticket 07: e2e/tests/products/product-rename.spec.ts diff lines 31-36 and 39-53: every locator (header, nameInput, saveButton, notifications, grid, rowAnchor) and the multi-step search-and-open flow are written inline in the spec instead of on a page object.
   - Playwright's free test agents, ticket 08: promotion-remove-rule.spec.ts lines 62-70 (diff lines 62-70) define every locator inline in the spec, and the delete/confirm flow (93, 105) is clicked inline instead of living on a new promotion page object in e2e/pages/.
   - Free agents + conventions the AI wrote itself, ticket 08: Line 119 (spec): the locator rule.getByTestId("rule-value-chip") is written inline in the spec instead of on PromotionPage.
2. **Comments that narrate** (M13, minor): in 3 of 6 free-side changes.
   - Playwright's free test agents, ticket 06: e2e/tests/customers/customer-note.spec.ts lines 7-8, 23, 36, 56, 76, 86 and 92: generated boilerplate ("// spec: ...", "// seed: ...") and numbered step comments ("// 2. Find the customer from the customers list") that repeat the next test.step title instead of explaining why.
   - Playwright's free test agents, ticket 07: e2e/tests/products/product-rename.spec.ts diff lines 7-8, 38, 61, 68, 74: generator boilerplate (`// spec: ...`, `// seed: ...`) and numbered step comments that restate the next lines instead of explaining why.
   - Playwright's free test agents, ticket 08: Numbered step comments that restate the next line, such as '// 1. Open the "E2E Tee sale" promotion' (74), '// 4. Confirm by clicking "Delete" inside the dialog' (104) and '// 5. Reload the page' (117), narrate instead of explaining why.
3. **Expected values typed in** (M8, minor): in 2 of 6 free-side changes.
   - Playwright's free test agents, ticket 07: e2e/tests/products/product-rename.spec.ts diff line 41: the URL assertion `/query=E2E%20Hoodie/` types in the product name instead of deriving it from `PRODUCTS.hoodie.name`.
   - Playwright's free test agents, ticket 08: Line 87 types the literal "Channel-USD" instead of the scenario's exported CHANNEL.name.

## What this means for your team

- Out of the box, Playwright's agents wrote tests a reviewer would send back: 1 blocker and 9 minor findings over 3 tickets. That is review work your team does before an AI-written test can merge.
- Asking the AI tool to write down your suite's conventions first took that from 10 to 1 finding. That costs your team nothing but a few minutes.
- The tailored setup's tests had 0 findings, against 1 for the best free side. A gap of 1 on 3 tickets is too small to call: what the setup adds is mainly speed and a review step, not a different class of test.
- Every side's tests passed all 20 repeated runs, so none of the difference above is flakiness.
- Every side's tests failed when the feature was broken, as they should.
- Minutes per ticket: Playwright's free test agents, 8.2 to 40.4; Free agents + conventions the AI wrote itself, 8.6 to 12.8; Tailored setup, 1.5 to 1.7.
- Part of the setup's speed is a shorter workflow, not better tests: it skips Playwright's plan,
  generate and heal loop.
- The 40.4 minutes was a tool call that hung for 30 minutes, not slow work
  ([RESULTS.md](RESULTS.md), v1.1 notes).

## The plan for your suite

What the setup would change in this repository, and what it would be built on. Items marked
**needs your reviewer** go in only if your reviewer says yes in the conversation above.

### What goes into the repository

All on a branch, nothing on your main branch. Your own `CLAUDE.md`, skills and hooks stay as they are.

- **A rules section in `AGENTS.md`.** Your `CLAUDE.md` is a link to `AGENTS.md`, so Claude Code
  reads it at the start of every session.
- **A write-test skill.** A skill is a written procedure the AI tool follows when asked. This one
  takes a ticket and writes the test on your suite's own scenarios (the named starting data each
  test restores), actors (who is signed in), page objects and fixture.
- **A review-test skill.** It checks each new test against your conventions before a person sees
  it, and flags any change outside `e2e/`.

### The conventions it is built on

From your suite as it stands. Each rule cites the file in `e2e/` or the doc that sets it. The ones
the free sides broke on these tickets come first:

- **Locators live in page objects in `e2e/pages/`, not in the test file.** Broken by Playwright's
  free agents on all three tickets, and once by the conventions the AI wrote itself.
- **Comments explain why, not what.** Broken by the free agents on all three tickets: generated
  pointers to plan files and numbered comments that repeat the next line.
- **Expected values come from the scenario's exported constants.** Broken twice: a product name
  and a channel name typed in.
- **Locate by test id, then by role and name; never by position.** Broken once: a grid row picked
  by its place on screen.
- **One test is one user story, with a step per stage.** Broken once.

The rest, which the free sides kept to on these tickets: new tests in `e2e/` only; the suite's own
`test` and `expect`; data from a named scenario rather than set up in the test; no cleanup code,
because the database is restored before every test; no sign-in through the screens except in the
login test; no fixed waits; strict TypeScript.

### From your AI reviewer

- **AR1, no commented-out code; turn a test off with `test.skip()`.** New: nothing in the suite's
  conventions covers it. **Needs your reviewer.**
- **AR2, test titles read as a correct sentence.** Your suite already asks for titles that
  describe the behaviour in a sentence; AR2 adds only that the sentence is correct. **Needs your
  reviewer** for that addition.
- **AR3, API calls through Playwright's request fixture.** It came from the old suite
  (`playwright/`). The new suite already has its own rule: calls to your API go through
  `e2e/lib/graphql.ts`. **Needs your reviewer** to say which applies in `e2e/`. If it is the
  existing rule, AR3 is left out with that reason.

### From your human reviewers

Nothing recurred, so nothing is drafted from them. The conversation asks where test code is
reviewed, and anything it turns up is added the same way, citing the pull requests behind it.

## Per ticket

#### Ticket 06

| Side                                          | Blockers | Minors      | 3x runs | Stability (20 repeats) | Caught the break | Minutes | Review     |
| --------------------------------------------- | -------- | ----------- | ------- | ---------------------- | ---------------- | ------- | ---------- |
| Playwright's free test agents                 | 0        | 2 (M1, M13) | 3/3     | 20/20                  | yes              | 8.5     | `fad76700` |
| Free agents + conventions the AI wrote itself | 0        | 0           | 3/3     | 20/20                  | yes              | 12.8    | `c18bb572` |
| Tailored setup                                | 0        | 0           | 3/3     | 20/20                  | yes              | 1.5     | `cdad8a58` |

#### Ticket 07

| Side                                          | Blockers | Minors              | 3x runs | Stability (20 repeats) | Caught the break | Minutes | Review     |
| --------------------------------------------- | -------- | ------------------- | ------- | ---------------------- | ---------------- | ------- | ---------- |
| Playwright's free test agents                 | 1 (B6)   | 4 (M1, M4, M8, M13) | 3/3     | 20/20                  | yes              | 40.4    | `80a33156` |
| Free agents + conventions the AI wrote itself | 0        | 0                   | 3/3     | 20/20                  | yes              | 8.6     | `06940040` |
| Tailored setup                                | 0        | 0                   | 3/3     | 20/20                  | yes              | 1.7     | `e78cc5bf` |

#### Ticket 08

| Side                                          | Blockers | Minors          | 3x runs | Stability (20 repeats) | Caught the break | Minutes | Review     |
| --------------------------------------------- | -------- | --------------- | ------- | ---------------------- | ---------------- | ------- | ---------- |
| Playwright's free test agents                 | 0        | 3 (M1, M8, M13) | 3/3     | 20/20                  | yes              | 8.2     | `baa7f8e0` |
| Free agents + conventions the AI wrote itself | 0        | 1 (M1)          | 3/3     | 20/20                  | yes              | 10.1    | `ed1fd1d2` |
| Tailored setup                                | 0        | 0               | 3/3     | 20/20                  | yes              | 1.7     | `4e7e3762` |

## How it was checked

- Each change was reviewed blind, by a fresh AI reviewer that did not know which side wrote it,
  against a checklist of your suite's own conventions. Its verdicts are in the evidence.
- Each ticket's tests ran 3 times in a row, then 20 more times, with your own
  runner and config.
- The tickets, the breaks, the checklist and the method were committed before the runs they
  govern: `0162552` (tickets 06 to 08 and their breaks) and `25051f9` (the side with conventions
  the AI wrote itself), each before any of its tests was generated, and `bb74f56` before the 20
  repeated runs. A real repo check records sha256 of every input instead.
- One AI generation per ticket per side. On 3 tickets, a gap of one or two minor
  findings is within what a second generation could change.

### What this sample is not

- **Three tickets.** A demonstration, not a study. It shows what the difference looks like; it does
  not measure how large it is in general.
- **The scoring is partly circular.** The checklist and the conventions come from the same reading
  of the suite, and the tailored setup was built from those conventions. So the setup was scored
  against rules it was given; the two free sides were not.
- **The reviewer is an AI model.** Its full verdicts are published, so you can check them or
  disagree.
- **The public demo also ran a fourth side**, conventions written by someone who knows the suite:
  0 blockers and 2 minor findings over the same three tickets ([RESULTS.md](RESULTS.md)).

Evidence, in this repository: the blind reviews in `evidence/reviews/round-3/` and `round-4/`
(which side wrote which change is in `evidence/reviews/key.tsv`), the runs and breaks in
`evidence/runs/round-3/` and `round-4/`, the 20 repeated runs in `evidence/runs/stability/`, and
each session's transcript on its ticket's branch. The review-history run folders are kept outside
this repository.
