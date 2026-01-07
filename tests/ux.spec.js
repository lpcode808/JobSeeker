const { test, expect } = require('@playwright/test');

const STORAGE_KEY = 'jobseeker.artifact.v1';

async function dismissOnboarding(page) {
  const overlay = page.locator('[data-role="onboarding"]');
  if (!(await overlay.isVisible())) {
    return;
  }
  const button = page.locator('[data-action="dismiss-onboarding"]');
  await button.click({ force: true });
  await page.waitForFunction((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return false;
    }
    return JSON.parse(raw).meta.onboardingDismissed;
  }, STORAGE_KEY);
  await expect(overlay).not.toHaveClass(/is-visible/);
}

test.describe('JobSeeker UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('onboarding can be dismissed', async ({ page }) => {
    await dismissOnboarding(page);
    const stored = await page.evaluate((key) => {
      return JSON.parse(localStorage.getItem(key));
    }, STORAGE_KEY);
    expect(stored.meta.onboardingDismissed).toBe(true);
  });

  test('selecting a file updates the editor', async ({ page }) => {
    await dismissOnboarding(page);
    await page.locator('.tree__item', { hasText: 'profile/skills.md' }).click();

    await expect(page.locator('[data-role="active-path"]')).toHaveText(
      'profile/skills.md'
    );
    await expect(page.locator('[data-role="file-editor"]')).toHaveValue(
      /Core Skills/
    );
  });

  test('search navigates to the selected result', async ({ page }) => {
    await dismissOnboarding(page);
    const searchInput = page.locator('[data-role="search-input"]');
    const searchList = page.locator('[data-role="search-list"]');

    await searchInput.fill('churn');

    await expect(searchList).toHaveClass(/is-visible/);
    await searchInput.press('Enter');

    await expect(page.locator('[data-role="active-path"]')).toHaveText(
      'prep/star-stories.md'
    );
  });

  test('theme toggle switches to light mode', async ({ page }) => {
    await dismissOnboarding(page);
    const toggle = page.locator('[data-action="toggle-theme"]');

    await toggle.click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveText('Dark Mode');
  });

  test('export actions trigger downloads', async ({ page }) => {
    await dismissOnboarding(page);

    const [jsonDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('[data-action="export-json"]').click(),
    ]);
    expect(jsonDownload.suggestedFilename()).toBe('jobseeker-artifact.json');

    const [markdownDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('[data-action="export-markdown"]').click(),
    ]);
    expect(markdownDownload.suggestedFilename()).toBe('jobseeker-artifact.md');

    const zipButton = page.locator('[data-action="export-zip"]');
    await expect(zipButton).toBeEnabled();
    const [zipDownload] = await Promise.all([
      page.waitForEvent('download'),
      zipButton.click(),
    ]);
    expect(zipDownload.suggestedFilename()).toBe('jobseeker-artifact.zip');
  });

  test('copy transcript shows confirmation', async ({ page }) => {
    await dismissOnboarding(page);
    await page.context().grantPermissions(['clipboard-write'], {
      origin: 'http://127.0.0.1:4173',
    });

    const [dialog] = await Promise.all([
      page.waitForEvent('dialog'),
      page.locator('[data-action="copy-transcript"]').click(),
    ]);

    expect(dialog.message()).toBe('Transcript copied to clipboard.');
    await dialog.accept();
  });

  test('api key overlay saves and masks key', async ({ page }) => {
    await dismissOnboarding(page);

    await page.locator('[data-action="set-api-key"]').click();
    const overlay = page.locator('[data-role="api-key"]');
    await expect(overlay).toHaveClass(/is-visible/);

    const input = page.locator('[data-role="api-key-input"]');
    await input.fill('AIzaSyTestKey1234567890');
    await page.locator('[data-action="save-api-key"]').click();

    await expect(page.locator('[data-role="api-key-status"]')).toHaveText(
      'Saved. This key stays in your browser.'
    );
    await expect(input).toHaveValue(/•{6}/);

    const stored = await page.evaluate(() => {
      return localStorage.getItem('jobseeker.geminiKey.v1');
    });
    expect(stored).toBe('AIzaSyTestKey1234567890');
  });
});
