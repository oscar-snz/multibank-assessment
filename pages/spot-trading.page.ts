import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { NavigationComponent } from './components/navigation.component';
import { AppConfig, Routes } from '../config/env.config';

/**
 * ExplorePage — represents the Explore / Spot Market page at /en/explore.
 *
 * Renamed from SpotTradingPage to reflect the actual page name.
 * Responsibilities:
 *  - Spot market section heading and description
 *  - Market sentiment indicator
 *  - Action cards (Earn interest, Instant buy, Deposits)
 *  - Mobile app download banner
 *
 * @alias SpotTradingPage (exported as alias for backward compatibility)
 */
export class ExplorePage extends BasePage {
  readonly navigation: NavigationComponent;

  // ─── Hero ─────────────────────────────────────────────────────────────────
  private readonly pageHeading: Locator;

  // ─── Action cards ─────────────────────────────────────────────────────────
  private readonly earnInterestCard: Locator;
  private readonly instantBuyLink: Locator;
  private readonly depositFundsLink: Locator;

  // ─── Spot market section ──────────────────────────────────────────────────
  readonly spotMarketHeading: Locator;
  private readonly spotMarketDesc: Locator;
  readonly marketSentiment: Locator;

  // ─── Mobile app banner ────────────────────────────────────────────────────
  private readonly mobileAppBannerHeading: Locator;
  private readonly mobileAppBannerDesc: Locator;
  private readonly downloadAppLink: Locator;

  constructor(page: Page) {
    super(page);
    this.navigation = new NavigationComponent(page);

    // Hero
    this.pageHeading = page.locator('h1').filter({ hasText: 'Markets at your fingertips' });

    // Action cards
    this.earnInterestCard = page.locator('p').filter({ hasText: 'Earn interest on your assets' });
    this.instantBuyLink   = page.locator('a[href*="login"]').filter({ hasText: 'Instant buy' });
    this.depositFundsLink = page.locator('a[href*="login"]').filter({ hasText: 'Top up today' });

    // Spot market
    this.spotMarketHeading = page.locator('h2').filter({ hasText: 'Spot market' });
    this.spotMarketDesc    = page.locator('p').filter({ hasText: 'cryptocurrency spot market data' });
    this.marketSentiment   = page.locator('h3').filter({ hasText: 'Market sentiment' });

    // Mobile app banner
    this.mobileAppBannerHeading = page.locator('h3').filter({ hasText: 'Explore. Track. Trade.' });
    this.mobileAppBannerDesc    = page.locator('p').filter({ hasText: 'real-time alerts, insights' });
    this.downloadAppLink        = page.locator('a[href="https://mbio.go.link/6OW91"]');
  }

  // ─── URL contract ─────────────────────────────────────────────────────────

  get url(): string {
    return `${AppConfig.BASE_URL}${Routes.EXPLORE}`;
  }

  // ─── Spot market helpers ──────────────────────────────────────────────────

  async isSpotMarketVisible(): Promise<boolean> {
    try {
      await expect(this.spotMarketHeading).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
      return true;
    } catch {
      return false;
    }
  }

  async getSpotMarketHeadingText(): Promise<string> {
    return this.getText(this.spotMarketHeading);
  }

  async getSpotMarketDescription(): Promise<string> {
    return this.getText(this.spotMarketDesc);
  }

  async isMarketSentimentVisible(): Promise<boolean> {
    try {
      await expect(this.marketSentiment).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
      return true;
    } catch {
      return false;
    }
  }

  // ─── Mobile app banner helpers ────────────────────────────────────────────

  async isMobileAppBannerVisible(): Promise<boolean> {
    try {
      await expect(this.mobileAppBannerHeading).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
      return true;
    } catch {
      return false;
    }
  }

  async getDownloadAppHref(): Promise<string | null> {
    return this.downloadAppLink.getAttribute('href');
  }
}

/** Backward-compatible alias */
export { ExplorePage as SpotTradingPage };
