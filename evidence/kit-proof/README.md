# qa-setup-kit repo-check: proof run on this repository

On 2026-10-24 the generic repo-check runner from qa-setup-kit (`repo-check/`, private) was run end
to end on this repository and one held-out ticket, 07, to show it works and to compare its numbers
with v1.2. It does not change any result in RESULTS.md.

The config is [`inputs/saleor.env`](inputs/saleor.env). Everything the run wrote is in [`run/`](run/):
pre-registration, the conventions session, transcripts, blind reviews (key in `run/reviews/key.tsv`),
checks with every run's log and JSON report, `results.md` and the buyer report `report.md`. The
branches are `repo-check/free`, `repo-check/ai-conventions` and `repo-check/<side>-t07`.

## Ticket 07, the runner against v1.2

| Side                                             | v1.2 (demo scripts)                        | repo-check runner                          |
| ------------------------------------------------ | ------------------------------------------ | ------------------------------------------ |
| Free agents (`baseline`)                         | 1 (B6) + 4 (M1, M4, M8, M13), 3/3, caught  | 1 (B6) + 4 (M1, M8, M10, M13), 3/3, caught |
| Agents + AI-written conventions                  | 0 + 0, 3/3, caught                         | 0 + 1 (M1), 3/3, caught                    |
| Tailored setup (`with-setup`, frozen)            | 0 + 0, 3/3, caught                         | 0 + 0, 3/3, caught                         |
| Stability, 20 repetitions (free, ai-conv, setup) | 20/20, 20/20, 20/20 (supplementary run)    | 20/20, 20/20, 20/20                        |
| Minutes per session                              | 8 to 40, 8.6, 1.5 to 1.7 (v1.1/v1.2 notes) | 8.8, 7.8, 1.9                              |

Every test here is a fresh AI generation, so the same numbers were not expected; the same picture
was. The runner reproduced it: the same blocker (B6, a positional Glide grid selector) on the
free side, the free side's minors in the same places (M1, M8, M13), a near-zero side with
AI-written conventions, zero on the tailored setup, everything green and catching the break.
The differences are one minor finding each way on the free side (M4 there, M10 here) and one
inline-locator M1 on the AI-conventions side, which v1.2 also had on ticket 08.

To check the counting itself, the v1.2 evidence for tickets 06 to 08 was also replayed through the
runner's tally: it gives 1 + 9, 0 + 1 and 0 + 0, the same totals and item ids as `demo/tally4.py`.

## How this run differs from v1.2

- **Base.** The sides start from the Saleor import commit `28bf90d`, not from `main`: in the kit,
  nothing of ours is in the buyer's repository. The free side was built by the runner
  (`init-agents`, `model: inherit`, the demo's adapted seed). Its agents and seed match the
  `baseline` branch apart from Prettier formatting, which the demo's commit hook applied.
- **Conventions written again.** The AI-conventions side has its own, fresh conventions (same fixed
  prompt, clean export, unedited): a 56-line `AGENTS.md` section, against 75 lines in v1.2.
- **MCP cap on the free side too.** The runner caps Playwright MCP calls at 5 minutes on both free
  sides; v1.1's baseline ran without the cap.
- **Ticket path.** Sessions read the ticket from `.repo-check/ticket-07.md`, not `tickets/07.md`.
- **Review prompt.** The same prompt with the app's names and paths filled in from the config, plus
  one change: the reviewer starts each failed item's evidence with `path:line`, for the buyer
  report.
- **One review re-run.** The first review of the free side's change ran with a broken prompt (a
  runner bug left the checklist item list empty: "Judge every checklist item, , once"). It was
  discarded and the review run again with the fixed runner; the counted verdict is `ebc55959`. The
  discarded verdict and the reason are kept in `run/discarded/`. It had failed B6, M1, M8, M10 and
  M13, the same items as the counted review.
