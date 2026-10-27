# Handoff

## State (2026-10-24, after v1.2)

v1.2 is complete and written up. Held-out tickets 06-08, four arms, blockers + minors: baseline
1 + 9, ai-conventions 0 + 1, baseline-plus-rules 0 + 2, with-setup 0 + 0. All green 3/3, all
caught the breaks. Conventions the AI wrote for itself (one fixed prompt, unedited) matched the
expert conventions. with-setup passes the pass rule against every arm, by one or two minor
findings against the convention-bearing arms. See README.md and RESULTS.md (v1.2 heading).

Supplementary stability (2026-10-24, pre-registered in SCORING.md, `bb74f56`): the 12 held-out
specs, 20 repetitions each, `demo/stability.sh`: 240/240, every arm 60/60. In RESULTS.md (v1.2
section) and one line in the README. No verdict changed.

qa-setup-kit's generic `repo-check/` runner was proven on this repo, ticket 07: free 1 + 4,
AI-conventions 0 + 1, setup 0 + 0, all green, all caught, stability 20/20 each. Evidence and the
comparison with v1.2 are in `evidence/kit-proof/`; branches `repo-check/*`.

`SAMPLE-REPORT.md` (2026-10-25, approved by Damien, merged to `main`): the sample repo check a buyer
sees, on Saleor. Saleor's real review history (`e2e/` and the earlier `playwright/`, read-only via
`gh`; run folders `~/checks/saleor-dashboard/history-4-e2e/` and `history-5-playwright/`, outside
this repo), the questions for the reviewer, and tickets 06-08 replayed through qa-setup-kit's
`repo-check/report.py`. Every figure is from a run file or RESULTS.md. To regenerate it, run
qa-setup-kit's `repo-check/examples/saleor-sample/rebuild.sh`, which holds every input (see its
README); don't hand-edit numbers.

Outside read before publishing (2026-10-25, fixes approved by Damien, on `main`): README
disclosures (the setup carries CONVENTIONS.md and CHECKLIST.md too; reviewer is the same model;
setup build time not counted; MCP cap only on ai-conventions), the pass rule spelled out, a
version map, the offer line above the link placeholder; RESULTS.md per-ticket round-3 times for
baseline-plus-rules (06 5.8, 07 10.3, 08 39.5 min, transcript wall-clock) and the held-out agent
range corrected to 6 to 40; notes under SCORING.md's title and v1.1 "no round 4"; SAMPLE-REPORT.md
regenerated with qa-setup-kit's new stability cell ("60/60 (20 runs on each of 3 tickets)").

Second outside read (2026-10-27, branch `outside-read-2`): an independent read of README.md,
RESULTS.md and SCORING.md. Fixes applied: the README says the agent arms' changes carry the
Planner's `specs/` plan files, so from round 3 the reviewer could tell the tailored setup from the
agent arms; the conventions were drawn by the author from the suite's tests, not reviewed by Saleor,
and the author also wrote CONVENTIONS.md and CHECKLIST.md; the v1 totals carry the ticket 01
disclosure and the review-scope difference behind "expert conventions 0 + 1"; the results image's
alt text reads "every arm passed 60 of 60 (240 in all)"; RESULTS.md's PASS lines against
`ai-conventions` and `baseline-plus-rules` give the margin (one or two minor findings, too small to
call). This closes the earlier "outside read before publishing" item.

The repo is public (2026-10-25) and linked from https://damodoesthings.com/ai-test-setup (the README's
"Start with a repo check:" links there).

## How to resume (start a fresh session with "Read HANDOFF.md and carry on")

- Repo: `~/Projects/ai-ready-test-suite-demo`, GitHub `damosull/ai-ready-test-suite-demo` (public).
  GitHub Actions is **disabled** on the repo and Saleor's workflows are deleted from `main`. Keep
  it that way: nothing here needs CI.
