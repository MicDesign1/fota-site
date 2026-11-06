#!/usr/bin/env bash
# Build the GPL source zip for a checkout of claudia-night-drive.
# Usage: make-source-zip.sh <app-dir> <dest-dir> <short-sha>
set -euo pipefail
APP="${1:?app dir}"
DEST="${2:?dest dir}"
SHORT_SHA="${3:?short sha}"
mkdir -p "$DEST/source"
rm -f "$DEST/source"/claudia-night-drive-*.zip
git -C "$APP" archive \
  --format=zip \
  --prefix="claudia-night-drive-${SHORT_SHA}/" \
  -o "$DEST/source/claudia-night-drive-${SHORT_SHA}.zip" \
  HEAD
if [ -f "$DEST/index.html" ]; then
  sed -i -E "s|source/claudia-night-drive-[0-9a-f]+\.zip|source/claudia-night-drive-${SHORT_SHA}.zip|g" "$DEST/index.html"
fi
ls -la "$DEST/source/claudia-night-drive-${SHORT_SHA}.zip"
