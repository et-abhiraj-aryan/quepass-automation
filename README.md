# QuePass Automation

End-to-end BDD test automation for the QuePass application, built on
**Playwright** + **Cucumber** via [`playwright-bdd`](https://vitalets.github.io/playwright-bdd/).
Scenarios are written in Gherkin and executed by the Playwright test runner, so
we keep Cucumber's readable specifications alongside Playwright's fixtures,
auto-waiting, tracing and HTML report.

## Project structure

```
.
├── features/                  # Gherkin specifications (.feature)
│   ├── authentication.feature
│   ├── transaction.feature
│   ├── express-verification.feature
│   ├── customer-search.feature
│   ├── registration.feature
│   ├── event-checkin.feature
│   └── event-face.feature
├── src/
│   ├── config/
│   │   ├── env.ts             # Typed, validated environment config (from .env)
│   │   └── apiEndpoints.ts    # Backend endpoints used for network sync
│   ├── pages/                 # Page Object Model
│   │   ├── BasePage.ts        # Shared network-wait helpers
│   │   ├── SettingsPage.ts    # "Update Settings" dialog / operator config
│   │   ├── DashboardPage.ts   # Module launcher
│   │   ├── EventPage.ts       # Event / ticket / document form controls
│   │   └── BiometricPage.ts   # Face capture / verification / pass download
│   ├── steps/                 # Cucumber step definitions
│   └── support/
│       └── fixtures.ts        # playwright-bdd fixtures wiring page objects
├── archive/original-tests/    # The original recorded specs, kept for reference
├── .env.example               # Template — copy to .env and fill in
├── playwright.config.ts
└── package.json
```

## Setup

```bash
npm install
npx playwright install        # download browsers (first time only)
cp .env.example .env          # then fill in credentials
```

`.env` holds the base URL and operator credentials and is **gitignored** — no
secrets live in the test code anymore.

## Running the tests

```bash
npm test                # generate BDD specs + run all tests, all browsers
npm run test:chromium   # Chromium only
npm run test:firefox    # Firefox only
npm run test:headed     # watch it run in a real browser
npm run test:ui         # Playwright UI mode
npm run report          # open the HTML report from the last run
npm run typecheck       # TypeScript check, no tests
```

`npm test` runs `bddgen` first, which turns the `.feature` files into Playwright
specs under `.features-gen/` (generated — do not edit or commit).

## How it is organised

- **Gherkin features** describe *what* each flow does in business language.
- **Step definitions** (`src/steps`) translate each Gherkin step into calls on
  page objects — they hold no selectors.
- **Page objects** (`src/pages`) own all selectors and UI interactions, so a UI
  change is fixed in one place.
- **Network synchronisation** replaces the old fixed `waitForTimeout` sleeps:
  actions wait on the real backend responses (see `src/config/apiEndpoints.ts`).

## Known fragile locators

The original tests were recorded with Playwright codegen, so some launch buttons
still rely on positional (`.nth()`) or Tailwind colour-class selectors. These
are all isolated in `DashboardPage.ts` and flagged with comments. When the app
exposes stable hooks (ideally `data-testid`), only that file needs updating.
