# Does your AI tool write tests your team would merge?

A side-by-side test on a real open-source suite: Playwright's free test agents, the same agents
given conventions the AI tool wrote for itself, the same agents given conventions written by
someone who knows the suite, and an AI setup tailored to the suite. All on tickets none of them
was built for, reviewed blind against the team's own conventions.

<img src="demo/graphic/results.png" width="100%" alt="Findings a reviewer would send back, and minutes a ticket, over three held-out tickets. Playwright's free test agents: 10 findings (1 blocking, 9 minor), 8 to 40 minutes. Plus conventions the AI wrote itself: 1 finding, 9 to 13 minutes. Plus conventions an expert wrote: 2 findings, 6 to 40 minutes. With the setup: 0 findings, 1.5 to 1.7 minutes. The 40-minute sessions each lost 30 minutes to a tool call that hung. Every side's tests passed 240 runs out of 240 and failed when the feature was broken.">

## Results

Versions: Version 1 is tickets 01 to 05, two arms, rounds 1 and 2; v1.1 is held-out tickets 06 to
08, three arms, round 3; v1.2 adds the fourth arm on 06 to 08, round 4.

Three held-out tickets (customers, products, discounts) on the Saleor Dashboard's end-to-end
suite. One AI-written test change per ticket per arm, every change reviewed by a fresh AI reviewer
that did not know which arm wrote it. The reviewer is the same model as the generator (Claude
Opus 5.5), in a fresh session told nothing about the arms. A planner comment left in a test can
still show which arm wrote it.

|                                                  | Playwright agents | Agents + AI-written conventions | Agents + expert conventions | Tailored setup |
| ------------------------------------------------ | ----------------- | ------------------------------- | --------------------------- | -------------- |
| Blockers (would not merge)                       | 1                 | 0                               | 0                           | **0**          |
| Minor findings (would be sent back)              | 9                 | 1                               | 2                           | **0**          |
| Tickets green three runs in a row                | 3/3               | 3/3                             | 3/3                         | 3/3            |
| Failed when the feature was broken, as it should | 3/3               | 3/3                             | 3/3                         | 3/3            |
| Minutes per ticket                               | 8 to 40           | 8.6 to 12.8                     | 6 to 40                     | 1.5 to 1.7     |

Run 20 more times each afterwards, every arm's held-out tests passed every time: 60 out of 60 runs
per arm, 240 out of 240 in all ([RESULTS.md](RESULTS.md), supplementary stability).

The tailored setup skips Playwright's planner, generator and healer loop, so part of its speed
lead is a shorter workflow, not better tests. The two 40-minute sessions were a tool call that
hung, explained in [RESULTS.md](RESULTS.md).

Minutes per ticket don't include the one-off time to build the setup. Only the ai-conventions arm
ran with a 5-minute cap on Playwright MCP tool calls; it never fired.

**Written-down conventions make the difference, and the AI tool can write them itself.** Asked
once to write the conventions a reviewer on this team would enforce, a fresh AI session read the
suite for two minutes and wrote an `AGENTS.md` section. With it, the free agents went from 1
blocker and 9 minor findings to none and 1. Conventions written by someone who knows the suite
scored none and 2: on these three tickets, the two are level. The tailored setup, which adds a
write-test workflow and a self-review step, scored 0 and was several times faster. Over the
convention-bearing arms, that is a difference of one or two minor findings in three tickets.

All four arms wrote tests that work. The difference is whether the tests belong to the suite.
Without conventions, the agents put locators and multi-step actions in the test files instead of
the page objects the team keeps for them, left generated narration in the code, and once picked
an element by position. With conventions, from either source, they mostly did not.

The first version of this demo used five order-management tickets and two arms. Its results,
including the tailored setup's failed first round and what was changed, stay in
[RESULTS.md](RESULTS.md) below the headline. On those five tickets the totals were baseline 1 + 12,
expert conventions 0 + 1, tailored setup 0 + 0. The AI-written conventions were not run on them.

I sell this setup, fitted to a team's own suite. This repo is how it's measured. Start with a repo
check:

