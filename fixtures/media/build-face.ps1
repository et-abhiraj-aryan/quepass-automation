# Rebuilds the LOCKED fake-camera video from the preserved source clip.
# Framing is frozen: portrait 540x960, face scaled to ~75% height with margin so
# the QuePass face detector accepts it. Do NOT change these values without
# re-verifying the auth scenario passes.
#
# Requires ffmpeg on PATH (winget install Gyan.FFmpeg).
# Usage:  pwsh fixtures/media/build-face.ps1   (run from the project root)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $here 'source-face.mp4'
$out = Join-Path $here 'face.y4m'

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  throw "ffmpeg not found on PATH. Install with: winget install Gyan.FFmpeg"
}

ffmpeg -y -i $src `
  -vf "scale=-2:720,pad=540:960:(ow-iw)/2:(oh-ih)/2:black" `
  -pix_fmt yuv420p -r 30 -an $out

Write-Host "Rebuilt $out"
