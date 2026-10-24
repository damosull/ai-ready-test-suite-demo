#!/usr/bin/env bash
# Supplementary stability run (SCORING.md, "Supplementary: stability"): each held-out spec,
# from its scored branch, unedited, run once with --repeat-each=20 by the suite's own runner.
#
#   demo/stability.sh
#
# The spec for each arm and ticket is the one its scored checks ran, read from the "specs:" line
# of evidence/runs/round-<round>/<arm>-<ticket>.txt. One stack, one arm at a time. A JSON
# reporter is added next to the line reporter so repetitions can be counted; nothing else changes.
# Results go to evidence/runs/stability/ on main, committed after each spec. A spec whose result
# is already there is skipped, so a stopped run can be started again and carries on.
#
# Run a copy from outside the repository with REPO set; it checks out branches.
set -o pipefail

repo="${REPO:?set REPO to the repository root}"
here="$(cd "$(dirname "$0")" && pwd)"
cd "$repo"
arms=(baseline ai-conventions baseline-plus-rules with-setup)
tickets=(06 07 08)
out="evidence/runs/stability"

round_of() { if [[ "$1" == "ai-conventions" ]]; then echo 4; else echo 3; fi; }

for arm in "${arms[@]}"; do
  for ticket in "${tickets[@]}"; do
    name="$arm-$ticket"
    if [[ -f "$out/$name.txt" ]]; then echo "$(date '+%F %T') $name: already done, skipped"; continue; fi
    if [[ -n "$(git status --porcelain -- . ':!evidence')" ]]; then echo "working tree is not clean" >&2; exit 1; fi

    round="$(round_of "$arm")"
    checks="$(git show "main:evidence/runs/round-$round/$name.txt")"
    branch="$(sed -n 's/^branch: //p' <<< "$checks")"
    spec="$(sed -n 's/^specs: //p' <<< "$checks")"
    work="$(mktemp -d)"

    echo "$(date '+%F %T') $name: start ($branch, $spec)"
    git checkout -q "$branch"
    start=$(date +%s)
    for attempt in 1 2; do
      PLAYWRIGHT_JSON_OUTPUT_NAME="$work/report.json" \
        pnpm e2e "$spec" --workers=1 --repeat-each=20 --reporter=line,json > "$work/run.log" 2>&1
      status=$?
      # An infrastructure failure (no report, or no test of the spec ran) is run again once.
      if [[ -s "$work/report.json" ]] && grep -q "\"file\": \"${spec#tests/}\"" "$work/report.json"; then break; fi
      echo "$(date '+%F %T') $name: attempt $attempt produced no test results (exit $status), see log" | tee -a "$work/infra.txt"
      cp "$work/run.log" "$work/run-attempt-$attempt.log"
    done
    minutes=$(( ($(date +%s) - start + 30) / 60 ))
    git checkout -q main

    mkdir -p "$out"
    {
      echo "branch: $branch"
      echo "spec: $spec"
      echo "command: pnpm e2e $spec --workers=1 --repeat-each=20 --reporter=line,json"
      echo "runner exit: $status"
      echo "minutes: $minutes"
      [[ -f "$work/infra.txt" ]] && cat "$work/infra.txt"
      python3 "$here/stability-count.py" "$work/report.json" "$spec"
    } > "$out/$name.txt"
    cp "$work/report.json" "$out/$name.json" 2>/dev/null || true
    sed 's/\x1b\[[0-9;]*[A-Za-z]//g' "$work/run.log" > "$out/$name.log"
    for f in "$work"/run-attempt-*.log; do [[ -e "$f" ]] && sed 's/\x1b\[[0-9;]*[A-Za-z]//g' "$f" > "$out/$name.$(basename "$f")"; done
    rm -rf "$work"
    git add "$out" && git commit -q --no-verify -m "evidence: stability $name"
    echo "$(date '+%F %T') $name: $(grep '^spec passes' "$out/$name.txt")"
  done
done
echo "$(date '+%F %T') done"
python3 "$here/tally-stability.py"
