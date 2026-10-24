#!/usr/bin/env bash
# Runs the whole comparison: generates all five tickets on both branches, reviews each one
# blind, runs the three-run and broken-feature checks, and prints the results tables.
#
#   demo/reproduce.sh            # v1.1: three arms on held-out tickets 06-08 (round 3)
#   demo/reproduce.sh v1.2       # v1.2: adds the ai-conventions arm on 06-08 (round 4); run v1.1 first
#   demo/reproduce.sh v1 [round] # version 1: two arms on tickets 01-05
#
# Needs: Node 24, pnpm 11, Docker running, Claude Code signed in to a subscription, and a
# clean checkout of main with `pnpm install` done and the e2e stack able to start (`pnpm e2e`).
# Takes one to two hours. Output is committed to new branches and to evidence/ on main.
set -euo pipefail

if [[ "${1:-}" == "v1" ]]; then
  round="${2:-1}"; arms=(baseline with-setup); tickets=(01 02 03 04 05); tally=(demo/tally.py "$round")
elif [[ "${1:-}" == "v1.2" ]]; then
  round=4; arms=(ai-conventions); tickets=(06 07 08); tally=(demo/tally4.py)
else
  round=3; arms=(baseline baseline-plus-rules with-setup); tickets=(06 07 08); tally=(demo/tally3.py)
fi
repo="${REPO:-$(cd "$(dirname "$0")/.." && pwd)}"
tools="$(mktemp -d)"
cp "$repo"/demo/{generate.sh,review.sh,run-checks.sh,write-conventions.sh,review-schema.json} "$tools/"
cp "$repo/demo/prompts/review.md" "$tools/review.md"
cd "$repo"
git checkout -q main

if [[ "$round" == "4" ]] && ! git rev-parse -q --verify ai-conventions > /dev/null; then
  echo "$(date '+%F %T') writing the ai-conventions section"
  REPO="$repo" "$tools/write-conventions.sh"
fi

for ticket in "${tickets[@]}"; do
  for branch in "${arms[@]}"; do
    echo "$(date '+%F %T') generate start: $branch $ticket"
    REPO="$repo" "$tools/generate.sh" "$branch" "$ticket" "$round"
    echo "$(date '+%F %T') generate end: $branch $ticket"
  done
done

for ticket in "${tickets[@]}"; do
  for branch in "${arms[@]}"; do
    echo "$(date '+%F %T') review and checks: $branch $ticket"
    REPO="$repo" "$tools/review.sh" "$branch" "$ticket" "$round"
    REPO="$repo" "$tools/run-checks.sh" "$branch" "$ticket" "$round"
  done
done

echo "$(date '+%F %T') done"
python3 "${tally[@]}"
