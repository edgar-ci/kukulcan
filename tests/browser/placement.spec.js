import { test, expect } from '@playwright/test';

const object = (page, id) => page.locator(`[data-object="${id}"]`);
const placed = (page, target, source) => page.locator(`[data-placement="${target}"] [data-object="${source}"]`);
async function move(page, source, destination) {
  await object(page, source).click();
  await object(page, destination).click();
  await expect(placed(page, destination, source)).toBeVisible({ timeout: 8000 });
}

test('coat moves between vessels with keyboard and leaves its original space empty', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-mission="4"]').click();
  await object(page, 'coat').focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(object(page, 'left')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(placed(page, 'left', 'coat')).toBeVisible();
  await expect(page.locator('[data-home="coat"]')).toBeEmpty();
  await move(page, 'coat', 'right');
  await expect(page.locator('[data-placement="left"]')).toBeEmpty();
  await expect(object(page, 'left')).not.toHaveClass(/insulated/);
  await expect(object(page, 'right')).toHaveClass(/insulated/);
  await object(page, 'clock').click();
  await expect(page.locator('#scene-readout')).toContainText('Con funda: 34.8');
  await page.locator('#scene-replay').click();
  await expect(page.locator('[data-home="coat"] [data-object="coat"]')).toBeVisible();
});

test('replacing pan parts returns the old card to its home on mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('[data-mission="6"]').click();
  await move(page, 'copper-body', 'body');
  await move(page, 'copper-handle', 'handle');
  await expect(page.locator('.pan-lab')).toHaveAttribute('data-phase', 'result', { timeout: 8000 });
  await move(page, 'steel-body', 'body');
  await expect(page.locator('.pan-lab')).toHaveAttribute('data-phase', 'result', { timeout: 8000 });
  await expect(page.locator('[data-home="copper-body"] [data-object="copper-body"]')).toBeVisible();
  await move(page, 'wood-handle', 'handle');
  await expect(page.locator('[data-home="wood-handle"]')).toBeEmpty();
  await expect(page.locator('[data-home="copper-handle"] [data-object]')).toBeVisible();
  await expect(page.locator('#scene-readout')).toContainText('El cuerpo conduce', { timeout: 8000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/placement-mobile.png', fullPage: true });
});

test('drag flies from release position, lands, and cleans up when navigating', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('[data-mission="4"]').click();
  const source = await object(page, 'coat').boundingBox();
  const target = await object(page, 'right').boundingBox();
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('.placement-ghost')).toHaveCount(1);
  await expect(placed(page, 'right', 'coat')).toBeVisible();
  await expect(page.locator('.placement-ghost')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/placement-desktop.png', fullPage: true });
  await object(page, 'coat').click();
  await object(page, 'left').click();
  await expect(page.locator('.placement-ghost')).toHaveCount(1);
  await page.locator('[data-mission="5"]').click();
  await expect(page.locator('.placement-ghost')).toHaveCount(0);
  expect(errors).toEqual([]);
});


test.describe('touch placement', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test('tap selection connects illustrated instruments with motion enabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.locator('[data-mission="5"]').tap();
    await object(page, 'unit0').tap();
    await object(page, 'match0').tap();
    await expect(page.locator('.connector-line')).toHaveCount(1);
    await expect(object(page, 'unit0')).toBeDisabled();
    await expect(page.locator('#scene-readout')).toContainText('1 de 3 encargos resueltos');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: 'test-results/placement-instrument-mobile.png', fullPage: true });
  });
});
