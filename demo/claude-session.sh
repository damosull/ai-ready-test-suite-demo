#!/usr/bin/env bash
# Runs one fresh, headless Claude Code session in the repository and saves its transcript.
#
#   demo/claude-session.sh <log-file> <mcp-config.json> <prompt>
#
# Both branches use exactly these flags, so the only differences between a baseline session
# and a with-setup session are the files on the branch and the prompt.
#
# - Subscription only: the session refuses to start if an API key is in the environment.
# - Isolated from the operator's machine: the user-level CLAUDE.md and auto-memory are not
#   loaded, only the repository's own settings are read, and only the MCP servers named in
#   the config file are available.
# - Scoped tools: file edits inside the repository, the e2e runner, Playwright, read-only git
#   and the configured MCP servers. Anything else that would need approval is refused,
#   because nobody is there to answer a prompt.
set -euo pipefail

if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "ANTHROPIC_API_KEY is set; this demo runs on a Claude Code subscription only" >&2
  exit 1
fi

log="$1"
mcp="$2"
prompt="$3"
repo="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$(dirname "$log")"
cd "$repo"

claude -p \
  --model "${DEMO_MODEL:-opus}" \
  --setting-sources project,local \
  --settings "{\"claudeMdExcludes\":[\"$HOME/.claude/CLAUDE.md\"],\"autoMemoryEnabled\":false}" \
  --strict-mcp-config --mcp-config "$mcp" \
  --no-chrome \
  --permission-mode acceptEdits \
  --permission-prompts none \
  --allowedTools "Read Glob Grep Edit Write Skill Task Agent TodoWrite" \
  --allowedTools "Bash(pnpm e2e:*) Bash(pnpm run check-types:e2e) Bash(pnpm exec playwright:*) Bash(npx playwright:*) Bash(pnpm exec oxlint:*) Bash(pnpm exec prettier:*)" \
  --allowedTools "Bash(git status:*) Bash(git diff:*) Bash(git log:*) Bash(ls:*) Bash(cat:*) Bash(grep:*) Bash(find:*)" \
  --allowedTools "mcp__playwright-test" \
  --output-format stream-json --verbose \
  "$prompt" > "$log"
