import { test, expect } from '../fixtures/fixtures';
import tradingData from '../data/trading.json';

/**
 * Trading Functionality Tests
 *
 * Validates the trading/market sections of mb.io:
 *  - Home page market category tabs (Top Gainers / Trending Now / Top Losers)
 *  - Explore page: Spot Market section heading and description
 *  - Market sentiment indicator
 *  - Mobile app download banner on the Explore page
 *
 * All expected values come from data/trading.json — no hard-coded strings.
 */
test.describe('Trading Functionality', () => {

  // ── Home Page: Market Categories ──────────────────────────────────────────

  test.describe('Home Page — Market Category Tabs', () => {

    test('"Catch your next trade" market section is visible', async ({ homePage }) => {
      const isVisible = await homePage.isMarketSectionVisible();
      expect(isVisible, 'Market section should be visible').toBe(true);
    });

    /**
     * Data-driven: each entry in marketCategories is a separate test.
     * Update trading.json to add or remove categories without touching this file.
     */
    for (const category of tradingData.homePage.marketCategories) {
      test(`"${category}" tab is visible`, async ({ homePage }) => {
        const tab = homePage.page.locator('h2').filter({ hasText: category });
        await expect(tab, `"${category}" tab should be visible`).toBeVisible();
      });
    }

    test('all three market category labels match expected values', async ({ homePage }) => {
      const labels = await homePage.getMarketCategoryLabels();
      const joinedLabels = labels.join(' ');

      for (const expected of tradingData.homePage.marketCategories) {
        expect(joinedLabels, `Categories should contain "${expected}"`).toContain(expected);
      }
    });
  });

  // ── Explore Page: Spot Market ─────────────────────────────────────────────

  test.describe('Explore Page — Spot Market', () => {

    test('page heading is "Markets at your fingertips"', async ({ explorePage }) => {
      await expect(
        explorePage.page.locator('h1').filter({ hasText: tradingData.explorePage.heading }),
      ).toBeVisible();
    });

    test('"Spot market" heading is visible', async ({ explorePage }) => {
      await expect(explorePage.spotMarketHeading).toBeVisible();
      const text = await explorePage.getText(explorePage.spotMarketHeading);
      expect(text).toContain(tradingData.explorePage.spotMarket.heading);
    });

    test('Spot market description mentions cryptocurrency data', async ({ explorePage }) => {
      const desc = explorePage.page
        .locator('p')
        .filter({ hasText: tradingData.explorePage.spotMarket.descriptionContains });
      await expect(desc).toBeVisible();
    });

    test('market sentiment indicator is present', async ({ explorePage }) => {
      await expect(explorePage.marketSentiment).toBeVisible();
    });

    test('"Earn interest on your assets" action card is visible', async ({ explorePage }) => {
      const card = explorePage.page
        .locator('p')
        .filter({ hasText: tradingData.explorePage.actionCards[0] });
      await expect(card).toBeVisible();
    });
  });

  // ── Explore Page: Mobile App Banner ──────────────────────────────────────

  test.describe('Explore Page — Mobile App Banner', () => {

    test('"Explore. Track. Trade." banner heading is visible', async ({ explorePage }) => {
      const isVisible = await explorePage.isMobileAppBannerVisible();
      expect(isVisible, '"Explore. Track. Trade." banner should be visible').toBe(true);
    });

    test('download app link has the correct href', async ({ explorePage }) => {
      const href = await explorePage.getDownloadAppHref();
      expect(href, 'Download link href should match expected URL').toBe(
        tradingData.explorePage.mobileAppBanner.downloadHref,
      );
    });
  });
});
