import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { NavigationComponent } from './components/navigation.component';
import { AppConfig, Routes } from '../config/env.config';

/**
 * HomePage — represents the landing page at https://mb.io/en.
 *
 * Responsibilities:
 *  - Navigation visibility and item discovery (delegated to NavigationComponent)
 *  - Hero / marketing banner section
 *  - Download app universal link (go.link — handles both App Store & Google Play)
 *  - Spot market category tabs (Top Gainers / Trending Now / Top Losers)
 *  - Footer structure
 */
export class HomePage extends BasePage {
  /** Embedded navigation component — composition keeps concerns separate. */
  readonly navigation: NavigationComponent;

  // ─── Hero locators ────────────────────────────────────────────────────────
  private readonly heroHeading: Locator;
  private readonly heroParagraph: Locator;
  private readonly downloadAppLink: Locator;
  private readonly openAccountLink: Locator;

  // ─── Feature sections ─────────────────────────────────────────────────────
  private readonly smartWaysSection: Locator;
  private readonly portfolioSection: Locator;

  // ─── Market category tabs ─────────────────────────────────────────────────
  private readonly marketSectionHeading: Locator;
  readonly topGainersTab: Locator;
  readonly trendingNowTab: Locator;
  readonly topLosersTab: Locator;

  // ─── Footer locators ──────────────────────────────────────────────────────
  private readonly footerNav: Locator;
  private readonly copyrightText: Locator;

  constructor(page: Page) {
    super(page);
    this.navigation = new NavigationComponent(page);

    // Hero
    this.heroHeading      = page.locator('h3').filter({ hasText: 'Crypto for everyone' });
    this.heroParagraph    = page.locator('p').filter({ hasText: 'Simple, secure and speedy' });
    this.downloadAppLink  = page.locator('a[href="https://mbio.go.link/6OW91"]').first();
    this.openAccountLink  = page.locator('a[href*="register"]').first();

    // Feature sections
    this.smartWaysSection = page.locator('h3').filter({ hasText: 'Smarter ways to trade' });
    this.portfolioSection = page.locator('h3').filter({ hasText: 'Securely build your portfolio' });

    // Market categories
    this.marketSectionHeading = page.locator('h3').filter({ hasText: 'Catch your next trade' });
    this.topGainersTab        = page.locator('h2').filter({ hasText: 'Top Gainers' });
    this.trendingNowTab       = page.locator('h2').filter({ hasText: 'Trending Now' });
    this.topLosersTab         = page.locator('h2').filter({ hasText: 'Top Losers' });

    // Footer — mb.io uses a plain <footer> element, not role="contentinfo"
    this.footerNav     = page.getByRole('navigation', { name: 'Footer' });
    this.copyrightText = page.locator('footer p').filter({ hasText: 'Copyright' });
  }

  // ─── URL contract ─────────────────────────────────────────────────────────

  get url(): string {
    return `${AppConfig.BASE_URL}${Routes.HOME}`;
  }

  // ─── Navigation helpers ───────────────────────────────────────────────────

  async isNavigationVisible(): Promise<boolean> {
    return this.navigation.isVisible();
  }

  async getNavigationItemLabels(): Promise<string[]> {
    return this.navigation.getNavItemLabels();
  }

  async clickNavItem(label: string): Promise<void> {
    return this.navigation.clickNavItem(label);
  }

  async getNavItemHref(label: string): Promise<string | null> {
    return this.navigation.getNavItemHref(label);
  }

  // ─── Hero helpers ─────────────────────────────────────────────────────────

  async isHeroVisible(): Promise<boolean> {
    try {
      await expect(this.heroHeading).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
      return true;
    } catch {
      return false;
    }
  }

  async getHeroHeadingText(): Promise<string> {
    return this.getText(this.heroHeading);
  }

  // ─── Download link helpers ────────────────────────────────────────────────

  /** mb.io uses a universal go.link that routes to App Store or Google Play. */
  async getDownloadAppHref(): Promise<string | null> {
    return this.downloadAppLink.getAttribute('href');
  }

  async isDownloadAppLinkVisible(): Promise<boolean> {
    try {
      await expect(this.downloadAppLink).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
      return true;
    } catch {
      return false;
    }
  }

  // ─── Market category helpers ──────────────────────────────────────────────

  async isMarketSectionVisible(): Promise<boolean> {
    try {
      await expect(this.marketSectionHeading).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
      return true;
    } catch {
      return false;
    }
  }

  async getMarketCategoryLabels(): Promise<string[]> {
    const tabs = [this.topGainersTab, this.trendingNowTab, this.topLosersTab];
    return Promise.all(tabs.map((t) => this.getText(t)));
  }

  // ─── Footer helpers ───────────────────────────────────────────────────────

  async scrollToFooter(): Promise<void> {
    await this.footerNav.scrollIntoViewIfNeeded();
    await expect(this.footerNav).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
  }

  async getFooterLinkHref(linkText: string): Promise<string | null> {
    return this.footerNav.getByRole('link', { name: linkText }).getAttribute('href');
  }

  async getCopyrightText(): Promise<string> {
    return this.getText(this.copyrightText);
  }

  async isPaymentMethodVisible(method: string): Promise<boolean> {
    const img = this.page.locator(`footer img[alt="${method}"]`).first();
    try {
      await expect(img).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
      return true;
    } catch {
      return false;
    }
  }
}
