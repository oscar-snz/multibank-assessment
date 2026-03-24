import { Page, Locator, expect } from '@playwright/test';
import { AppConfig } from '../config/env.config';

/**
 * BasePage — abstract base class for all Page Object Models.
 *
 * Provides:
 * - Unified navigation with load-state awareness
 * - Element interaction helpers with built-in waits (no fixed sleeps)
 * - Screenshot capture on demand (useful for failure diagnostics)
 * - A strict getter contract via `url` forcing every subclass
 *   to declare where it lives in the application.
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Absolute URL for this page. Must be implemented by every subclass. */
  abstract get url(): string;

  // ─── Navigation ──────────────────────────────────────────────────────────

  /** Navigate to this page and wait until all scripts have executed. */
  async navigate(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: 'load' });
    await this.waitForPageLoad();
  }

  /**
   * Waits for the page to reach a stable state after navigation.
   * Uses 'load' to ensure the SPA JavaScript (event listeners, routers) is fully
   * initialized before any element interaction. Subclasses may override.
   */
  protected async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('load');
  }

  // ─── Element interactions ─────────────────────────────────────────────────

  /** Click a locator after confirming it is visible and enabled. */
  async clickElement(locator: Locator): Promise<void> {
    await this.waitForVisible(locator);
    await locator.click();
  }

  /** Type into a field, clearing any prior value first. */
  async fillField(locator: Locator, value: string): Promise<void> {
    await this.waitForVisible(locator);
    await locator.fill(value);
  }

  /** Return trimmed inner text of the first matching element. */
  async getText(locator: Locator): Promise<string> {
    await this.waitForVisible(locator);
    return (await locator.innerText()).trim();
  }

  /** Return trimmed inner text for every matching element. */
  async getTexts(locator: Locator): Promise<string[]> {
    const raw = await locator.allInnerTexts();
    return raw.map((t) => t.trim()).filter(Boolean);
  }

  /** Return an attribute value, or null when the attribute is absent. */
  async getAttribute(locator: Locator, attr: string): Promise<string | null> {
    await this.waitForVisible(locator);
    return locator.getAttribute(attr);
  }

  /** Scroll element into view before interacting (handles sticky headers). */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  // ─── Assertions & state ───────────────────────────────────────────────────

  /** Assert element is visible within the default timeout. */
  async waitForVisible(
    locator: Locator,
    timeout = AppConfig.DEFAULT_TIMEOUT,
  ): Promise<void> {
    await expect(locator.first()).toBeVisible({ timeout });
  }

  /** Assert element is hidden / detached within the default timeout. */
  async waitForHidden(
    locator: Locator,
    timeout = AppConfig.DEFAULT_TIMEOUT,
  ): Promise<void> {
    await expect(locator.first()).toBeHidden({ timeout });
  }

  /** Returns true when the element is visible; uses explicit wait to handle lazy-loaded content. */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      await expect(locator.first()).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT });
      return true;
    } catch {
      return false;
    }
  }

  /** Returns true when ALL required locators are visible; each waits for visibility independently. */
  async areAllVisible(locators: Locator[]): Promise<boolean> {
    const results = await Promise.all(
      locators.map(l =>
        expect(l.first()).toBeVisible({ timeout: AppConfig.DEFAULT_TIMEOUT })
          .then(() => true)
          .catch(() => false),
      ),
    );
    return results.every(Boolean);
  }

  // ─── Diagnostics ─────────────────────────────────────────────────────────

  /** Capture a full-page screenshot to aid in debugging failures. */
  async takeScreenshot(name: string): Promise<void> {
    const path = `screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path, fullPage: true });
  }

  /** Current document title. */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** Current browser URL. */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
