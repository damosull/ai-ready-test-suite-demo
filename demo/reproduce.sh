#!/usr/bin/env bash
# Runs the whole comparison: generates all five tickets on both branches, reviews each one
# blind, runs the three-run and broken-feature checks, and prints the results tables.
#
#   demo/reproduce.sh [round]
#
# Needs: Node 24, pnpm 11, Docker running, Claude Code signed in to a subscription, and a
# clean checkout of main with `pnpm install` done and the e2e stack able to start (`pnpm e2e`).
# Takes about two hours. Output is committed to new branches and to evidence/ on main.
set -euo pipefail

round="${1:-1}"
repo="$(cd "$(dirname "$0")/.." && pwd)"
tools="$(mktemp -d)"
cp "$repo"/demo/{generate.sh,review.sh,run-checks.sh,review-schema.json} "$tools/"
cp "$repo/demo/prompts/review.md" "$tools/review.md"
cd "$repo"
git checkout -q main

for ticket in 01 02 03 04 05; do
  for branch in baseline with-setup; do
    REPO="$repo" "$tools/generate.sh" "$branch" "$ticket" "$round"
  done
done

for ticket in 01 02 03 04 05; do
  for branch in baseline with-setup; do
    REPO="$repo" "$tools/review.sh" "$branch" "$ticket" "$round"
    REPO="$repo" "$tools/run-checks.sh" "$branch" "$ticket" "$round"
  done
done

python3 demo/tally.py "$round"
