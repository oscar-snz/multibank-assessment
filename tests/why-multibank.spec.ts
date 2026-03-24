import { test, expect } from '../fixtures/fixtures';
import contentData from '../data/content.json';

/**
 * About Us / Why MultiBank Page Tests  (https://mb.io/en/company)
 *
 * Validates the Company page renders all expected components:
 *  - "Why MultiBank Group?" main heading
 *  - Key statistics ($2T, 2M+, 25+ offices)
 *  - Tradition / Innovation / Integrity content sections
 *  - Strength pillars (Regulation, Track Record, Secure & Trusted)
 *  - Community & Media section
 *  - Navigation is accessible from this page
 *
 * All expected values come from data/content.json — no hard-coded strings.
 */
test.describe('About Us — Why MultiBank Page', () => {

  // ── Heading ────────────────────────────────────────────────────────────────

  test('"Why MultiBank Group?" H1 heading is visible', async ({ companyPage }) => {
    const isVisible = await companyPage.isHeadingVisible();
    expect(isVisible, 'H1 heading should be visible').toBe(true);
  });

  test('heading text matches expected value', async ({ companyPage }) => {
    const heading = await companyPage.getPageHeading();
    expect(heading).toContain(contentData.companyPage.mainHeading);
  });

  test('sub-heading references MultiBank\'s legacy', async ({ companyPage }) => {
    const sub = companyPage.page
      .locator('h2')
      .filter({ hasText: contentData.companyPage.subheadingContains });
    await expect(sub).toBeVisible();
  });

  // ── Statistics ─────────────────────────────────────────────────────────────

  test('all three key statistics are visible', async ({ companyPage }) => {
    const allVisible = await companyPage.areAllStatsVisible();
    expect(allVisible, 'All 3 statistics ($2T, 2M+, 25+) should be visible').toBe(true);
  });

  /**
   * Data-driven: each stat is individually asserted.
   */
  for (const stat of contentData.companyPage.stats) {
    test(`stat "${stat.value}" (${stat.label}) is displayed`, async ({ companyPage }) => {
      const valueEl = companyPage.page.locator('div').filter({ hasText: stat.value }).first();
      const labelEl = companyPage.page.locator('div').filter({ hasText: stat.label }).first();
      await expect(valueEl, `"${stat.value}" should be visible`).toBeVisible();
      await expect(labelEl, `"${stat.label}" should be visible`).toBeVisible();
    });
  }

  // ── Content Sections ──────────────────────────────────────────────────────

  test('all three tradition/innovation/integrity sections are rendered', async ({ companyPage }) => {
    const allVisible = await companyPage.areAllSectionsVisible();
    expect(allVisible, 'All 3 content sections should be visible').toBe(true);
  });

  /**
   * Data-driven: each section heading is individually verified.
   */
  for (const heading of contentData.companyPage.contentSections) {
    test(`section heading "${heading}" is visible`, async ({ companyPage }) => {
      const el = companyPage.page.locator('h2').filter({ hasText: heading });
      await expect(el, `"${heading}" section should be present`).toBeVisible();
    });
  }

  // ── Strength Pillars ──────────────────────────────────────────────────────

  test('"The strength behind MultiBank Group" section is visible', async ({ companyPage }) => {
    const strengthEl = companyPage.page
      .locator('h3')
      .filter({ hasText: 'The strength behind MultiBank Group' });
    await expect(strengthEl).toBeVisible();
  });

  test('all three strength pillars are visible', async ({ companyPage }) => {
    const allVisible = await companyPage.areAllPillarsVisible();
    expect(allVisible, 'All 3 strength pillars should be visible').toBe(true);
  });

  for (const pillar of contentData.companyPage.pillars) {
    test(`pillar "${pillar}" is displayed`, async ({ companyPage }) => {
      const el = companyPage.page.locator('div').filter({ hasText: pillar }).first();
      await expect(el, `Pillar "${pillar}" should be visible`).toBeVisible();
    });
  }

  // ── Community & Media ─────────────────────────────────────────────────────

  test('"Community & Media" section heading is visible', async ({ companyPage }) => {
    const el = companyPage.page
      .locator('h3')
      .filter({ hasText: contentData.companyPage.communityHeading });
    await expect(el).toBeVisible();
  });

  test('at least one media card link is present', async ({ companyPage }) => {
    const mediaLinks = companyPage.page.locator(
      'a[href*="cointelegraph"], a[href*="x.com"], a[href*="coinmarketcap"]',
    );
    const count = await mediaLinks.count();
    expect(count, 'At least one Community & Media link card should be present').toBeGreaterThan(0);
  });

  // ── Navigation Consistency ────────────────────────────────────────────────

  test('navigation component is accessible from the Company page', async ({ companyPage }) => {
    const isNavVisible = await companyPage.navigation.isVisible();
    expect(isNavVisible, 'Navigation should be visible on the Company page').toBe(true);
  });

  test('navigation has at least 4 items on the Company page', async ({ companyPage }) => {
    const items = await companyPage.navigation.getNavItemLabels();
    expect(items.length).toBeGreaterThanOrEqual(4);
  });
});
