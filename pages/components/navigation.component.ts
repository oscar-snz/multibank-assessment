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
  /** Mobile: the same button after the drawer is open (label flips to "Close menu"). */
  private readonly closeMenuButton: Locator;

  /**
   * Mobile: the unlabeled <nav> that slides in after the hamburger is clicked.
   * Safe selector: both nav[aria-label="Main"] and nav[aria-label="Footer"] have
   * aria-labels, so nav:not([aria-label]) exclusively targets the mobile drawer.
   */
  private readonly mobileNavContainer: Locator;

  /**
   * Auth links.
   * Desktop: Sign In is inside nav[aria-label="Main"] (inside <header>).
   * Mobile:  The hamburger opens a <dialog> overlay. Sign In appears in the
   *          dialog footer (dialog > generic > link "Sign in"), NOT in <header>.
   *          Sign Up stays in the <header> banner on both viewports.
   */
  private readonly signInLink: Locator;
  private readonly mobileDialogSignInLink: Locator;
  private readonly signUpLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navContainer            = page.getByRole('navigation', { name: 'Main' });
    this.navLinks                = this.navContainer.getByRole('link');
    // CSS-selector locator for the main nav — finds the element regardless of CSS visibility.
    // Used to read href values on mobile where getByRole() excludes display:none from the
    // accessibility tree and would otherwise timeout.
    this.mainNavLinksByCss       = page.locator('nav[aria-label="Main"] a[href]');
    this.hamburgerButton         = page.getByRole('button', { name: 'Open menu' });
    this.closeMenuButton         = page.getByRole('button', { name: 'Close menu' });
    this.mobileNavContainer      = page.locator('nav:not([aria-label])');
    this.signInLink              = page.locator('header a[href*="login"]');
    // Mobile Sign In lives inside the <dialog> that slides in from the hamburger,
    // outside the <header> element entirely.
    this.mobileDialogSignInLink  = page.getByRole('dialog').getByRole('link', { name: /sign\s*in/i });
    this.signUpLink              = page.locator('header a[href*="register"]');
  }

  // ─── Viewport detection ───────────────────────────────────────────────────

  /**
   * Returns true when the site is rendering its mobile layout.
   * Checks both button states — the label flips from "Open menu" to "Close menu"
   * once the drawer is open, so either being visible confirms a mobile viewport.
   */
  private async isMobile(): Promise<boolean> {
    return (
      (await this.hamburgerButton.isVisible()) ||
      (await this.closeMenuButton.isVisible())
    );
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
   * The header contains multiple elements matching `header a[href*="login"]`
   * (desktop nav, mobile overlay, possibly hidden duplicates). This helper
   * iterates all matches and returns the first one that is currently visible,
   * avoiding strict-mode violations from multi-match locators.
   */
  private async getVisibleSignInLink(): Promise<Locator | null> {
    if (await this.isMobile()) {
      // On mobile the Sign In link is in the <dialog> overlay, not in <header>
      const link = this.mobileDialogSignInLink.first();
      if (await link.isVisible()) return link;
      return null;
    }
    // Desktop: multiple hidden duplicates may exist — return the first visible one
    const count = await this.signInLink.count();
    for (let i = 0; i < count; i++) {
      const link = this.signInLink.nth(i);
      if (await link.isVisible()) return link;
    }
    return null;
  }

  /**
   * Returns true when the Sign In link is accessible.
   * On mobile it is hidden until the drawer is opened.
   */
  async isSignInVisible(): Promise<boolean> {
    if (await this.isMobile()) await this.openMobileMenuIfNeeded();
    return (await this.getVisibleSignInLink()) !== null;
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
    const link = await this.getVisibleSignInLink();
    return link
      ? link.getAttribute('href')
      : this.signInLink.first().getAttribute('href');
  }

  async getSignUpHref(): Promise<string | null> {
    return this.signUpLink.getAttribute('href');
  }
}
