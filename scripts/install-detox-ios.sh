#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN_DIR="$ROOT/.bin"
LOCAL_BIN="$BIN_DIR/applesimutils"
VERSION="0.9.12"

export PATH="$BIN_DIR:$PATH"

if [ -x "$LOCAL_BIN" ]; then
  echo "applesimutils already installed: $($LOCAL_BIN --version)"
  exit 0
fi

if command -v applesimutils >/dev/null 2>&1; then
  echo "applesimutils already installed: $(applesimutils --version)"
  exit 0
fi

install_with_brew() {
  if ! command -v brew >/dev/null 2>&1; then
    return 1
  fi

  brew install wix/brew/applesimutils
  command -v applesimutils >/dev/null 2>&1
}

install_from_github() {
  local arch bottle url tmpdir extracted

  arch="$(uname -m)"
  if [ "$arch" = "arm64" ]; then
    bottle="applesimutils-${VERSION}.arm64_big_sur.bottle.tar.gz"
  else
    bottle="applesimutils-${VERSION}.big_sur.bottle.tar.gz"
  fi

  url="https://github.com/wix/AppleSimulatorUtils/releases/download/${VERSION}/${bottle}"
  tmpdir="$(mktemp -d)"

  echo "Downloading applesimutils ${VERSION} (${arch})..."
  curl -fsSL -o "$tmpdir/bottle.tar.gz" "$url"
  tar -xzf "$tmpdir/bottle.tar.gz" -C "$tmpdir"

  extracted="$(find "$tmpdir" -type f -name applesimutils | head -n 1)"
  if [ -z "$extracted" ]; then
    rm -rf "$tmpdir"
    echo "Could not find applesimutils binary in release archive."
    return 1
  fi

  mkdir -p "$BIN_DIR"
  cp "$extracted" "$LOCAL_BIN"
  chmod +x "$LOCAL_BIN"
  rm -rf "$tmpdir"
}

if install_with_brew; then
  echo "Installed via Homebrew: $(applesimutils --version)"
  exit 0
fi

echo "Homebrew not found — installing applesimutils to ${LOCAL_BIN}"
install_from_github
echo "Installed: $($LOCAL_BIN --version)"
echo "Added ${BIN_DIR} to PATH for Detox scripts."
