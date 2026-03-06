#!/bin/bash
# Injects the Sara Gemini API key into the built HTML.
# Usage: SARA_GEMINI_KEY=AIza... ./scripts/inject-sara-key.sh
#
# The key should be set as an environment variable in your deploy environment
# (e.g., AWS SSM Parameter Store, GitHub Actions secret, or shell export).

set -euo pipefail

BUILD_DIR="${BUILD_DIR:-dist}"
KEY="${SARA_GEMINI_KEY:-}"

if [[ -z "$KEY" ]]; then
  echo "[Sara] Warning: SARA_GEMINI_KEY not set. Widget will not initialize."
  exit 0
fi

if [[ -f "$BUILD_DIR/index.html" ]]; then
  # Replace the placeholder with the actual key
  sed -i.bak "s|window.__SARA_GEMINI_KEY__ || \"\"|\"${KEY}\"|g" "$BUILD_DIR/index.html"
  rm -f "$BUILD_DIR/index.html.bak"
  echo "[Sara] API key injected into $BUILD_DIR/index.html"
else
  echo "[Sara] Warning: $BUILD_DIR/index.html not found"
fi
