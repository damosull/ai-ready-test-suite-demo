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
# - Narrowed tools: file edits, the e2e runner, Playwright, type checks, read-only git and
#   the configured MCP servers. Edits to the runner, its config, package.json and the Claude
#   settings are denied, and anything else that would need approval is refused, because
#   nobody is there to answer a prompt. This is not a sandbox: running the tests runs the
#   code the session wrote. Run it on a disposable machine or container if that matters.
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
  --allowedTools "Bash(pnpm e2e:*) Bash(pnpm run check-types:e2e) Bash(pnpm exec playwright:*) Bash(pnpm exec oxlint:*) Bash(pnpm exec prettier:*)" \
  --allowedTools "Bash(git status:*) Bash(git diff:*) Bash(git log:*) Bash(ls:*) Bash(cat:*) Bash(grep:*)" \
  --allowedTools "mcp__playwright-test" \
  --disallowedTools "Edit(package.json) Write(package.json) Edit(pnpm-*.yaml) Write(pnpm-*.yaml)" \
  --disallowedTools "Edit(e2e/run.ts) Write(e2e/run.ts) Edit(e2e/playwright.config.ts) Write(e2e/playwright.config.ts) Edit(e2e/global-setup.ts) Write(e2e/global-setup.ts)" \
  --disallowedTools "Edit(.claude/settings*.json) Write(.claude/settings*.json) Edit(.mcp.json) Write(.mcp.json)" \
  --output-format stream-json --verbose \
  "$prompt" > "$log"
