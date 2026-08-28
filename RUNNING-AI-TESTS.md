# Running the AI-video liveness tests

This repo automates the QuePass **platform registration** flow end-to-end and can
feed the SDK an **AI-generated face video** to test liveness. Below are the exact
steps to run it yourself.

> You need two things that are **not** in this repo (kept out on
> purpose): the **operator credentials** and a **valid passport image**.

## 1. Prerequisites

- **Node.js 18+** and **git**
- **ffmpeg** on PATH — Windows: `winget install Gyan.FFmpeg` (then reopen the terminal)

## 2. Install

```bash
git clone <REPO_URL>
cd quepass-automation
npm install
npx playwright install chromium
```

## 3. Configure credentials

```bash
cp .env.example .env
```

Then edit `.env` and fill in the values Abhiraj gives you:

```
BASE_URL=https://dev-quepass.cognetlabs.org
AUTH_EMAIL=<from Abhiraj>
AUTH_PASSWORD=<from Abhiraj>
CHANNEL=1
DEFAULT_EVENT=Mulitple - Mumbai
FAKE_CAMERA_VIDEO=fixtures/media/face.y4m
```

## 4. Build the fake-camera file (from the AI clip)

The camera-injection layer needs a Y4M file to exist. Build one from the AI clip
that ships in the repo:

```bash
ffmpeg -i fixtures/media/ai_smile.mp4 -vf "scale=-2:960" -pix_fmt yuv420p -r 30 -an fixtures/media/face.y4m
```

## 5. Add a passport image

The platform flow scans a passport before the face step. Put a **valid** passport
image (get it from Abhiraj, or use your own) at exactly:

```
fixtures/media/passport-front.jpeg
```

## 6. Run the AI liveness test (headed, so you can watch)

```bash
npm run test:headed:serial -- -g "AI-generated face"
```

- **Passes** → the SDK's liveness accepted the AI-generated face.
- **Fails at the face step** → liveness rejected it.

### Optional — the full robustness matrix (compression + resize variants)

```bash
npm run test:headed:serial -- -g "AI face clip"
```

### Optional — see the backend calls and payload sizes

```bash
# bash / git-bash
DEBUG_NET=1 DEBUG_REQ=1 npm run test:headed:serial -- -g "AI-generated face"
```
```powershell
# PowerShell
$env:DEBUG_NET=1; $env:DEBUG_REQ=1; npm run test:headed:serial -- -g "AI-generated face"
```

`DEBUG_NET` logs each SDK response URL/status; `DEBUG_REQ` logs the request sizes.
A pass runs `CheckFaceLiveness → VerifyAndSearch → Signup`; a reject fires
`CheckFaceLiveness` (HTTP 200) but then does **not** call `VerifyAndSearch`.

## Notes

- All runs hit the **dev** environment and perform real registrations.
- `npm run report` opens the Playwright HTML report from the last run.
- To swap in a different AI clip, replace `fixtures/media/ai_smile.mp4` (720×1280
  portrait works best) and rerun.
