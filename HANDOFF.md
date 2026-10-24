# Handoff

## State (2026-10-24, after v1.1)

v1.1 is complete and written up. Headline (held-out tickets 06-08, three arms): baseline 1
blocker + 9 minors, baseline-plus-rules 0 + 2, with-setup 0 + 0. with-setup passes the pass rule
against both arms, but against baseline-plus-rules it is close to a tie. See README.md and
RESULTS.md.

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
  - Arms: `baseline` (Playwright agents, `model: inherit`), `baseline-plus-rules` (plus
    CONVENTIONS.md in `AGENTS.md`), `with-setup` (rules + skills; **frozen** at `ba60244`, tag
    `with-setup-frozen-v1`).
  - Generated tests, one branch per ticket: `<arm>-t0N` (round 1), `with-setup-r2-t0N` (round 2),
    `<arm>-r3-t0N` (round 3, v1.1). Never edit these; they are what was scored.
- Scripts (always run copies from outside the repo, with `REPO` set, because they switch branches):
  `demo/generate.sh <arm> <ticket> <round>`, `demo/review.sh`, `demo/run-checks.sh`, then
  `demo/tally.py <round>` (v1) or `demo/tally3.py` (v1.1). `demo/reproduce.sh` wraps them.
  Sessions and scoring share one database and one checkout: strictly one at a time.
- Rounds used so far: 1 and 2 (v1), 3 (v1.1). A new experiment uses round 4 and a new SCORING.md
  addendum committed before generation.
- Rule for any new version: pre-register in SCORING.md and commit before generating; one
  generation per ticket per arm; never change tickets, checklist, breaks or a frozen arm to move a
  number.

## Next (agreed with Damien)

1. **Parallel stacks before the next big run.** Two or three isolated e2e stacks: git worktrees,
   port and compose-project offsets in `e2e/config.ts` (via an env var, defaulting to today's
   values), Docker Desktop memory raised from 7.65 GB (one stack uses about 2.5 GB). Prove a
   parallel run gives the same results as a serial one before relying on it. Then add the method,
   generically, to qa-setup-kit.
2. **Cap MCP tool calls** (`MCP_TOOL_TIMEOUT`, a few minutes) for agent-based arms: two v1.1
   sessions each lost 30 minutes to a Playwright MCP `test_run` call that never returned.
3. Results graphic: placeholder comment near the top of README.md.
4. Before publishing: someone other than the author reads RESULTS.md and both disclosures in
   SCORING.md.

## Open problems

- Close call between baseline-plus-rules and with-setup rests on two minor findings in one
  generation per ticket. More tickets or repeated generations would be needed to say more.
- Long runs are tied to the session that started them. Start them detached (`nohup ... &` with a
  log) so a new session can pick them up.

## Done in v1.1

- Deleted Saleor's `.github/workflows` from `main`, the three Actions build artifacts, and the empty
  `deploy-staging` environment.
- Pre-registered and ran the third arm, the held-out tickets and the whole-diff review.

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
