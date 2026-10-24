# Handoff

## State (2026-10-24)

Version 1 is complete. The setup passed the pass rule in round 2. See README.md and RESULTS.md.

- `main`: Saleor Dashboard at `77dc49b`, plus the demo (README, CONVENTIONS, CHECKLIST, SCORING,
  RESULTS, tickets, `demo/` scripts and breaks, `evidence/`).
- `baseline`: Playwright test agents. `baseline-t01`..`t05`: one ticket each, scored.
- `with-setup`: rules (in `AGENTS.md`, which `CLAUDE.md` links to) and the skills, now at round 2.
  `with-setup-r2-t01`..`t05`: round-2 tickets, scored. `with-setup-t01`..`t05`: round 1, kept.
- GitHub: damosull/ai-ready-test-suite-demo, private. **GitHub Actions is disabled** on the repo.
  Saleor's own workflows came with the import and ran on the first pushes (see below). Leave it
  disabled: nothing here needs CI.

## Left

- Results graphic: placeholder comment near the top of README.md.
- Damien to decide when to make the repo public. Before that, have someone read RESULTS.md and the
  disclosure in SCORING.md.
- Optional: combine the with-setup tickets onto one branch (an ordinary merge, two conflicts in
  page objects). Not done, so that nothing scored was edited by hand.

## Open problems

- The reviewer only sees the `e2e/` part of a change. That was enough in round 2, but a future
  run should either give it the whole diff or keep the rule that test tickets never touch `src/`.
- The `deploy-staging` environment was auto-created on the GitHub repo by the accidental workflow
  run. It holds no secrets; it can be deleted in Settings → Environments.
- Running the demo needs the local stack (`pnpm e2e`). Sessions and scoring share one database, so
  they must run one at a time.

## GitHub Actions incident (2026-10-24, 08:23-08:35 UTC)

Pushing the imported repository triggered Saleor's own workflows three times: QA, CodeQL Advanced,
Knip, and Deploy Dashboard to main staging. Actions were then disabled on the repo.

- 12 runs, 33 jobs, about 86 runner minutes, about 103 billable minutes with per-job rounding
  (Linux, 1x). Worked out from job start and end times; GitHub's billing-usage API needs a token
  scope this machine's `gh` does not have.
- The staging deploy job ran three times and failed at "Configure AWS Credentials". The role ARN
  was empty (`arn:aws:iam:::role/`) because the repo has no secrets or variables, so AWS refused
  the request. The build job before it did build the dashboard and store it as an Actions
  artifact on the repo; nothing left GitHub. The `deploy-staging` environment has 0
  secrets and 0 variables.
- The Slack notification step failed with no webhook configured. Nothing was sent.
