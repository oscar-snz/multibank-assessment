/**
 * Central environment configuration.
 * All values can be overridden via environment variables for CI/CD flexibility.
 */
export const AppConfig = {
  BASE_URL: process.env.BASE_URL ?? 'https://mb.io',
  DEFAULT_TIMEOUT: parseInt(process.env.TIMEOUT ?? '30000'),
  SLOW_TIMEOUT: parseInt(process.env.SLOW_TIMEOUT ?? '60000'),
} as const;

/**
 * Application routes — single source of truth for URL paths.
 * Update here if the site structure changes.
 */
export const Routes = {
  HOME:    '/en',
  EXPLORE: '/en/explore',
  FEATURES:'/en/features',
  COMPANY: '/en/company',
} as const;
