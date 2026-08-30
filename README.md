# QuePass Automation

End-to-end BDD test automation for the QuePass application, built on
**Playwright** + **Cucumber** via [`playwright-bdd`](https://vitalets.github.io/playwright-bdd/).
Scenarios are written in Gherkin and executed by the Playwright test runner, so
we keep Cucumber's readable specifications alongside Playwright's fixtures,
auto-waiting, tracing and HTML report.

It also drives the biometric flows **unattended** by injecting a video/image as
the webcam (see [Fake camera](#fake-camera-unattended-face--passport-capture)),
and includes security testing of the face-capture liveness (see
[`SECURITY-FINDINGS.md`](SECURITY-FINDINGS.md) and
[`RUNNING-AI-TESTS.md`](RUNNING-AI-TESTS.md)).

## Project structure

```
.
├── features/                         # Gherkin specifications (.feature)
│   ├── authentication.feature        # ─┐
│   ├── transaction.feature           #  │ core app flows
│   ├── express-verification.feature  #  │
│   ├── customer-search.feature       #  │
│   ├── registration.feature          #  │
│   ├── event-checkin.feature         #  │
│   ├── event-face.feature            # ─┘
│   ├── platform-registration.feature       # passport + face registration
│   ├── platform-registration-ai.feature    # liveness test with an AI face video
│   ├── exp-compression.feature             # liveness robustness (recompression)
│   ├── exp-resize.feature                  # liveness robustness (resize)
│   └── liveness-injection-guard.feature    # anti-spoof regression guard
├── src/
│   ├── config/
│   │   ├── env.ts                    # Typed, validated env config (from .env)
│   │   └── apiEndpoints.ts           # Backend endpoints used for network sync
│   ├── pages/                        # Page Object Model
│   │   ├── BasePage.ts               # Shared network-wait helpers
│   │   ├── SettingsPage.ts           # "Update Settings" dialog / operator config
│   │   ├── DashboardPage.ts          # Module launcher
│   │   ├── EventPage.ts              # Event / ticket / document form controls
│   │   ├── BiometricPage.ts          # Face capture / verification / pass download
│   │   └── PlatformRegistrationPage.ts   # Passport + face registration flow
│   ├── steps/                        # Cucumber step definitions (no selectors)
│   └── support/
│       └── fixtures.ts               # Fixtures + fake-camera injection
├── fixtures/media/                   # Fake-camera assets (see its README)
│   ├── ai_smile.mp4                  # AI-generated face clip (committed)
│   ├── experiments/                  # Degraded clips for the robustness tests
│   └── build-face.ps1 / .sh          # Regenerate the .y4m fake-webcam file
├── RUNNING-AI-TESTS.md               # How to run the AI/liveness tests
├── SECURITY-FINDINGS.md              # Camera-injection & liveness writeup
├── .env.example                      # Template — copy to .env and fill in
├── playwright.config.ts
└── package.json
```

> Not committed (personal / secret, gitignored): `.env`, the passport image
> (`fixtures/media/passport-front.jpeg`), the real face clips (`source-face.mp4`,
> `new_normal_video.mp4`), and the large generated `.y4m` files.

## Setup

```bash
npm install
npx playwright install        # download browsers (first time only)
cp .env.example .env          # then fill in credentials
```

`.env` holds the base URL, operator credentials and the fake-camera path, and is
**gitignored** — no secrets live in the test code.

## Running the tests

```bash
npm test                     # generate BDD specs + run all tests, all browsers
npm run test:chromium        # Chromium only
npm run test:headed          # watch it run in a real browser
npm run test:headed:serial   # Chromium, headed, one scenario at a time
npm run report               # open the HTML report from the last run
npm run typecheck            # TypeScript check, no tests
```

Run a single scenario by name with `-g`:

```bash
npm run test:headed:serial -- -g "Log in a registrant"
npm run test:headed:serial -- -g "must be rejected by liveness"
```

`npm test` runs `bddgen` first, which turns the `.feature` files into Playwright
specs under `.features-gen/` (generated — do not edit or commit).

## Fake camera (unattended face / passport capture)

Face and passport steps need a camera. Instead of a person, Chromium is launched
with a video file as a fake webcam (`--use-file-for-fake-video-capture`), and a
`getUserMedia` override in `src/support/fixtures.ts` softens the app's exact
camera constraints and can inject a still image (passport) or a video (face) on
demand. Configure it via `FAKE_CAMERA_VIDEO` in `.env`; build the file with
`fixtures/media/build-face.ps1` (or `.sh`). Details: `fixtures/media/README.md`.

## Security testing

- **`RUNNING-AI-TESTS.md`** — step-by-step to run the AI-video liveness test and
  the robustness experiments.
- **`SECURITY-FINDINGS.md`** — how a pre-recorded video is injected into face
  capture, how the native-function tamper check is bypassed, and the server-side
  fix.
- **`features/liveness-injection-guard.feature`** — an anti-spoof regression that
  passes only if an injected stream is rejected:
  `npm run test:headed:serial -- -g "must be rejected by liveness"`

## How it is organised

- **Gherkin features** describe *what* each flow does in business language.
- **Step definitions** (`src/steps`) translate each Gherkin step into calls on
  page objects — they hold no selectors.
- **Page objects** (`src/pages`) own all selectors and UI interactions, so a UI
  change is fixed in one place.
- **Network synchronisation** replaces fixed `waitForTimeout` sleeps: actions wait
  on real backend responses (see `src/config/apiEndpoints.ts`). Set `DEBUG_NET=1`
  to log response URLs, `DEBUG_REQ=1` / `DEBUG_RESP=1` for payloads.

## Known fragile locators

The core flows were recorded with Playwright codegen, so some launch buttons still
rely on positional (`.nth()`) or Tailwind colour-class selectors. These are
isolated in `DashboardPage.ts` and flagged with comments. When the app exposes
stable hooks (ideally `data-testid`), only that file needs updating.
