# Sample repo check: saleor/saleor-dashboard

- **Send-backs** (pull requests a reviewer asked to change before merging): 1 of 6 pull requests on `e2e/` (17%), and 5 of 50 pull requests on the earlier `playwright/` (10%).
- **Your AI reviewer**: your team changed the code for 18 of its 40 comments on test files. They give 3 candidate conventions for your reviewer to confirm.
- **The tests**: Playwright's free test agents, 10 findings at 8.2 to 40.4 minutes a ticket; with the setup, 0 at 1.5 to 1.7.
- **The plan**: three additions to your repository: your conventions written where Claude Code reads them, a skill that writes each test to them, and a skill that checks each test before a person sees it.
- **Next step**: do the plan yourself for free, or have the setup put in under the guarantee. The options are at the end.

This is what a repo check finds when a team reviews little test code in pull requests. That is a finding in itself: your conventions live in reviewers' heads, or are not checked at all, so your AI tool has nothing to learn them from.

## The plan for your suite

All on a branch, nothing on your main branch. Your own `CLAUDE.md`, skills and hooks stay as they are.

1. **A rules section in `AGENTS.md`.** Your `CLAUDE.md` is a link to `AGENTS.md`, so Claude Code
   reads it at the start of every session.
2. **A write-test skill**: a written procedure the AI tool follows to turn a ticket into a test. It
   builds on your suite's own scenarios (named sets of starting data the suite restores before each
   test), actors (who is signed in), fixture and page objects (shared files that hold one screen's
   locators and actions, so tests don't repeat them).
3. **A review-test skill** that checks each new test against your conventions, and flags any
   change outside `e2e/`.

The conventions come from your suite as it stands ([CONVENTIONS.md](CONVENTIONS.md), each rule citing
the file that sets it). The ones the free agents broke on these tickets come first:

- **Locators live in page objects, not in the test.** Broken on all three tickets by Playwright's
  free test agents, and on one by the side with conventions the AI wrote itself.
- **Comments explain why, not what.** Broken on all three: generated pointers to plan files and
  numbered comments that repeat the next line.
- **Expected values come from the scenario's constants.** Broken twice: a product name and a
  channel name typed in.
- **Find elements by test id, then by role and name; never by position.** Broken once.
- **One test is one user story, with a step per stage.** Broken once.

From your AI reviewer, each **needing your reviewer's yes**:

- **AR1** (no commented-out code; turn a test off with `test.skip()`) is new: nothing in your
  conventions covers it.
- **AR2** (titles read as a correct sentence) adds only that the sentence is correct; titles already
  describe the behaviour in a sentence.
- **AR3** (API calls through Playwright's request fixture) came from the old suite. In `e2e/`, calls
  to your API already go through `e2e/lib/graphql.ts`; if your reviewer says that rule stands, AR3 is
  left out.

## What your reviewers send back today

From the most recently closed pull requests that change your test code: `e2e/` and the earlier `playwright/`. Your suite moved, so its earlier path is shown too.

|                                         | `e2e/`                             | `playwright/` (earlier)             |
| --------------------------------------- | ---------------------------------- | ----------------------------------- |
| Pull requests read                      | 6, closed 2026-09-22 to 2026-10-07 | 50, closed 2025-05-23 to 2026-09-03 |
| Sent back                               | **1 (17%)**                        | **5 (10%)**                         |
| Changes requested                       | 1                                  | 1                                   |
| Changed after a review comment          | 1                                  | 5                                   |
| Reviewer comments on test files         | 1                                  | 3                                   |
| AI reviewer comments on test files      | 0                                  | 40                                  |
| ... followed by a change to those lines | 0                                  | 18                                  |

A pull request is sent back when someone other than its author requested changes, or commented on any file in it or in a review's summary, and the pull request then changed. That is why `playwright/` shows 5 changed after a comment with only 3 comments on test files. Bots, your AI reviewer included, are not in the rate.

None: no reason recurred on 2 or more pull requests, so no convention is drafted from your reviewers' comments.

**Cost**: 6 send-backs × \_\_\_ hours each × \_\_\_ per hour = **\_\_\_**, over 2025-05-23 to 2026-10-07.

**Your AI reviewer flagged, and your team changed.** `copilot-pull-request-reviewer` left 40 comments on test files under the earlier `playwright/`; 18 were followed by a commit that changed the lines they were about (21 were not; 1 could not be checked). These are not in the send-back rate and are never evidence for the guarantee.

They give 3 candidate conventions, which count only if your reviewer confirms them:

- **AR1**: Delete code a test or page object no longer needs instead of commenting it out, and use test.skip\(\) for a test that must be turned off for now. From 7 comments on 1 pull request: [#6176](https://github.com/saleor/saleor-dashboard/pull/6176#discussion_r2589486378), [#6176](https://github.com/saleor/saleor-dashboard/pull/6176#discussion_r2602035791).
- **AR2**: Proofread test titles so each one reads as a correct sentence describing the behaviour under test. From 2 comments on 1 pull request: [#6176](https://github.com/saleor/saleor-dashboard/pull/6176#discussion_r2600158887), [#6176](https://github.com/saleor/saleor-dashboard/pull/6176#discussion_r2600158925).
- **AR3**: Use Playwright's built-in request fixture for API calls instead of creating a context with playwrightRequest.newContext\(\). From 2 comments on 1 pull request: [#6460](https://github.com/saleor/saleor-dashboard/pull/6460#discussion_r2974908623), [#6460](https://github.com/saleor/saleor-dashboard/pull/6460#discussion_r2974908651).

## Questions for your reviewer

Not held: Saleor is a public project, so there was no reviewer to ask. With a team, it takes about 30 minutes with whoever reviews the tests, with the pull requests open. The answers decide which candidates become conventions.

For each of the last three tests your reviewer sent back, newest first:

1. Which test was it, and what was wrong with it when you first saw it?
2. What did you ask the author to change, and what did they change?
3. Why did it matter: what would have gone wrong if it had merged as it was?
4. Have you had to say the same thing on other tests? Which ones?

And for each candidate from your AI reviewer: would you have asked for it yourself? Point to a recent pull request where you did, or say why not.

| Candidate | Rule                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| AR1       | Delete code a test or page object no longer needs instead of commenting it out, and use test.skip\(\) for a test that must be turned off for now |
| AR2       | Proofread test titles so each one reads as a correct sentence describing the behaviour under test                                                |
| AR3       | Use Playwright's built-in request fixture for API calls instead of creating a context with playwrightRequest.newContext\(\)                      |

## The result

Three tickets written for the public demo (06, 07, 08), in areas none of the setups was built
for, each written three ways by the same AI tool on Saleor's suite and checked the same way
([RESULTS.md](RESULTS.md)).

|                                        | Playwright's free test agents | + conventions the AI wrote itself | With the setup |
| -------------------------------------- | ----------------------------- | --------------------------------- | -------------- |
| Blockers                               | 1                             | 0                                 | 0              |
| Minor findings                         | 9                             | 1                                 | 0              |
| Stability, passes out of 20 per ticket | 60/60                         | 60/60                             | 60/60          |
| Green every run                        | 3/3                           | 3/3                               | 3/3            |
| Caught the break                       | 3/3                           | 3/3                               | 3/3            |
| Minutes a ticket                       | 8.2 to 40.4                   | 8.6 to 12.8                       | 1.5 to 1.7     |

- **Blockers**: problems a reviewer would not merge the test with.
- **Minor findings**: the test works, but a reviewer would send it back to read like the rest of
  your suite.
- **Stability**: passes out of 20 repeated runs per ticket, after 3 runs in a row.
- **Caught the break**: before any test was written, we made a small change to the dashboard for each
  ticket that breaks the feature while the screen still responds. A good test fails when it is in.

## What this means for your team

- Out of the box, Playwright's free test agents wrote tests a reviewer would send back: 1 blocker and 9 minor findings over 3 tickets.
- Asking the AI tool to write down your conventions first took that from 10 to 1 finding, for a few minutes' work. You can do that today; the next step says how.
- With the setup: 0 findings.
- Every side's tests passed all 20 repeated runs and failed when the feature was broken, so none of the difference is flakiness or tests that check nothing.

What the setup adds that the free route doesn't:

- **Speed**: 1.5 to 1.7 minutes a ticket, against 8.6 to 12.8 for the free agents with the AI's own conventions. Part of that is a shorter workflow: it skips Playwright's plan, generate and heal loop.
- **A review step** that checks each test against your conventions before a person sees it.
- **Conventions your reviewer confirmed**, not ones the AI guessed.
- **Ten tests from your backlog**, delivered as pull requests.
- **The guarantee**: if the tests don't pass, you don't pay (the next step says what passing means).

## The next step

1. **Do the plan in-house, free.** Paste this into your AI tool in your repository and commit what it writes where the tool reads it every time:

   > Read this repository's e2e suite and write the conventions a reviewer on this team would enforce for new end-to-end tests, as a section to add to AGENTS.md.

2. **The setup, €4,950**, with the repo check's €950 credited in full if you go ahead within 30 days, under the guarantee: it passes when your own engineer would merge each test, it runs green in your CI, and it fails when the feature it covers is broken on purpose. If it doesn't pass, you don't pay.
3. **The setup and six months' upkeep, €9,950.**

The cost of waiting: 6 send-backs × \_\_\_ hours each × \_\_\_ per hour = **\_\_\_**, over 2025-05-23 to 2026-10-07.

## What this sample is not

- **Three tickets, written for the demo**, not your own. A demonstration, not a study.
- **No buyer call**, so "What you asked us to find out", which opens a real report, is not shown.
- **One AI generation per ticket per side.** On 3 tickets, a gap of 1 between the setup and the best free side (1 finding against 0) is too small to call.
- **The scoring is partly circular.** The checklist and the setup come from the same reading of your suite, so the setup was scored against rules it was given; the free sides were not.
- **The free agents' 40.4 minutes** was a tool call that hung for 30 minutes, and that side ran
  without the 5-minute tool-call limit the side with the AI's own conventions had ([RESULTS.md](RESULTS.md),
  v1.1 and v1.2 notes).
- **The public demo also ran a fourth side**, conventions written by someone who knows the suite: 0
  blockers and 2 minor findings.
- **The reviewer here is an AI model.** The guarantee is judged by your own engineer and your CI, not by an AI reviewer.

## Appendix

### The three sides

- **Playwright's free test agents**: Playwright's own planner, generator and healer, set up as
  Playwright documents them.
- **+ conventions the AI wrote itself**: the same agents, plus the conventions an AI session wrote
  after reading your suite, from one fixed prompt, used unedited. Your team can do this today for
  free.
- **With the setup**: rules and a write-and-review workflow built from your suite's conventions
  ([CONVENTIONS.md](CONVENTIONS.md)), before this review history was read.

### Per ticket

#### Ticket 06

| Side                              | Blockers | Minors      | 3x runs | Stability (20 repeats) | Caught the break |
| --------------------------------- | -------- | ----------- | ------- | ---------------------- | ---------------- |
| Playwright's free test agents     | 0        | 2 (M1, M13) | 3/3     | 20/20                  | yes              |
| + conventions the AI wrote itself | 0        | 0           | 3/3     | 20/20                  | yes              |
| With the setup                    | 0        | 0           | 3/3     | 20/20                  | yes              |

#### Ticket 07

| Side                              | Blockers | Minors              | 3x runs | Stability (20 repeats) | Caught the break |
| --------------------------------- | -------- | ------------------- | ------- | ---------------------- | ---------------- |
| Playwright's free test agents     | 1 (B6)   | 4 (M1, M4, M8, M13) | 3/3     | 20/20                  | yes              |
| + conventions the AI wrote itself | 0        | 0                   | 3/3     | 20/20                  | yes              |
| With the setup                    | 0        | 0                   | 3/3     | 20/20                  | yes              |

#### Ticket 08

| Side                              | Blockers | Minors          | 3x runs | Stability (20 repeats) | Caught the break |
| --------------------------------- | -------- | --------------- | ------- | ---------------------- | ---------------- |
| Playwright's free test agents     | 0        | 3 (M1, M8, M13) | 3/3     | 20/20                  | yes              |
| + conventions the AI wrote itself | 0        | 1 (M1)          | 3/3     | 20/20                  | yes              |
| With the setup                    | 0        | 0               | 3/3     | 20/20                  | yes              |

### The most common problems in the free sides' tests

1. **Locators defined in the spec** (M1, minor): in 4 of 6 free-side changes. For example, Playwright's free test agents, ticket 06: e2e/tests/customers/customer-note.spec.ts lines 25-33 and 58-66: every locator, plus the multi-step hover-and-click row opening, is defined inline in the spec instead of on a new customer page object in e2e/pages/ (the spec's own plan in specs/customer-note.md asks for one). Also: Playwright's free test agents, ticket 07; Playwright's free test agents, ticket 08; + conventions the AI wrote itself, ticket 08.
2. **Comments that narrate** (M13, minor): in 3 of 6 free-side changes. For example, Playwright's free test agents, ticket 06: e2e/tests/customers/customer-note.spec.ts lines 7-8, 23, 36, 56, 76, 86 and 92: generated boilerplate ("// spec: ...", "// seed: ...") and numbered step comments ("// 2. Find the customer from the customers list") that repeat the next test.step title instead of explaining why. Also: Playwright's free test agents, ticket 07; Playwright's free test agents, ticket 08.
3. **Expected values typed in** (M8, minor): in 2 of 6 free-side changes. For example, Playwright's free test agents, ticket 07: e2e/tests/products/product-rename.spec.ts diff line 41: the URL assertion `/query=E2E%20Hoodie/` types in the product name instead of deriving it from `PRODUCTS.hoodie.name`. Also: Playwright's free test agents, ticket 08.

### How it was checked

- Each change was reviewed blind, by a fresh AI reviewer that did not know which side wrote it,
  against a checklist of your suite's own conventions.
- Each ticket's tests ran 3 times in a row, then 20 more times, with your own
  runner and config.
- The tickets, the breaks, the checklist and the method were committed before the runs they
  govern: `0162552` (tickets 06 to 08 and their breaks) and `25051f9` (the side with the AI's own
  conventions), each before any of its tests was generated, and `bb74f56` before the 20 repeated
  runs.

Evidence, in this repository: the blind reviews in `evidence/reviews/round-3/` and `round-4/`,
the runs and breaks in `evidence/runs/round-3/` and `round-4/`, the 20 repeated runs in
`evidence/runs/stability/`, and each session's transcript on its ticket's branch.
