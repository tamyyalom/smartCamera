#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$ROOT/.bin:$PATH"

if command -v applesimutils >/dev/null 2>&1; then
  exit 0
fi

echo "Missing applesimutils. Run: npm run detox:install:ios"
exit 1
