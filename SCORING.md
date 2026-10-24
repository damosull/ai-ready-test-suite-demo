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
- **Same harness.** Every session is started by [`demo/claude-session.sh`](demo/claude-session.sh):
  a fresh headless session per ticket, the operator's personal `CLAUDE.md` and memory excluded,
  the same tool permissions, no human in the loop. The baseline sessions are given the
  Playwright MCP server the agents need ([`demo/playwright-mcp.json`](demo/playwright-mcp.json));
  the with-setup sessions are given no MCP servers.
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
- **Output.** A structured verdict per item, saved under `results/reviews/`. The prompt is in
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

## Limits

Five tickets, one application, one model, one generation per ticket per round. That is enough to
show a difference, not to measure its size with any confidence. The reviewer is also an AI
model; its verdicts are published in full so a reader can check them.
