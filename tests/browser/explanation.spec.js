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
      await expect(science.locator('summary')).toHaveCount(0);
      await expect(science.locator('p')).toBeVisible();
      await expect(science.locator('p')).toHaveText(LESSONS[index].detail);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (index === 0) {
        await page.locator('.explanation').screenshot({ path: `test-results/explanation-${width}.png` });
      }
      const curiosity = page.locator('.explanation-curiosity details');
      await expect(page.locator('.curiosity-lead')).toBeVisible();
      await expect(curiosity.locator('.curiosity-detail')).toBeHidden();
      await page.locator('#curiosity').focus();
      await page.keyboard.press('Enter');
      await expect(curiosity.locator('.curiosity-detail')).toBeVisible();
      await expect(page.getByRole('dialog')).toBeHidden();
      const curiosityText = await page.locator('.curiosity-lead').textContent();
      const curiosityRest = await curiosity.locator('.curiosity-detail > p').first().textContent();
      expect(`${curiosityText} ${curiosityRest}`).toBe(LESSONS[index].curious);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.keyboard.press('Enter');
      await expect(curiosity.locator('.curiosity-detail')).toBeHidden();
      if (index === 0) {
        await page.locator('.mission-workbench').screenshot({ path: `test-results/workbench-${width}.png` });
      }
      for (const id of ['glossary']) {
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
