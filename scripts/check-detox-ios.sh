#!/usr/bin/env bash
set -euo pipefail

if ! command -v applesimutils >/dev/null 2>&1; then
  echo "Missing applesimutils. Run: npm run detox:install:ios"
  exit 1
fi
