# How the two runs are scored

This is the full method, written before any test was generated (see the commit history), so
that someone else could run it again and get comparable numbers.

## What is compared

Two ways of getting an AI coding tool to write Playwright tests for the Saleor Dashboard's
existing `e2e/` suite:

| Branch       | What the AI tool gets                                                                                                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseline`   | The repository as Saleor ships it, plus Playwright's own test agents (Planner, Generator, Healer) from `npx playwright init-agents --loop=claude`. Nothing else.                                                        |
| `with-setup` | The repository as Saleor ships it, plus a rules file (`CLAUDE.md` additions) and two skills (`.claude/skills/write-test`, `.claude/skills/review-test`) written from the suite's own conventions. No Playwright agents. |

Both start from the same commit on `main`, which already contains Saleor's own `CLAUDE.md`,
skills and Claude hooks. Those are part of the repository under test and are identical on both
branches.

## Generating the tests

- **Same tickets.** [`tickets/01.md` to `05.md`](tickets/). Neither the tickets nor
  [CHECKLIST.md](CHECKLIST.md) are changed after generation starts.
- **Same model and tool.** Claude Code (CLI), Claude Opus, on a Claude Code subscription. No
  API key.
- **Same harness.** Every session is started by [`demo/generate.sh`](demo/generate.sh), which
  calls [`demo/claude-session.sh`](demo/claude-session.sh): a fresh headless session per ticket,
  the operator's personal `CLAUDE.md` and memory excluded, the same tool permissions, no human
  in the loop. The baseline sessions are given the Playwright MCP server the agents need
  ([`demo/playwright-mcp.json`](demo/playwright-mcp.json)); the with-setup sessions are given
  no MCP servers.
- **What each side can read.** The demo's method files are removed from disk for every
  generation session: `SCORING.md`, `RESULTS.md`, `demo/breaks/`, the review prompt and
  `evidence/`. The baseline sessions also do not see `CONVENTIONS.md` or `CHECKLIST.md`, because
  that knowledge is what the setup is. On `with-setup` they are part of the setup, as they would
  be in a team's repository. Both sides see the tickets and the whole of Saleor's repository.
- **Baseline configuration.** `npx playwright init-agents --loop=claude --config
e2e/playwright.config.ts --project stable`, as Playwright documents. Three changes, all made
  before generation and none specific to a ticket: the agents' `model: sonnet` is set to
  `model: inherit`, so both branches run on the same model; the generated seed test imports the
  suite's fixture and opens the dashboard (Playwright's docs say to adapt the seed to the app);
  the MCP server is pointed at the suite's config.
- **Same starting state.** Each ticket's session starts from the branch tip with nothing from
  the other tickets, and its output is committed as one commit named for the ticket.
- **Prompts.** Kept verbatim in [`demo/prompts/`](demo/prompts/). The baseline prompt tells the
  tool to use the Planner, Generator and Healer agents. The with-setup prompt tells it to use the
  `write-test` skill.
- **No hand edits.** What a session writes is what is scored. If a session produces nothing for a
  ticket, that ticket scores as below.

## Review: blocker and minor findings

- **Who reviews.** For each ticket on each branch, a fresh headless Claude Code session (same
  model, same isolation flags) that has seen neither setup. It runs in a clean checkout of `main`,
  so it can read the existing suite to check for duplicated helpers, but there is no `CLAUDE.md`
  addition, no skill and no Playwright agent anywhere in its working copy.
- **Blind.** The reviewer gets the ticket, [CHECKLIST.md](CHECKLIST.md),
  [CONVENTIONS.md](CONVENTIONS.md) and the ticket's diff against `main`. It is not told which
  branch the diff came from; diffs are labelled with a random submission id.
- **Against what.** Every item in CHECKLIST.md, judged once per ticket across everything the
  ticket's change adds or edits. An item is either met or failed; a failed item is one finding,
  with the file and line as evidence. A ticket can therefore score at most 10 blockers and 13
  minors, and ten hard waits count as one B4, not ten.
- **Output.** A structured verdict per item, saved under `evidence/reviews/`. The prompt is in
  [`demo/prompts/review.md`](demo/prompts/review.md).
- **No overriding.** The operator does not change a reviewer's verdict. If a verdict is plainly
  wrong it is noted in RESULTS.md next to the number, and the number stays.

## Stability: three runs in a row

Each ticket's spec is run three times in a row with the suite's own runner:

```bash
pnpm e2e <spec file> --workers=1   # three times
```

Each run restores the database before each test, as the suite always does. A ticket is green
only if all three runs pass. A run that fails for an infrastructure reason (the Docker stack not
starting, a build error unrelated to the test) is re-run and the reason recorded.

## Does the test catch the feature breaking?

For every ticket there is a small change to the dashboard's source that breaks the behaviour the
ticket describes, written before any test was generated: [`demo/breaks/`](demo/breaks/). For each
ticket on each branch:

1. apply the break,
2. run the ticket's spec once (the runner rebuilds the dashboard),
3. record whether the spec failed, which is what it should do,
4. revert the break.

A spec that still passes with its feature broken is a B1 blocker for that ticket, even if the
reviewer marked B1 as met. A spec that does not exist, or does not compile, records "no".

## Missing or broken output

- No test written for a ticket: B2 (misses every acceptance criterion) and B10, 0/3 runs, did
  not catch the break.
- A test that does not compile: B10, and it is still reviewed for everything else.

## The pass rule

The setup passes only if all three hold, totalled over the five tickets:

1. **Zero blockers** on `with-setup`, counting any B1 added by the broken-feature check.
2. **At most half the baseline's findings**: with-setup's blockers plus minors is no more than
   50% of the baseline's blockers plus minors.
3. **Green 3/3** for every with-setup spec.

## If the setup does not pass

The rules file and skills may be improved, and all five tickets regenerated from scratch on
`with-setup` and re-scored, as a new round. Each round's numbers, and what was changed and why,
are kept in RESULTS.md. The baseline is run once: it is the free tool as shipped, and there is
nothing on its side to tune. The tickets, the checklist, the breaks and this method are never
changed to improve a score.

## Disclosure: ticket 01

The with-setup rules file and skills were drafted while the baseline session for ticket 01 was
running. While drafting them the operator saw part of that session's transcript (the planner's
snapshot of the order-discount dialog), and read the finished baseline spec for ticket 01 before
committing the setup. Nothing in the setup was changed after that read, and the setup's examples
come from the existing suite, not from any ticket, but the setup was not written blind to
baseline ticket 01. Tickets 02 to 05 on both branches were generated after the setup was
committed, with no look at either side's output first.

RESULTS.md therefore marks ticket 01 and gives the verdict twice: over all five tickets, and over
tickets 02 to 05 only.

## Limits

Five tickets, one application, one model, one generation per ticket per round. That is enough to
show a difference, not to measure its size with any confidence. The reviewer is also an AI
model; its verdicts are published in full so a reader can check them.

## Addendum for v1.1 (pre-registered, committed before any v1.1 generation)

Version 1 compared two arms on tickets the setup's author had seen while writing the setup. v1.1
adds a held-out test and a third arm, to separate "the AI was told the rules" from "the AI had a
workflow that applies and checks them".

- **Third arm, `baseline-plus-rules`.** The baseline as it stands (Playwright's agents, set to
  `model: inherit`, the same seed and MCP configuration) plus the full text of
  [CONVENTIONS.md](CONVENTIONS.md) appended to `AGENTS.md` (which `CLAUDE.md` links to) as plain
  rules. No skills, no CHECKLIST.md, no review step. Its sessions use the baseline prompt and see
  the same files the baseline sees; the rules reach them only through `AGENTS.md`.
- **`with-setup` is frozen** at its round-2 commit (`ba60244`, tagged `with-setup-frozen-v1`).
  Nothing in it changes in this version, whatever the result. There is no round 4.
- **Three held-out tickets**, [`tickets/06.md` to `08.md`](tickets/), in customers, products and
  discounts, each fitting patterns the suite already has, each with a break in
  [`demo/breaks/`](demo/breaks/) checked by hand before this commit. Branches frozen before these
  tickets existed get the ticket file from `main` at generation time.
- **Generation.** All three arms on tickets 06 to 08; `baseline-plus-rules` also on 01 to 05. One
  generation per ticket per arm, as round 3 (branches `<arm>-r3-t<ticket>`). Whatever comes out is
  the result: no regeneration, no edits.
- **Review.** Exactly as before, except that the reviewer now sees the whole change (everything but
  the session transcript and the ticket file), not only `e2e/`. Still blind: each change gets a
  random submission id, and the key is kept apart from the verdicts.
- **Stability and breaks.** Exactly as before.
- **Pass rule.** Unchanged, and stated for `with-setup` against each of the other two arms: zero
  blockers on `with-setup`; `with-setup`'s findings at most half the other arm's; every
  `with-setup` spec green 3/3. The headline is tickets 06 to 08. Tickets 01 to 05 are also tallied
  for three arms (baseline round 1, with-setup round 2, baseline-plus-rules round 3), noting that
  the rounds were reviewed with different diff scopes.
- **Tally.** [`demo/tally3.py`](demo/tally3.py).

## Addendum for v1.2 (pre-registered, committed before any v1.2 generation)

v1.1 compared conventions written by someone who knows the suite against no conventions. A buyer's
real free alternative is neither: it is asking the AI tool to write the conventions itself. v1.2
adds that as a fourth arm.

- **Fourth arm, `ai-conventions`.** The baseline as it stands (Playwright's agents, set to
  `model: inherit`, the same seed and MCP configuration) plus a conventions section in `AGENTS.md`
  written by a fresh Claude Code session, with no expert involved. Its generation sessions use the
  baseline prompt ([`demo/prompts/ai-conventions.md`](demo/prompts/ai-conventions.md) is a copy of
  it) and see the same files the baseline sees; the conventions reach them only through
  `AGENTS.md`.
- **How the conventions are written.** [`demo/write-conventions.sh`](demo/write-conventions.sh)
  runs one fresh headless session (same model, same isolation flags as the other sessions, no MCP
  servers, tools limited to reading, writing files and read-only shell) with this one fixed prompt,
  verbatim:

  > Read this repository's e2e suite and write the conventions a reviewer on this team would
  > enforce for new end-to-end tests, as a section to add to AGENTS.md.

  It runs in a fresh export of the Saleor import commit (`28bf90d`, upstream `77dc49b`) with a
  one-commit git history of its own. CONVENTIONS.md, CHECKLIST.md, SCORING.md, RESULTS.md,
  HANDOFF.md, `tickets/`, `demo/`, `evidence/` and every generated-test branch are absent, so it
  sees only what Saleor ships. It runs once.

- **Its output is used as-is.** If the session changes `AGENTS.md`, that change is applied to the
  `ai-conventions` branch (made from `baseline`) unedited. If it does not, its final reply is
  appended to `AGENTS.md` verbatim. Anything else it writes is not used. The transcript, the reply
  and the change are published in [`evidence/ai-conventions/`](evidence/ai-conventions/).
- **Generation.** Tickets 06 to 08 only, one generation each, as round 4 (branches
  `ai-conventions-r4-t06` to `t08`). Whatever comes out is the result: no regeneration, no edits.
  The other three arms are not rerun; their round-3 results stand.
- **One harness change, this arm only.** Playwright MCP tool calls are capped at 5 minutes
  (`MCP_TOOL_TIMEOUT=300000`). Two v1.1 sessions each lost 30 minutes to one `test_run` call that
  never returned; a warm spec run takes about a minute. The cap affects time, not what is scored.
  The stack is warmed before the first session, so no capped call has to start it cold.
- **Review, stability and breaks.** Exactly as v1.1: blind whole-change review against the same
  CHECKLIST.md and CONVENTIONS.md, the same three runs, the same breaks.
- **Reported.** The four-arm table for tickets 06 to 08, from
  [`demo/tally4.py`](demo/tally4.py), and a direct comparison of `ai-conventions` against
  `baseline-plus-rules`, ticket by ticket. The v1 pass rule is also stated for `with-setup`
  against `ai-conventions`. Generation time is wall-clock per session from the run log. Whatever
  comes out is the result.
- **Disclosure.** The checklist and CONVENTIONS.md come from the same reading of the suite. The
  `baseline-plus-rules` arm was handed rules the reviewer then scored it against; the `baseline`
  and `ai-conventions` arms were not.

## Supplementary: stability (pre-registered, committed before any stability run)

A supplementary check of how stable the scored held-out tests are over many runs. It does not
change any pre-registered verdict: the v1.1 and v1.2 results, the pass rule outcomes and every
number in them stand, whatever this shows.

- **Scope.** The 12 held-out specs: tickets 06 to 08 on all four arms, each from its scored branch
  (`baseline-r3-t0N`, `ai-conventions-r4-t0N`, `baseline-plus-rules-r3-t0N`, `with-setup-r3-t0N`),
  unedited. The spec is the one that ticket's scored checks ran, as named on the `specs:` line of
  `evidence/runs/round-3/` or `round-4/`.
- **Run.** Each spec once with the suite's own runner and config:
  `pnpm e2e <spec> --workers=1 --repeat-each=20`. No retries (the config has none), the config's
  timeouts, and every test restores its scenario first, as always. A JSON reporter is added next to
  the line reporter so repetitions can be counted; nothing else is changed.
- **One stack, one arm at a time.** The default stack, in the order `baseline`, `ai-conventions`,
  `baseline-plus-rules`, `with-setup`, tickets 06, 07, 08 within each. Nothing else uses the stack
  while it runs. Run detached, with a log.
- **Counting.** A spec passes a repetition when every test in it passes in that repetition.
  Reported as passes out of 20 per spec, with per-test passes in the evidence.
- **Failures.** A test that starts and fails counts as a failure, whatever the cause, and its line
  and cause are named in RESULTS.md. Only a run in which no test of the spec ran (the stack or the
  build failing first) is run again, once, with the reason recorded.
- **Scripts and evidence.** [`demo/stability.sh`](demo/stability.sh),
  [`demo/stability-count.py`](demo/stability-count.py), [`demo/tally-stability.py`](demo/tally-stability.py);
  results in `evidence/runs/stability/`. Before this commit the counting was tried on one of the
  suite's own specs (`feedback.spec.ts`, two repetitions), not on any held-out spec.