[damodoesthings.com/ai-test-setup](https://damodoesthings.com/ai-test-setup)

## The claim

An AI coding tool writes tests a team would merge when the team's conventions are written down
where the tool reads them every time, and on this suite the tool could write those conventions
itself from the existing tests, as well as an expert did. Without them, it writes tests that work
but that a reviewer sends back. A workflow that applies and checks the conventions made it faster
and scored one or two minor findings cleaner, a gap too small to call on three tickets.

## What was compared

All arms start from the same commit: Saleor Dashboard as Saleor ships it, which already has its
own `CLAUDE.md`, skills and Claude hooks.

- **`baseline`**: Playwright's test agents (Planner, Generator, Healer) from
  `npx playwright init-agents --loop=claude`, set up as Playwright's documentation describes.
- **`ai-conventions`**: the same agents, plus an `AGENTS.md` section written by a fresh Claude
  Code session that saw only Saleor's repository and one prompt: "Read this repository's e2e
  suite and write the conventions a reviewer on this team would enforce for new end-to-end tests,
  as a section to add to AGENTS.md." Committed unedited
  ([`evidence/ai-conventions/`](evidence/ai-conventions/)).
- **`baseline-plus-rules`**: the same agents, plus the text of [CONVENTIONS.md](CONVENTIONS.md)
  appended to `AGENTS.md` (which Saleor's `CLAUDE.md` links to). Nothing else.
- **`with-setup`**: a rules section in `CLAUDE.md` and two skills: `write-test` (ticket in, test
  out, on the suite's own scenarios, actors, page objects and fixture) and `review-test` (checks a
  test against the checklist before it is handed back). They were written from
  [CONVENTIONS.md](CONVENTIONS.md), the rules a reviewer on this team would enforce, each traced to
  a file in the suite.

Same model (Claude Opus via Claude Code, on a subscription), same harness, a fresh session per
ticket, no human edits to anything generated.

## How it was scored

[SCORING.md](SCORING.md) has the whole method, committed before any test was generated:

- a blind review of each change against [CHECKLIST.md](CHECKLIST.md) (10 blocker checks, 13 minor);
- three runs in a row with the suite's own runner;
- a pre-registered change to the dashboard that breaks each ticket's feature while the screen still
  responds ([`demo/breaks/`](demo/breaks/)). A test that still passes is a blocker;
- the pass rule: zero blockers, at most half the other arm's findings, and every spec green three
  runs in a row.

The tickets are in [`tickets/`](tickets/). Each ticket's tests are on their own branch. Held-out
tickets: `baseline-r3-t06`..`t08`, `ai-conventions-r4-t06`..`t08`, `baseline-plus-rules-r3-t06`..`t08`,
`with-setup-r3-t06`..`t08`.
Version 1: `baseline-t01`..`t05`, `baseline-plus-rules-r3-t01`..`t05`, `with-setup-r2-t01`..`t05`.

## Reproduce it

You need Node 24, pnpm 11, Docker, and Claude Code signed in to a subscription. In a fresh clone:

```bash
pnpm install
pnpm e2e                 # brings up Saleor in Docker and runs the existing suite (first run ~5 min)
demo/reproduce.sh        # the held-out run: three arms, tickets 06-08, prints the tables (~1-2 h)
demo/reproduce.sh v1.2   # then the fourth arm: AI-written conventions, tickets 06-08 (~45 min)
```

`demo/reproduce.sh v1` repeats version 1 instead. Either overwrites the per-ticket branches in your clone and adds its evidence to
`evidence/`. AI output varies from run to run, so expect the same picture rather than the same
numbers.

## What this is not

Eight tickets on one suite (three held out), one generation per ticket per arm, scored by an AI
reviewer. That is a demonstration, not a study. Gaps of one or two minor findings between the
convention-bearing arms are well within what a second generation could change. It shows what the
difference looks like and makes the method open to checking; it does not measure how large the
difference is in general. The reviewer's full verdicts are published so you can disagree with
them.

The checklist and the expert conventions come from the same reading of the suite, so the arm
given those conventions was scored against rules it was handed; the baseline and ai-conventions
arms were not.

The tailored setup was written from the same [CONVENTIONS.md](CONVENTIONS.md), and its
`review-test` skill checks against the same [CHECKLIST.md](CHECKLIST.md) the reviewer scores with,
so it too was scored against rules it carries. It was revised once, after failing round 1 on
tickets 01 to 05, then frozen before tickets 06 to 08 were run. All eight tickets were written by
the author.

## Credit

The application and its end-to-end suite are [Saleor Dashboard](https://github.com/saleor/saleor-dashboard)
by Saleor Commerce, used under the BSD-3-Clause licence (see [LICENSE](LICENSE)). The suite's
conventions, which this demo only writes down, are theirs. Saleor's own README is kept as
[README.saleor.md](README.saleor.md). This repository is not affiliated with or endorsed by Saleor.
