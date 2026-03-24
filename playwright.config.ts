import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the MultiBank QA Automation Framework.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  /* Run only TypeScript specs */
  testMatch: ['**/*.spec.ts'],

  /* Run test files in parallel */
  fullyParallel: true,

  /* Fail CI builds if test.only is accidentally committed */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests once locally, twice on CI (transient network flakiness) */
  retries: process.env.CI ? 2 : 1,

  /* Parallelism: cap at 4 workers on CI, unrestricted locally */
  workers: process.env.CI ? 4 : undefined,

  /* Per-test timeout — generous for slower browsers (Firefox/WebKit) on remote sites */
  timeout: 60_000,

  /* Assertion timeout — allows slow SPA title/URL updates to propagate across all browsers */
  expect: {
    timeout: 30_000,
  },

  /* ── Reporters ──────────────────────────────────────────────────────────── */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ...(process.env.CI ? ([['github']] as const) : []),
  ],

  /* ── Shared test options ────────────────────────────────────────────────── */
  use: {
    /* Base URL — override with BASE_URL env var for different environments */
    baseURL: process.env.BASE_URL ?? 'https://mb.io',

    /* Capture a trace on first retry to aid debugging */
    trace: 'on-first-retry',

    /* Screenshot on every test failure */
    screenshot: 'only-on-failure',

    /* Record video on first retry */
    video: 'on-first-retry',

    /* Navigation timeout */
    navigationTimeout: 30_000,

    /* Action timeout */
    actionTimeout: 15_000,
  },

  /* ── Output directory for artifacts ────────────────────────────────────── */
  outputDir: 'test-results',

  /* ── Cross-browser projects ─────────────────────────────────────────────── */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