- Toolchain: Node 24 via nvm (`source ~/.nvm/nvm.sh && nvm use 24`), pnpm 11 via corepack, Docker
  Desktop. `pnpm e2e` brings the stack up (Saleor 3.23 at :8200, dashboard at :9200). `pnpm e2e:down`
  stops it. The stack was left stopped.
- Branches:
  - `main`: Saleor Dashboard at `77dc49b` plus the demo (docs, `tickets/`, `demo/`, `evidence/`).
  - Arms: `baseline` (Playwright agents, `model: inherit`), `ai-conventions` (plus the
    AGENTS.md section written by `demo/write-conventions.sh`), `baseline-plus-rules` (plus
    CONVENTIONS.md in `AGENTS.md`), `with-setup` (rules + skills; **frozen** at `ba60244`, tag
    `with-setup-frozen-v1`).
  - Generated tests, one branch per ticket: `<arm>-t0N` (round 1), `with-setup-r2-t0N` (round 2),
    `<arm>-r3-t0N` (round 3, v1.1), `ai-conventions-r4-t0N` (round 4, v1.2). Never edit these; they
    are what was scored.
- Scripts (always run copies from outside the repo, with `REPO` set, because they switch branches):
  `demo/generate.sh <arm> <ticket> <round>`, `demo/review.sh`, `demo/run-checks.sh`, then
  `demo/tally.py <round>` (v1), `demo/tally3.py` (v1.1) or `demo/tally4.py` (v1.2).
  `demo/reproduce.sh [v1|v1.2]` wraps them. Long runs: copy it outside the repo and start it
  detached, as v1.2 was:
  `cd ~/.cache/ai-ready-demo && nohup bash -c 'source ~/.nvm/nvm.sh && nvm use 24 && REPO=$HOME/Projects/ai-ready-test-suite-demo ./reproduce.sh v1.2' > v1.2.log 2>&1 &`.
  Do not edit the checkout while a run is going: it switches branches and needs a clean tree.
  Sessions and scoring share one database and one checkout: strictly one at a time.
- Stability: `demo/stability.sh` (run a copy from outside the repo; it skips specs already in
  `evidence/runs/stability/` so a stopped run resumes). Last run log: `~/.cache/ai-ready-demo/stability.log`.
- Rounds used so far: 1 and 2 (v1), 3 (v1.1), 4 (v1.2). A new experiment uses round 5 and a new
  SCORING.md addendum committed before generation.
- Rule for any new version: pre-register in SCORING.md and commit before generating; one
  generation per ticket per arm; never change tickets, checklist, breaks or a frozen arm to move a
  number.

## Next (agreed with Damien)

1. **Parallel stacks before the next big run.** Two or three isolated e2e stacks: git worktrees,
   port and compose-project offsets in `e2e/config.ts` (via an env var, defaulting to today's
   values), Docker Desktop memory raised from 7.65 GB (one stack uses about 2.5 GB; other Docker
   stacks on this Mac also need memory). Prove a parallel run gives the same results as a serial
   one before relying on it. Then add the method, generically, to
   qa-setup-kit.
2. Once the repo is public, set demo/graphic/social-card.png as the repo's social preview (GitHub →
   Settings → General → Social preview).

## Open problems

- The three convention-bearing arms are separated by one or two minor findings in one generation
  per ticket. More tickets or repeated generations would be needed to rank them.
- The reviewer scores against CHECKLIST.md and CONVENTIONS.md, which come from the same reading
  of the suite as the baseline-plus-rules arm's rules. Disclosed in SCORING.md and the README.
- The MCP tool cap (`MCP_TOOL_TIMEOUT=300000`) is set only for `ai-conventions` in
  `demo/generate.sh`; the v1.1 arms ran without it. Any rerun of them should add it, pre-registered.

## Done in v1.2

- Pre-registered the fourth arm (`25051f9`, pushed before generation), wrote the conventions once
  in a clean export of the Saleor commit, ran tickets 06-08 as round 4, tallied with
  `demo/tally4.py`. The MCP cap never fired.
