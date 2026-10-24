# Handoff

## State (2026-10-24, after v1.2)

v1.2 is complete and written up. Held-out tickets 06-08, four arms, blockers + minors: baseline
1 + 9, ai-conventions 0 + 1, baseline-plus-rules 0 + 2, with-setup 0 + 0. All green 3/3, all
caught the breaks. Conventions the AI wrote for itself (one fixed prompt, unedited) matched the
expert conventions. with-setup passes the pass rule against every arm, by one or two minor
findings against the convention-bearing arms. See README.md and RESULTS.md (v1.2 heading).

Nothing is published. The repo is private; Damien decides when it goes public.

## How to resume (start a fresh session with "Read HANDOFF.md and carry on")

- Repo: `~/Projects/ai-ready-test-suite-demo`, GitHub `damosull/ai-ready-test-suite-demo` (private).
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
- Rounds used so far: 1 and 2 (v1), 3 (v1.1), 4 (v1.2). A new experiment uses round 5 and a new
  SCORING.md addendum committed before generation.
- Rule for any new version: pre-register in SCORING.md and commit before generating; one
  generation per ticket per arm; never change tickets, checklist, breaks or a frozen arm to move a
  number.

## Next (agreed with Damien)

1. **Parallel stacks before the next big run.** Two or three isolated e2e stacks: git worktrees,
   port and compose-project offsets in `e2e/config.ts` (via an env var, defaulting to today's
   values), Docker Desktop memory raised from 7.65 GB (one stack uses about 2.5 GB; fleet-pilot's
   Supabase stack also takes about 3.4 GB when running). Prove a parallel run gives the same
   results as a serial one before relying on it. Then add the method, generically, to
   qa-setup-kit.
2. Results graphic: placeholder comment near the top of README.md (now four arms).
3. Offer-page link: `<!-- LINK: offer page, added when it exists -->` at the end of the README
   Results section.
4. Before publishing: someone other than the author reads RESULTS.md and the disclosures in
   SCORING.md.

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

## GitHub Actions incident (2026-10-24, 08:23-08:35 UTC)

Pushing the imported repository triggered Saleor's own workflows three times: QA, CodeQL Advanced,
Knip, and Deploy Dashboard to main staging. Actions were then disabled on the repo.

- 12 runs, 33 jobs, about 86 runner minutes, about 103 billable minutes with per-job rounding
  (Linux, 1x). Worked out from job start and end times; GitHub's billing-usage API needs a token
  scope this machine's `gh` does not have.
- The staging deploy job ran three times and failed at "Configure AWS Credentials". The role ARN
  was empty (`arn:aws:iam:::role/`) because the repo has no secrets or variables, so AWS refused
  the request. The build job before it built the dashboard and stored it as an Actions artifact on
  the repo (since deleted); nothing left GitHub.
- The Slack notification step failed with no webhook configured. Nothing was sent.
