import { test, expect } from '@playwright/test';
import { LESSONS } from '../../src/data/content.js';

for (const width of [390, 768, 1440]) {
  test(`mission explanations remain readable and keyboard accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    for (let index = 0; index < LESSONS.length; index++) {
      await page.locator(`[data-mission="${index}"]`).click();
      await expect(page.locator('#lesson-idea')).toHaveText(LESSONS[index].question);
      await expect(page.locator('.explanation-idea p')).toHaveText(LESSONS[index].explain);
      const science = page.locator('.explanation-science');
      await expect(science).not.toHaveAttribute('open');
      await science.locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(science.locator('p')).toBeVisible();
      await expect(science.locator('p')).toHaveText(LESSONS[index].detail);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (index === 0) {
        await page.locator('.explanation').screenshot({ path: `test-results/explanation-${width}.png` });
      }
      await page.keyboard.press('Enter');
      await expect(science.locator('p')).toBeHidden();
      for (const id of ['curiosity', 'glossary']) {
        const button = page.locator(`#${id}`);
        await button.focus();
        await page.keyboard.press('Enter');
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toBeHidden();
        await expect(button).toBeFocused();
      }
    }
  });
}
