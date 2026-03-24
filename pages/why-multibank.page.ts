import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { NavigationComponent } from './components/navigation.component';
import { AppConfig, Routes } from '../config/env.config';

/**
 * CompanyPage — represents the "About Us / Why MultiBank" page at /en/company.
 *
 * Responsibilities:
 *  - Main heading ("Why MultiBank Group?")
 *  - Key statistics ($2T turnover, 2M+ customers, 25+ offices)
 *  - Content sections (tradition, innovation, integrity)
 *  - Strength pillars (regulation, track record, secure & trusted)
 *  - Community & Media section
 *
 * @alias WhyMultibankPage (exported as alias for backward compatibility)
 */
export class CompanyPage extends BasePage {
  readonly navigation: NavigationComponent;

  // ─── Hero ─────────────────────────────────────────────────────────────────
  private readonly mainHeading: Locator;
  private readonly subheading: Locator;

  // ─── Statistics ───────────────────────────────────────────────────────────
  private readonly annualTurnoverValue: Locator;
  private readonly customersValue: Locator;
  private readonly officesValue: Locator;

  // ─── Content sections ─────────────────────────────────────────────────────
  readonly traditionSection: Locator;
  readonly innovationSection: Locator;
  readonly integritySection: Locator;

  // ─── Strength pillars ─────────────────────────────────────────────────────
  private readonly strengthSectionHeading: Locator;
  readonly regulationPillar: Locator;
  readonly trackRecordPillar: Locator;
  readonly securityPillar: Locator;

  // ─── Community & Media ────────────────────────────────────────────────────
  private readonly communityHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.navigation = new NavigationComponent(page);

    // Hero
    this.mainHeading = page.locator('h1').filter({ hasText: 'Why MultiBank Group?' });
    this.subheading  = page.locator('h2').filter({ hasText: 'For nearly two decades' });

    // Stats
    this.annualTurnoverValue = page.locator('div').filter({ hasText: '$2 trillion' }).first();
    this.customersValue      = page.locator('div').filter({ hasText: '2,000,000+' }).first();
    this.officesValue        = page.locator('div').filter({ hasText: '25+' }).first();

    // Content sections
    this.traditionSection  = page.locator('h2').filter({ hasText: 'A tradition of global leadership' });
    this.innovationSection = page.locator('h2').filter({ hasText: 'Innovation with purpose' });
    this.integritySection  = page.locator('h2').filter({ hasText: 'Integrity built into every decision' });

    // Pillars
    this.strengthSectionHeading = page.locator('h3').filter({ hasText: 'The strength behind MultiBank Group' });
    this.regulationPillar       = page.locator('div').filter({ hasText: 'Regulation at our core' }).first();
    this.trackRecordPillar      = page.locator('div').filter({ hasText: 'Proven track record' }).first();
    this.securityPillar         = page.locator('div').filter({ hasText: 'Secure & trusted' }).first();

    // Community
    this.communityHeading = page.locator('h3').filter({ hasText: 'Community & Media' });
  }

  // ─── URL contract ─────────────────────────────────────────────────────────

  get url(): string {
    return `${AppConfig.BASE_URL}${Routes.COMPANY}`;
  }

  // ─── Heading helpers ──────────────────────────────────────────────────────

  async getPageHeading(): Promise<string> {
    return this.getText(this.mainHeading);
  }

  async isHeadingVisible(): Promise<boolean> {
    try {
      await expect(this.mainHeading).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
      return true;
    } catch {
      return false;
    }
  }

  // ─── Stat helpers ─────────────────────────────────────────────────────────

  async areAllStatsVisible(): Promise<boolean> {
    return this.areAllVisible([
      this.annualTurnoverValue,
      this.customersValue,
      this.officesValue,
    ]);
  }

  // ─── Section helpers ──────────────────────────────────────────────────────

  async areAllSectionsVisible(): Promise<boolean> {
    return this.areAllVisible([
      this.traditionSection,
      this.innovationSection,
      this.integritySection,
    ]);
  }

  // ─── Pillar helpers ───────────────────────────────────────────────────────

  async areAllPillarsVisible(): Promise<boolean> {
    return this.areAllVisible([
      this.regulationPillar,
      this.trackRecordPillar,
      this.securityPillar,
    ]);
  }

  async getSubHeadingTexts(): Promise<string[]> {
    return this.getTexts(this.page.getByRole('heading', { level: 2 }));
  }

  async hasSubHeadingWithText(text: string): Promise<boolean> {
    const el = this.page.locator('h2').filter({ hasText: text }).first();
    try {
      await expect(el).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
      return true;
    } catch {
      return false;
    }
  }
}

/** Backward-compatible alias */
export { CompanyPage as WhyMultibankPage };
