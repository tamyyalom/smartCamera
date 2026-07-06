#!/usr/bin/env bash
set -euo pipefail

if command -v applesimutils >/dev/null 2>&1; then
  echo "applesimutils already installed: $(applesimutils --version)"
  exit 0
fi

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is required for Detox iOS tests."
  echo "Install from https://brew.sh then run: npm run detox:install:ios"
  exit 1
fi

brew tap wix/brew
brew install applesimutils
applesimutils --version
