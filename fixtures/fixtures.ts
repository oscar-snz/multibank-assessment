import { test as base, expect } from '@playwright/test';
import { HomePage }    from '../pages/home.page';
import { ExplorePage } from '../pages/spot-trading.page';
import { CompanyPage } from '../pages/why-multibank.page';

/**
 * Custom fixture types.
 * Each fixture creates a fully-navigated Page Object so test files
 * receive a ready-to-use instance — no boilerplate, no duplication.
 */
type PageFixtures = {
  homePage:    HomePage;
  explorePage: ExplorePage;
  companyPage: CompanyPage;
};

/**
 * Extended test object with page-object fixtures.
 *
 * Usage in tests:
 *   import { test, expect } from '../fixtures/fixtures';
 *   test('my test', async ({ homePage }) => { ... });
 */
export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await use(homePage);
  },

  explorePage: async ({ page }, use) => {
    const explorePage = new ExplorePage(page);
    await explorePage.navigate();
    await use(explorePage);
  },

  companyPage: async ({ page }, use) => {
    const companyPage = new CompanyPage(page);
    await companyPage.navigate();
    await use(companyPage);
  },
});

export { expect };
