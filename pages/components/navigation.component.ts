import { Page, Locator, expect } from '@playwright/test';
import { AppConfig } from '../../config/env.config';

/**
 * NavigationComponent — reusable header/nav interaction layer.
 *
 * Handles both desktop and mobile layouts:
 *  - Desktop: nav[aria-label="Main"] is visible with all links expanded.
 *  - Mobile:  nav[aria-label="Main"] is CSS-hidden (offsetHeight: 0).
 *             A hamburger `button[aria-label="Open menu"]` reveals a separate
 *             unlabeled <nav> drawer that contains all the main nav links.
 *
 * All methods are viewport-aware and branch automatically.
 */
export class NavigationComponent {
  private readonly page: Page;

  /** Desktop: expanded nav landmark. CSS-hidden on mobile but stays in DOM. */
  private readonly navContainer: Locator;

  /** Desktop nav links — ARIA-based; used for interaction on desktop. */
  private readonly navLinks: Locator;

  /**
   * CSS-selector equivalent of navLinks — matches links in nav[aria-label="Main"]
   * regardless of CSS visibility. Used to read href values on mobile where the nav
   * is display:none and therefore excluded from the accessibility tree.
   */
  private readonly mainNavLinksByCss: Locator;

  /** Mobile: hamburger button that opens the nav drawer. */
  private readonly hamburgerButton: Locator;

  /**
   * Mobile: the unlabeled <nav> that slides in after the hamburger is clicked.
   * Safe selector: both nav[aria-label="Main"] and nav[aria-label="Footer"] have
   * aria-labels, so nav:not([aria-label]) exclusively targets the mobile drawer.
   */
  private readonly mobileNavContainer: Locator;

  /** Auth links in the header (hidden on mobile; become visible inside mobile drawer). */
  private readonly signInLink: Locator;
  private readonly signUpLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navContainer       = page.getByRole('navigation', { name: 'Main' });
    this.navLinks           = this.navContainer.getByRole('link');
    // CSS-selector locator for the main nav — finds the element regardless of CSS visibility.
    // Used to read href values on mobile where getByRole() excludes display:none from the
    // accessibility tree and would otherwise timeout.
    this.mainNavLinksByCss  = page.locator('nav[aria-label="Main"] a[href]');
    this.hamburgerButton    = page.getByRole('button', { name: 'Open menu' });
    this.mobileNavContainer = page.locator('nav:not([aria-label])');
    this.signInLink         = page.locator('header a[href*="login"]');
    this.signUpLink         = page.locator('header a[href*="register"]');
  }

  // ─── Viewport detection ───────────────────────────────────────────────────

  /**
   * Returns true when the site is rendering its mobile layout.
   * Intentionally uses an immediate isVisible() — not an assertion — to branch
   * behaviour without blocking for a timeout when on desktop.
   */
  private async isMobile(): Promise<boolean> {
    return this.hamburgerButton.isVisible();
  }

  /**
   * Opens the mobile nav drawer and waits for its links to be interactable.
   * Safe to call unconditionally — is a no-op on desktop viewports.
   */
  async openMobileMenuIfNeeded(): Promise<void> {
    if (!(await this.isMobile())) return;

    // Sentinel link used to detect whether the drawer is already open
    const exploreLink = this.mobileNavContainer.locator('a[href="/en/explore"]');
    if (await exploreLink.isVisible()) return;

    await this.hamburgerButton.click();
    await expect(exploreLink).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
  }

  // ─── Visibility ───────────────────────────────────────────────────────────

  /**
   * Returns true when navigation is accessible to the user:
   *  - Desktop: the expanded nav is visible.
   *  - Mobile:  the hamburger button is visible (nav reachable via one tap).
   */
  async isVisible(): Promise<boolean> {
    try {
      await this.waitForVisible();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Waits for navigation to be accessible.
   * Uses Playwright's locator.or() so the wait resolves on whichever appears
   * first — the desktop nav or the mobile hamburger.
   */
  async waitForVisible(timeout = AppConfig.DEFAULT_TIMEOUT): Promise<void> {
    await expect(
      this.navContainer.or(this.hamburgerButton),
    ).toBeVisible({ timeout });
  }

  // ─── Link discovery ───────────────────────────────────────────────────────

  /** Returns label text for every visible navigation link. */
  async getNavItemLabels(): Promise<string[]> {
    if (await this.isMobile()) {
      await this.openMobileMenuIfNeeded();
      const texts = await this.mobileNavContainer.getByRole('link').allInnerTexts();
      return texts.map(t => t.trim()).filter(Boolean);
    }
    await this.waitForVisible();
    const texts = await this.navLinks.allInnerTexts();
    return texts.map(t => t.trim()).filter(Boolean);
  }

  /** Returns the count of navigation links. */
  async getNavItemCount(): Promise<number> {
    if (await this.isMobile()) {
      await this.openMobileMenuIfNeeded();
      return this.mobileNavContainer.getByRole('link').count();
    }
    await this.waitForVisible();
    return this.navLinks.count();
  }

  /** Returns all { text, href } pairs from the active navigation. */
  async getNavItems(): Promise<Array<{ text: string; href: string | null }>> {
    const mobile = await this.isMobile();
    if (mobile) await this.openMobileMenuIfNeeded();

    const links = await (mobile
      ? this.mobileNavContainer.getByRole('link').all()
      : this.navLinks.all());

    return Promise.all(
      links.map(async link => ({
        text: (await link.innerText()).trim(),
        href: await link.getAttribute('href'),
      })),
    );
  }

  // ─── Interaction ──────────────────────────────────────────────────────────

  /**
   * Click a nav item by label and wait for the SPA route to commit.
   * On mobile: opens the drawer first, then clicks the link inside.
   */
  async clickNavItem(label: string): Promise<void> {
    const mobile = await this.isMobile();
    const navSource = mobile ? this.mobileNavContainer : this.navContainer;

    if (mobile) await this.openMobileMenuIfNeeded();

    const link = navSource.getByRole('link').filter({ hasText: label }).first();
    await expect(link).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
    await link.click();
    // Wait for the SPA to commit the new route — avoids flakiness on Firefox/WebKit
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Returns the href for the nav link whose label matches.
   * Reads directly from the desktop nav DOM even on mobile — the links exist
   * in the CSS-hidden nav[aria-label="Main"], and getAttribute() does not
   * require the element to be visible.
   */
  async getNavItemHref(label: string): Promise<string | null> {
    const link = this.mainNavLinksByCss.filter({ hasText: label }).first();
    return link.evaluate((el: HTMLAnchorElement) => el.getAttribute('href'));
  }

  // ─── Auth links ───────────────────────────────────────────────────────────

  /**
   * Returns true when the Sign In link is accessible.
   * On mobile it is hidden until the drawer is opened.
   */
  async isSignInVisible(): Promise<boolean> {
    try {
      if (await this.isMobile()) await this.openMobileMenuIfNeeded();
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
    if (await this.isMobile()) await this.openMobileMenuIfNeeded();
    return this.signInLink.getAttribute('href');
  }

  async getSignUpHref(): Promise<string | null> {
    return this.signUpLink.getAttribute('href');
  }
}
