import { test, expect } from '@playwright/test';

test('all seven benches keep the main instruction without optional help sections', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  for (const width of [1200, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (let index = 0; index < 7; index++) {
      await page.locator(`[data-mission="${index}"]`).click();
      await expect(page.locator('#scene-goal')).toHaveCount(0);
      await expect(page.locator('#scene-bubble')).toBeVisible();
      await expect(page.locator('#scene-bubble')).not.toBeEmpty();
      await expect(page.getByText('Cómo interactuar', { exact: true })).toHaveCount(0);
      await expect(page.getByText('Sobre el modelo', { exact: true })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('.experiment').screenshot({ path: `test-results/bench-${index + 1}-${width}.png` });
    }
  }
  expect(errors).toEqual([]);
});
