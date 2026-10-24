#!/usr/bin/env bash
# Runs the whole comparison: generates all five tickets on both branches, reviews each one
# blind, runs the three-run and broken-feature checks, and prints the results tables.
#
#   demo/reproduce.sh            # v1.1 headline: three arms on held-out tickets 06-08 (round 3)
#   demo/reproduce.sh v1 [round] # version 1: two arms on tickets 01-05
#
# Needs: Node 24, pnpm 11, Docker running, Claude Code signed in to a subscription, and a
# clean checkout of main with `pnpm install` done and the e2e stack able to start (`pnpm e2e`).
# Takes one to two hours. Output is committed to new branches and to evidence/ on main.
set -euo pipefail

if [[ "${1:-}" == "v1" ]]; then
  round="${2:-1}"; arms=(baseline with-setup); tickets=(01 02 03 04 05); tally=(demo/tally.py "$round")
else
  round=3; arms=(baseline baseline-plus-rules with-setup); tickets=(06 07 08); tally=(demo/tally3.py)
fi
repo="$(cd "$(dirname "$0")/.." && pwd)"
tools="$(mktemp -d)"
cp "$repo"/demo/{generate.sh,review.sh,run-checks.sh,review-schema.json} "$tools/"
cp "$repo/demo/prompts/review.md" "$tools/review.md"
cd "$repo"
git checkout -q main

for ticket in "${tickets[@]}"; do
  for branch in "${arms[@]}"; do
    REPO="$repo" "$tools/generate.sh" "$branch" "$ticket" "$round"
  done
done

for ticket in "${tickets[@]}"; do
  for branch in "${arms[@]}"; do
    REPO="$repo" "$tools/review.sh" "$branch" "$ticket" "$round"
    REPO="$repo" "$tools/run-checks.sh" "$branch" "$ticket" "$round"
  done
done

python3 "${tally[@]}"
