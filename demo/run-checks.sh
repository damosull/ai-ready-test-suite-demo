#!/usr/bin/env bash
# Stability and broken-feature checks for one ticket's branch.
#
#   demo/run-checks.sh <branch> <01..05> [round]
#
# 1. Runs the ticket's new spec files three times in a row with the suite's own runner.
# 2. Applies the ticket's pre-registered break from demo/breaks/, runs the specs once more
#    (the runner rebuilds the dashboard), and reverts the break.
# Results go to evidence/runs/round-<round>/<branch>-<ticket>.txt on main.
#
# Run a copy from outside the repository with REPO set; it checks out branches.
set -o pipefail

branch="$1"
ticket="$2"
round="${3:-1}"
repo="${REPO:?set REPO to the repository root}"
cd "$repo"

if [[ "$round" == "1" ]]; then out="$branch-t$ticket"; else out="$branch-r$round-t$ticket"; fi
if [[ -n "$(git status --porcelain -- . ':!evidence')" ]]; then echo "working tree is not clean" >&2; exit 1; fi

patch="$(git show "main:demo/breaks/$ticket.patch")"
git checkout -q "$out"
specs=()
while IFS= read -r spec; do
  specs+=("$spec")
done < <(git diff --name-only --diff-filter=AM "$branch" "$out" -- 'e2e/tests/*.spec.ts' | sed 's#^e2e/##')
report="$(mktemp)"
logs="$(mktemp -d)"

{
  echo "branch: $out"
  echo "specs: ${specs[*]:-none}"
} >> "$report"

if [[ ${#specs[@]} -eq 0 ]]; then
  echo "runs: 0/3 (no spec)" >> "$report"
  echo "broken feature caught: no (no spec)" >> "$report"
else
  passed=0
  for run in 1 2 3; do
    if pnpm e2e "${specs[@]}" --workers=1 --reporter=line > "$logs/run-$run.log" 2>&1; then
      echo "run $run: pass" >> "$report"; passed=$((passed + 1))
    else
      echo "run $run: FAIL ($(grep -cE '^\s+[0-9]+\) ' "$logs/run-$run.log") failing)" >> "$report"
    fi
  done
  echo "runs: $passed/3" >> "$report"

  printf '%s\n' "$patch" | git apply
  if pnpm e2e "${specs[@]}" --workers=1 --reporter=line > "$logs/break.log" 2>&1; then
    echo "broken feature caught: no (specs passed with demo/breaks/$ticket.patch applied)" >> "$report"
  else
    echo "broken feature caught: yes (specs failed with demo/breaks/$ticket.patch applied)" >> "$report"
  fi
  printf '%s\n' "$patch" | git apply -R
fi

git checkout -q main
mkdir -p "evidence/runs/round-$round"
cp "$report" "evidence/runs/round-$round/$branch-$ticket.txt"
for f in "$logs"/*.log; do
  [[ -e "$f" ]] && sed 's/\x1b\[[0-9;]*m//g' "$f" > "evidence/runs/round-$round/$branch-$ticket.$(basename "$f")"
done
rm -rf "$report" "$logs"
# Committed straight away: the next script switches branches, and git will not do that over
# modified tracked files.
git add evidence && git commit -q --no-verify -m "evidence: $out (checks)"
cat "evidence/runs/round-$round/$branch-$ticket.txt"
