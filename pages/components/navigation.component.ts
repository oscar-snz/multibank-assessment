import { Page, Locator, expect } from '@playwright/test';
import { AppConfig } from '../../config/env.config';

/**
 * NavigationComponent — reusable header/nav interaction layer.
 *
 * Kept as a standalone component (composition over inheritance) so that
 * any Page Object can embed it without altering the BasePage hierarchy.
 *
 * The main nav on mb.io is a <nav aria-label="Main"> containing Explore,
 * Features, Company, and $MBG links.
 */
export class NavigationComponent {
  private readonly page: Page;

  /** Main navigation landmark (excludes footer nav). */
  private readonly navContainer: Locator;

  /** All anchor tags inside the main navigation. */
  private readonly navLinks: Locator;

  /** Auth links (Sign in / Sign up) in the header, outside main nav. */
  private readonly signInLink: Locator;
  private readonly signUpLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Target only the primary nav, not the footer nav
    this.navContainer = page.getByRole('navigation', { name: 'Main' });
    this.navLinks     = this.navContainer.getByRole('link');
    this.signInLink   = page.locator('header a[href*="login"]');
    this.signUpLink   = page.locator('header a[href*="register"]');
  }

  // ─── Visibility ───────────────────────────────────────────────────────────

  async isVisible(): Promise<boolean> {
    try {
      await this.waitForVisible();
      return true;
    } catch {
      return false;
    }
  }

  async waitForVisible(timeout = AppConfig.DEFAULT_TIMEOUT): Promise<void> {
    await expect(this.navContainer).toBeVisible({ timeout });
  }

  // ─── Link discovery ───────────────────────────────────────────────────────

  /** Returns label text for every visible navigation link. */
  async getNavItemLabels(): Promise<string[]> {
    await this.waitForVisible();
    const texts = await this.navLinks.allInnerTexts();
    return texts.map((t) => t.trim()).filter(Boolean);
  }

  /** Returns the count of navigation links. */
  async getNavItemCount(): Promise<number> {
    await this.waitForVisible();
    return this.navLinks.count();
  }

  /** Returns all { text, href } pairs from the main navigation. */
  async getNavItems(): Promise<Array<{ text: string; href: string | null }>> {
    await this.waitForVisible();
    const links = await this.navLinks.all();
    return Promise.all(
      links.map(async (link) => ({
        text: (await link.innerText()).trim(),
        href: await link.getAttribute('href'),
      })),
    );
  }

  // ─── Interaction ──────────────────────────────────────────────────────────

  /**
   * Click a nav item by its visible label text and wait for navigation to complete.
   * The explicit waitForURL ensures Firefox's slower navigation is fully captured
   * before the calling test proceeds to URL/title assertions.
   */
  async clickNavItem(label: string): Promise<void> {
    const link = this.navLinks.filter({ hasText: label }).first();
    await expect(link).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
    await link.click();
    // Wait for the SPA to commit the new route — avoids flakiness on Firefox/WebKit
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Return the href attribute for the nav link whose label matches.
   * Useful for validating that links point to the correct destinations.
   */
  async getNavItemHref(label: string): Promise<string | null> {
    const link = this.navLinks.filter({ hasText: label }).first();
    return link.getAttribute('href');
  }

  // ─── Auth links ───────────────────────────────────────────────────────────

  async isSignInVisible(): Promise<boolean> {
    try {
      await expect(this.signInLink).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
      return true;
    } catch {
      return false;
    }
  }

  async isSignUpVisible(): Promise<boolean> {
    try {
      await expect(this.signUpLink).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
      return true;
    } catch {
      return false;
    }
  }

  async getSignInHref(): Promise<string | null> {
    return this.signInLink.getAttribute('href');
  }

  async getSignUpHref(): Promise<string | null> {
    return this.signUpLink.getAttribute('href');
  }
}
