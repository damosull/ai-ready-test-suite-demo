#!/usr/bin/env bash
# Blind review of one ticket's change, by a fresh Claude Code session that has seen neither
# setup.
#
#   demo/review.sh <branch> <01..05> [round]
#
# Run a copy from outside the repository with REPO set (it checks out branches to type-check):
#   cp demo/review.sh demo/prompts/review.md demo/review-schema.json /tmp/x/ && REPO=$PWD /tmp/x/review.sh baseline 01
#
# The reviewer works in a clean worktree of `main` with the demo's own scoring files removed,
# can only read files (no shell, no MCP), and is given the ticket, CHECKLIST.md, CONVENTIONS.md,
# the diff under a random submission id, and the type-check output.
set -euo pipefail

branch="$1"
ticket="$2"
round="${3:-1}"
here="$(cd "$(dirname "$0")" && pwd)"
repo="${REPO:?set REPO to the repository root}"
cd "$repo"

if [[ "$round" == "1" ]]; then out="$branch-t$ticket"; else out="$branch-r$round-t$ticket"; fi

ws="${REVIEW_WS:-${TMPDIR:-/tmp}/ai-ready-review-ws}"
if [[ ! -d "$ws" ]]; then
  git worktree add -q --detach "$ws" main
  rm -rf "$ws/SCORING.md" "$ws/RESULTS.md" "$ws/README.md" "$ws/HANDOFF.md" "$ws/demo" "$ws/evidence"
fi

id="$(openssl rand -hex 4)"
inputs="$ws/.review/$id"
mkdir -p "$inputs"
git diff "$branch" "$out" -- e2e/ > "$inputs/change.diff"

# Type check with the change applied, in the main checkout (which has node_modules).
if [[ -n "$(git status --porcelain)" ]]; then echo "working tree is not clean" >&2; exit 1; fi
git checkout -q "$out"
typecheck="$(pnpm run --silent check-types:e2e 2>&1 && echo "exit 0: no errors" || echo "exit non-zero: the above are type errors")"
git checkout -q main
printf '%s\n' "$typecheck" > "$inputs/typecheck.txt"

prompt="$(sed -e "s#{{TICKET}}#tickets/$ticket.md#" \
  -e "s#{{DIFF}}#.review/$id/change.diff#" \
  -e "s#{{ID}}#$id#" \
  -e "s#{{TYPECHECK}}#.review/$id/typecheck.txt#" "$here/review.md")"

mkdir -p "$repo/evidence/reviews/round-$round"
result="$repo/evidence/reviews/round-$round/$id.json"

(cd "$ws" && claude -p \
  --model "${DEMO_MODEL:-opus}" \
  --setting-sources project,local \
  --settings "{\"claudeMdExcludes\":[\"$HOME/.claude/CLAUDE.md\"],\"autoMemoryEnabled\":false,\"disableAllHooks\":true}" \
  --strict-mcp-config --mcp-config '{"mcpServers":{}}' \
  --no-chrome \
  --tools "Read,Grep,Glob" \
  --permission-prompts none \
  --output-format json \
  --json-schema "$(cat "$here/review-schema.json")" \
  "$prompt") > "$result"

# The key from submission id to branch is kept apart from the verdicts.
printf '%s\t%s\t%s\t%s\n' "$id" "$branch" "$ticket" "$round" >> "$repo/evidence/reviews/key.tsv"
cp "$inputs/change.diff" "$repo/evidence/reviews/round-$round/$id.diff"
cp "$inputs/typecheck.txt" "$repo/evidence/reviews/round-$round/$id.typecheck.txt"
echo "$out reviewed as $id"
