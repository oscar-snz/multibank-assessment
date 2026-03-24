# MultiBank QA Automation Framework

Production-grade web automation framework for [mb.io](https://mb.io) (MultiBank trading platform),
built with **Playwright + TypeScript** using the **Page Object Model** pattern.

---

## Architecture

```
multibank-assessment/
│
├── config/
│   └── env.config.ts                    ← AppConfig (BASE_URL) + Routes constants
│
├── data/                                 ← External test data (zero hard-coded assertions)
│   ├── navigation.json
│   ├── trading.json
│   └── content.json
│
├── pages/                                ← Page Object Model (OOP + inheritance)
│   ├── base.page.ts                     ← Abstract BasePage — shared helpers + abstract url
│   ├── home.page.ts                     ← HomePage  (/en)
│   ├── spot-trading.page.ts             ← ExplorePage (/en/explore)
│   ├── why-multibank.page.ts            ← CompanyPage (/en/company)
│   └── components/
│       └── navigation.component.ts      ← NavigationComponent (composition)
│
├── fixtures/
│   └── fixtures.ts                      ← Playwright test.extend() – POM dependency injection
│
├── tests/
│   ├── navigation.spec.ts               ← Nav display, hrefs, click-through, titles
│   ├── trading.spec.ts                  ← Spot market, market categories, mobile banner
│   ├── content.spec.ts                  ← Hero banners, download link, footer, payments
│   └── why-multibank.spec.ts            ← Why MultiBank heading, stats, pillars, media
│
├── playwright.config.js                 ← Cross-browser, reporters, retries, timeouts
├── tsconfig.json                        ← TypeScript compiler options + path aliases
├── package.json
└── .github/
    └── workflows/
        └── playwright.yml               ← CI/CD: 3-browser matrix + nightly schedule
```

---

## OOP Design

### Inheritance chain

```
BasePage (abstract class — url getter + shared helpers)
  ├── HomePage           /en
  ├── ExplorePage        /en/explore
  └── CompanyPage        /en/company
```

### Composition

```
NavigationComponent  ←── embedded in every page via constructor
```

| OOP Principle | Implementation |
|---|---|
| **Inheritance** | All page classes extend `abstract class BasePage` |
| **Abstraction** | `abstract get url(): string` forces each subclass to declare its route |
| **Encapsulation** | Locators `private readonly`; only typed methods exposed to tests |
| **Composition** | `NavigationComponent` shared across pages without hierarchy pollution |
| **DRY** | `BasePage` centralises `navigate`, `getText`, `getTexts`, `areAllVisible`… |
| **Data-driven** | All assertions read from JSON — update expected values without touching specs |

### Fixture-based dependency injection

Tests receive pre-navigated page objects via `test.extend()`, keeping specs declarative:

```ts
test('hero is visible', async ({ homePage }) => {
  const isVisible = await homePage.isHeroVisible();
  expect(isVisible).toBe(true);
});
```

---

## Requirements

- Node.js ≥ 18
- npm ≥ 9

---

## Setup

```bash
npm install
npm run install:browsers   # Chromium, Firefox, WebKit + system deps
```

---

## Running Tests

```bash
# All tests, all browsers
npm test

# Specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Mobile viewports (Pixel 5, iPhone 12)
npm run test:mobile

# Specific test suite
npm run test:navigation
npm run test:trading
npm run test:content
npm run test:why-multibank

# Headed (watch the browser)
npm run test:headed

# TypeScript type check (no emit)
npm run typecheck

# Open HTML report after a run
npm run report
```

---

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `BASE_URL` | `https://mb.io` | Application under test |
| `TIMEOUT` | `30000` | Default action/nav timeout (ms) |
| `CI` | — | Enables retries, video, artifact capture |

---

## Test Coverage Matrix

| Suite | File | Scenarios |
|---|---|---|
| Navigation & Layout | `navigation.spec.ts` | Nav visibility, all item texts, hrefs, click-navigation, page titles, auth links, cross-page consistency |
| Spot Trading | `trading.spec.ts` | Home market tabs (Gainers/Trending/Losers), Explore spot market section, sentiment widget, mobile app banner, download href |
| Content & Banners | `content.spec.ts` | Hero heading/text, download-app universal link, all footer legal links, all support links, copyright text, 8 payment method images, Hacken audit badge |
| About Us / Why MultiBank | `why-multibank.spec.ts` | H1 heading, sub-heading, $2T/$2M+/25+ stats, 3 content sections, 3 strength pillars, Community & Media section, nav consistency |

---

## CI/CD

`.github/workflows/playwright.yml` triggers on every push, PR, and nightly (02:00 UTC):

1. **3-browser matrix** — Chromium, Firefox, WebKit run in parallel (`fail-fast: false`)
2. **2 retries on CI** — transient network flakiness handled automatically
3. **Artifacts** — HTML report (14 days), failure traces/screenshots/videos (7 days)
4. **Nightly schedule** — catches regressions outside working hours

Override target URL via a repository Variable (`Settings → Variables → Actions`):
- `BASE_URL` → e.g. `https://staging.mb.io`

---

## Failure Diagnostics

On failure Playwright captures:
- **Screenshot** at point of failure
- **Video** replay of the retry
- **Trace** (step-by-step snapshots + network) — open with:
  ```bash
  npx playwright show-trace test-results/<test-name>/trace.zip
  ```
