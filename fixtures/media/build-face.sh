#!/usr/bin/env bash
# Rebuilds the LOCKED fake-camera video from the preserved source clip.
# Framing is frozen: portrait 540x960, face scaled to ~75% height with margin so
# the QuePass face detector accepts it. Do NOT change these values without
# re-verifying the auth scenario passes.
#
# Requires ffmpeg on PATH.
# Usage:  bash fixtures/media/build-face.sh   (run from anywhere)
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found on PATH. Install it first." >&2
  exit 1
fi

ffmpeg -y -i "$here/source-face.mp4" \
  -vf "scale=-2:720,pad=540:960:(ow-iw)/2:(oh-ih)/2:black" \
  -pix_fmt yuv420p -r 30 -an "$here/face.y4m"

echo "Rebuilt $here/face.y4m"
