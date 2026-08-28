# Fake camera media (LOCKED)

Chromium replaces the real webcam with a video file so face-capture flows run
unattended. This setup is **verified working** against the QuePass authentication
flow — treat the values below as frozen.

## Files

| File                | Purpose                                             | In git |
| ------------------- | --------------------------------------------------- | ------ |
| `source-face.mp4`   | Original portrait clip (720x1280). Source of truth. | yes    |
| `face.y4m`          | Generated fake webcam feed Chromium reads.          | no*    |
| `face.locked.y4m`   | Backup of the known-good `face.y4m`.                | no*    |
| `build-face.ps1/.sh`| Regenerate `face.y4m` from the source.              | yes    |

\* `.y4m` files are ~200 MB and gitignored. Regenerate them with the build script.

## Locked framing — do not change without re-verifying

```
ffmpeg -y -i source-face.mp4 \
  -vf "scale=-2:720,pad=540:960:(ow-iw)/2:(oh-ih)/2:black" \
  -pix_fmt yuv420p -r 30 -an face.y4m
```

- **540x960 portrait**, face scaled to ~75% height with black margin around it —
  the detector rejects a tighter, full-frame face ("Please ensure face is clear").
- Chromium plays the file at native size (`resizeMode: "none"`); it does not
  rescale. Any resolution works because `src/support/fixtures.ts` softens the
  app's `exact` getUserMedia constraints to `ideal` before app code runs. That
  constraint softening — not the resolution — is what makes injection succeed.

## Rebuild

```powershell
pwsh fixtures/media/build-face.ps1     # Windows
```
```bash
bash fixtures/media/build-face.sh      # bash
```

Requires `ffmpeg` on PATH (`winget install Gyan.FFmpeg`). `.env` already points
`FAKE_CAMERA_VIDEO` at `fixtures/media/face.y4m`.

## Debug

Prefix any test run with `DEBUG_GUM=1` to log the exact camera constraints the
app requests and the resulting track settings.
