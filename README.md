# Does your AI tool write tests your team would merge?

A side-by-side test on a real open-source suite: Playwright's free test agents against an AI
setup tailored to the suite, on the same five tickets, reviewed blind against the team's own
conventions.

<!-- RESULTS GRAPHIC: placeholder. Side-by-side totals for the two branches go here. -->

## Results

Five tickets on the Saleor Dashboard's end-to-end suite, one AI-written test change per ticket per
side, every change reviewed by a fresh AI reviewer that did not know which side wrote it.

|                                                  | Playwright test agents | Tailored setup |
| ------------------------------------------------ | ---------------------- | -------------- |
| Blockers (would not merge)                       | 1                      | **0**          |
| Minor findings (would be sent back)              | 12                     | **0**          |
| Green three runs out of three                    | 5/5                    | 5/5            |
| Failed when the feature was broken, as it should | 5/5                    | 5/5            |

**The setup passed the rule set before the run:** no blockers, at most half the baseline's
findings, and green 3/3 every time. It passed on its second round. The first round had one
blocker, explained in [RESULTS.md](RESULTS.md) with what was changed. Without ticket 01, whose
baseline output was seen while the setup was being written, the numbers are 1 + 10 against 0 + 0,
and the verdict is the same.

Both sides wrote tests that work. The difference is whether the tests belong to the suite. The
free agents put locators and multi-step actions in the test files instead of the page objects the
team keeps for them, left generated narration in the code, and once located an element by taking
the last of every `div` on the page. The tailored setup extended the existing page objects, used
the suite's data, actors and waits, and read like the tests already there.

Full tables, every finding with its evidence, and the irregularities: [RESULTS.md](RESULTS.md).

## The claim

An AI coding tool given a team's conventions in the place it reads every time, plus a way to check
its own output against them, writes tests the team would merge. Without that, it writes tests that
work but that a reviewer sends back.

## What was compared

Both branches start from the same commit: Saleor Dashboard as Saleor ships it, which already has
its own `CLAUDE.md`, skills and Claude hooks.

- **`baseline`**: Playwright's test agents (Planner, Generator, Healer) from
  `npx playwright init-agents --loop=claude`, set up as Playwright's documentation describes.
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

The tickets are in [`tickets/`](tickets/). Each ticket's tests are on their own branch:
`baseline-t01` to `baseline-t05`, and `with-setup-r2-t01` to `with-setup-r2-t05`.

## Reproduce it

You need Node 24, pnpm 11, Docker, and Claude Code signed in to a subscription. In a fresh clone:

```bash
pnpm install
pnpm e2e                 # brings up Saleor in Docker and runs the existing suite (first run ~5 min)
demo/reproduce.sh        # generates, reviews and checks all ten changes, prints the tables (~2 h)
```

`demo/reproduce.sh` overwrites the per-ticket branches in your clone and adds its evidence to
`evidence/`. AI output varies from run to run, so expect the same picture rather than the same
numbers.

## What this is not

Five tickets on one suite, one generation per ticket per round, scored by an AI reviewer. That is a
demonstration, not a study. It shows what the difference looks like and makes the method open to
checking; it does not measure how large the difference is in general. The reviewer's full verdicts
are published so you can disagree with them.

## Credit

The application and its end-to-end suite are [Saleor Dashboard](https://github.com/saleor/saleor-dashboard)
by Saleor Commerce, used under the BSD-3-Clause licence (see [LICENSE](LICENSE)). The suite's
conventions, which this demo only writes down, are theirs. Saleor's own README is kept as
[README.saleor.md](README.saleor.md). This repository is not affiliated with or endorsed by Saleor.
