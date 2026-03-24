import { test, expect } from '../fixtures/fixtures';
import navigationData from '../data/navigation.json';

/**
 * Navigation & Layout Tests
 *
 * Validates the top navigation menu on mb.io:
 *  - Is visible and contains all expected items
 *  - Nav item hrefs are correct
 *  - Clicking nav items navigates to the right pages
 *  - Auth links (Sign in / Sign up) are present
 *  - Logo is visible
 *  - Nav is consistent on secondary pages
 *
 * All expected values come from data/navigation.json — no hard-coded strings.
 */
test.describe('Navigation & Layout', () => {

  // ── Visibility ─────────────────────────────────────────────────────────────

  test('top navigation is visible on the home page', async ({ homePage }) => {
    expect(await homePage.isNavigationVisible()).toBe(true);
  });

  test('navigation has at least the minimum expected number of items', async ({ homePage }) => {
    const items = await homePage.getNavigationItemLabels();
    expect(items.length).toBeGreaterThanOrEqual(navigationData.minNavItemCount);
  });

  test('navigation contains all expected menu items', async ({ homePage }) => {
    const actualItems = await homePage.getNavigationItemLabels();
    const allLabels   = actualItems.join(' ');

    for (const expected of navigationData.expectedNavItems) {
      // $MBG🔥 may differ across locales — check base name
      const needle = expected.replace('🔥', '').trim();
      expect(
        allLabels,
        `Nav should contain "${expected}"`,
      ).toContain(needle);
    }
  });

  // ── Link correctness ───────────────────────────────────────────────────────

  /**
   * Data-driven: each navItemLinkTests entry becomes an independent test.
   * Adding a new item to test = update navigation.json only.
   */
  for (const { label, href } of navigationData.navItemLinkTests) {
    test(`"${label}" nav link has the correct href`, async ({ homePage }) => {
      const actual = await homePage.getNavItemHref(label);
      expect(actual, `"${label}" href should be "${href}"`).toBe(href);
    });
  }

  test('every navigation link has a non-empty href', async ({ homePage }) => {
    const items = await homePage.navigation.getNavItems();
    for (const { text, href } of items) {
      expect(href, `Nav item "${text}" should have a valid href`).toBeTruthy();
    }
  });

  // ── Click-through navigation ───────────────────────────────────────────────

  test('clicking "Explore" navigates to /en/explore', async ({ homePage, page }) => {
    await homePage.clickNavItem('Explore');
    await expect(page).toHaveURL(/\/en\/explore/);
    await expect(page).toHaveTitle(navigationData.pageTitles.explore);
  });

  test('clicking "Features" navigates to /en/features', async ({ homePage, page }) => {
    await homePage.clickNavItem('Features');
    await expect(page).toHaveURL(/\/en\/features/);
    await expect(page).toHaveTitle(navigationData.pageTitles.features);
  });

  test('clicking "Company" navigates to /en/company', async ({ homePage, page }) => {
    await homePage.clickNavItem('Company');
    await expect(page).toHaveURL(/\/en\/company/);
    await expect(page).toHaveTitle(navigationData.pageTitles.company);
  });

  // ── Auth links ─────────────────────────────────────────────────────────────

  test('"Sign in" link is visible and href contains "login"', async ({ homePage }) => {
    expect(await homePage.navigation.isSignInVisible()).toBe(true);
    const href = await homePage.navigation.getSignInHref();
    expect(href).toContain(navigationData.authLinks.signIn.hrefContains);
  });

  test('"Sign up" link is visible and href contains "register"', async ({ homePage }) => {
    expect(await homePage.navigation.isSignUpVisible()).toBe(true);
    const href = await homePage.navigation.getSignUpHref();
    expect(href).toContain(navigationData.authLinks.signUp.hrefContains);
  });

  // ── Page titles ────────────────────────────────────────────────────────────

  test('home page has the correct title', async ({ homePage, page }) => {
    await expect(page).toHaveTitle(navigationData.pageTitles.home);
  });

  test('explore page has the correct title', async ({ explorePage, page }) => {
    await expect(page).toHaveTitle(navigationData.pageTitles.explore);
  });

  test('company page has the correct title', async ({ companyPage, page }) => {
    await expect(page).toHaveTitle(navigationData.pageTitles.company);
  });

  // ── Cross-page consistency ─────────────────────────────────────────────────

  test('navigation is visible on the Explore page', async ({ explorePage }) => {
    const isVisible = await explorePage.navigation.isVisible();
    expect(isVisible, 'Main nav should be visible on Explore page').toBe(true);
  });

  test('navigation is visible on the Company page', async ({ companyPage }) => {
    const isVisible = await companyPage.navigation.isVisible();
    expect(isVisible, 'Main nav should be visible on Company page').toBe(true);
  });
});
