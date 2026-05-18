#!/usr/bin/env bash
# Auto-run relevant tests after file edits.
# Wired via .claude/settings.json PostToolUse hook.

set -euo pipefail

CHANGED_FILE="${1:-}"

if [[ "$CHANGED_FILE" == apps/api/* ]]; then
  echo "Running API tests..."
  cd apps/api && python -m pytest tests/ -q
fi

if [[ "$CHANGED_FILE" == apps/web/* ]]; then
  echo "Running web type check..."
  cd apps/web && npm run type-check
fi
