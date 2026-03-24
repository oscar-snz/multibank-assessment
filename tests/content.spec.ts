import { test, expect } from '../fixtures/fixtures';
import contentData from '../data/content.json';

/**
 * Content Validation Tests
 *
 * Validates:
 *  - Hero / marketing banner on the home page
 *  - Download app universal link (mb.io uses go.link for both App Store & Play)
 *  - Footer: legal links, support links, copyright text, payment method images
 *  - Hacken security audit badge
 *
 * All expected values come from data/content.json — no hard-coded strings.
 */
test.describe('Content Validation', () => {

  // ── Hero / Marketing Banner ────────────────────────────────────────────────

  test.describe('Home Page — Hero Banner', () => {

    test('"Crypto for everyone" hero heading is visible', async ({ homePage }) => {
      const heading = homePage.page
        .locator('h3')
        .filter({ hasText: contentData.homePage.heroHeading });
      await expect(heading).toBeVisible();
    });

    test('hero description text is correct', async ({ homePage }) => {
      const para = homePage.page
        .locator('p')
        .filter({ hasText: contentData.homePage.heroDescriptionContains });
      await expect(para).toBeVisible();
    });

    test('"Smarter ways to trade" feature section is visible', async ({ homePage }) => {
      const section = homePage.page
        .locator('h3')
        .filter({ hasText: contentData.homePage.smartWaysHeading });
      await expect(section).toBeVisible();
    });

    test('"Securely build your portfolio" section is visible', async ({ homePage }) => {
      const section = homePage.page
        .locator('h3')
        .filter({ hasText: contentData.homePage.portfolioHeading });
      await expect(section).toBeVisible();
    });
  });

  // ── Download Section ──────────────────────────────────────────────────────

  test.describe('Download App Link', () => {

    test('download app link is visible on the home page', async ({ homePage }) => {
      const isVisible = await homePage.isDownloadAppLinkVisible();
      expect(isVisible, 'Download app link should be visible').toBe(true);
    });

    test('download app link points to the correct universal URL', async ({ homePage }) => {
      const href = await homePage.getDownloadAppHref();
      expect(href, 'Download link href should match expected URL').toBe(
        contentData.homePage.downloadAppHref,
      );
    });

    test('download app link is also present on the Explore page', async ({ explorePage }) => {
      const href = await explorePage.getDownloadAppHref();
      expect(href).toBe(contentData.homePage.downloadAppHref);
    });
  });

  // ── Footer: Legal Links ───────────────────────────────────────────────────

  test.describe('Footer — Legal Links', () => {

    /**
     * Data-driven: each legal link in content.json gets its own test.
     * Add/remove links from the JSON without touching this file.
     */
    for (const link of contentData.footer.legalLinks) {
      test(`"${link.text}" link is present with correct href`, async ({ homePage }) => {
        await homePage.scrollToFooter();
        const footerLink = homePage.page
          .getByRole('navigation', { name: 'Footer' })
          .locator(`a[href="${link.href}"]`);
        await expect(footerLink, `"${link.text}" footer link should be visible`).toBeVisible();
        const href = await footerLink.getAttribute('href');
        expect(href).toBe(link.href);
      });
    }
  });

  // ── Footer: Support Links ─────────────────────────────────────────────────

  test.describe('Footer — Support Links', () => {

    for (const link of contentData.footer.supportLinks) {
      test(`"${link.text}" support link is present with correct href`, async ({ homePage }) => {
        await homePage.scrollToFooter();
        const footerLink = homePage.page
          .getByRole('navigation', { name: 'Footer' })
          .locator(`a[href="${link.href}"]`);
        await expect(footerLink, `"${link.text}" support link should be visible`).toBeVisible();
      });
    }
  });

  // ── Footer: Copyright & Payment Methods ───────────────────────────────────

  test.describe('Footer — Copyright & Payment Methods', () => {

    test('copyright text is correct', async ({ homePage }) => {
      await homePage.scrollToFooter();
      const text = await homePage.getCopyrightText();
      expect(text).toContain(contentData.footer.copyrightContains);
    });

    /**
     * Each payment method image is individually verified.
     */
    for (const method of contentData.footer.paymentMethods) {
      test(`payment method "${method}" image is displayed`, async ({ homePage }) => {
        await homePage.scrollToFooter();
        const isVisible = await homePage.isPaymentMethodVisible(method);
        expect(isVisible, `"${method}" payment method image should be visible`).toBe(true);
      });
    }

    test('"Assured by: Hacken" security audit link is present', async ({ homePage }) => {
      await homePage.scrollToFooter();
      const hackenLink = homePage.page.locator(
        `a[href*="${contentData.footer.securityAuditHrefContains}"]`,
      );
      await expect(hackenLink).toBeVisible();
    });
  });
});
