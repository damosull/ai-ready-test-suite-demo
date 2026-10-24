# Does your AI tool write tests your team would merge?

A side-by-side test on a real open-source suite: Playwright's free test agents, the same agents
given the team's written conventions, and an AI setup tailored to the suite, on tickets none of
them was built for, reviewed blind against the team's own conventions.

<!-- RESULTS GRAPHIC: placeholder. Three-arm totals for the held-out tickets go here. -->

## Results

Three held-out tickets (customers, products, discounts) on the Saleor Dashboard's end-to-end
suite. One AI-written test change per ticket per arm, every change reviewed by a fresh AI reviewer
that did not know which arm wrote it.

|                                                  | Playwright agents | Agents + written conventions | Tailored setup |
| ------------------------------------------------ | ----------------- | ---------------------------- | -------------- |
| Blockers (would not merge)                       | 1                 | 0                            | **0**          |
| Minor findings (would be sent back)              | 9                 | 2                            | **0**          |
| Green three runs out of three                    | 3/3               | 3/3                          | 3/3            |
| Failed when the feature was broken, as it should | 3/3               | 3/3                          | 3/3            |
| Minutes per ticket                               | 8 to 40           | 6 to 40                      | 1.5 to 1.7     |

**Most of the gain comes from writing the conventions down.** Putting the team's conventions in
the file the AI reads every time took the free agents from 1 blocker and 9 minor findings to none
and 2. The tailored setup, which adds a write-test workflow and a self-review step on top of the
same conventions, scored 0. That passes the rule set before the run against both arms, but against
the conventions-only arm it is close to a tie: the difference is two minor findings in three
tickets. Its other advantage is speed (the two 40-minute sessions were a tool hang, explained in
[RESULTS.md](RESULTS.md)).

All three arms wrote tests that work. The difference is whether the tests belong to the suite.
Without the conventions, the agents put locators and multi-step actions in the test files instead
of the page objects the team keeps for them, left generated narration in the code, and once picked
an element by position. With them, they mostly did not.

The first version of this demo used five order-management tickets and two arms. Its results,
including the tailored setup's failed first round and what was changed, stay in
[RESULTS.md](RESULTS.md) below the headline. On those five tickets the totals were baseline 1 + 12,
conventions-only 0 + 1, tailored setup 0 + 0.

## The claim

An AI coding tool writes tests a team would merge when the team's conventions are written down
where the tool reads them every time. A workflow that applies and checks those conventions makes
it faster and a little cleaner still. Without the conventions, it writes tests that work but that
a reviewer sends back.

## What was compared

All arms start from the same commit: Saleor Dashboard as Saleor ships it, which already has its
own `CLAUDE.md`, skills and Claude hooks.

- **`baseline`**: Playwright's test agents (Planner, Generator, Healer) from
  `npx playwright init-agents --loop=claude`, set up as Playwright's documentation describes.
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
- the pass rule above.

The tickets are in [`tickets/`](tickets/). Each ticket's tests are on their own branch. Held-out
tickets: `baseline-r3-t06`..`t08`, `baseline-plus-rules-r3-t06`..`t08`, `with-setup-r3-t06`..`t08`.
Version 1: `baseline-t01`..`t05`, `baseline-plus-rules-r3-t01`..`t05`, `with-setup-r2-t01`..`t05`.

## Reproduce it

You need Node 24, pnpm 11, Docker, and Claude Code signed in to a subscription. In a fresh clone:

```bash
pnpm install
pnpm e2e                 # brings up Saleor in Docker and runs the existing suite (first run ~5 min)
demo/reproduce.sh        # the held-out run: three arms, tickets 06-08, prints the tables (~1-2 h)
```

`demo/reproduce.sh v1` repeats version 1 instead. Either overwrites the per-ticket branches in your clone and adds its evidence to
`evidence/`. AI output varies from run to run, so expect the same picture rather than the same
numbers.

## What this is not

Eight tickets on one suite (three held out), one generation per ticket per arm, scored by an AI
reviewer. That is a demonstration, not a study. A gap of two minor findings between the two
rule-bearing arms is well within what a second generation could change. It shows what the difference looks like and makes the method open to
checking; it does not measure how large the difference is in general. The reviewer's full verdicts
are published so you can disagree with them.

## Credit

The application and its end-to-end suite are [Saleor Dashboard](https://github.com/saleor/saleor-dashboard)
by Saleor Commerce, used under the BSD-3-Clause licence (see [LICENSE](LICENSE)). The suite's
conventions, which this demo only writes down, are theirs. Saleor's own README is kept as
[README.saleor.md](README.saleor.md). This repository is not affiliated with or endorsed by Saleor.
