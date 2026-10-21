import { test, expect } from '@playwright/test';

const block = (page, index) => page.locator(`[data-block="${index}"]`);
const temperature = async (page, index) => Number(await block(page, index).getAttribute('data-temperature'));

async function dragBlock(page, source, destination) {
  await source.evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
  const from = await source.boundingBox();
  const to = await destination.boundingBox();
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await page.mouse.up();
}

test('stack by keyboard, add another block, remove and reset with reduced motion', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-mission="2"]').click();
  await block(page, 3).focus();
  await page.keyboard.press('Enter');
  await block(page, 0).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.stack-tower [data-block]')).toHaveCount(2);
  await expect(page.locator('#scene-readout')).toContainText('2 bloques están a 50 °C');
  expect(await block(page, 3).locator('.block-front').getAttribute('fill')).toEqual(await block(page, 0).locator('.block-front').getAttribute('fill'));
  await block(page, 2).click();
  await page.locator('#stack-target').click();
  await expect(page.locator('#scene-readout')).toContainText('3 bloques están a 53 °C');
  await page.locator('#stack-remove').click();
  await expect(page.locator('.stack-shelf [data-block="2"]')).toBeVisible();
  expect(await temperature(page, 2)).toBeCloseTo(53.3333, 3);
  await page.locator('#scene-replay').click();
  await expect(page.locator('.stack-tower [data-block]')).toHaveCount(0);
  expect(await temperature(page, 0)).toBe(20);
  expect(await temperature(page, 3)).toBe(80);
  await expect(page.locator('#progress-label')).toHaveText('0 de 7 completadas');
});

test('pointer stacking animates temperature and color, supports pause and adding during exchange', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('[data-mission="2"]').click();
  const initialColor = await block(page, 3).locator('.block-front').getAttribute('fill');
  await dragBlock(page, block(page, 3), block(page, 0));
  await expect(page.locator('.stack-tower [data-block]')).toHaveCount(2);
  await expect.poll(() => temperature(page, 3)).toBeLessThan(79);
  expect(await temperature(page, 3)).toBeGreaterThan(50);
  expect(await block(page, 3).locator('.block-front').getAttribute('fill')).not.toEqual(initialColor);
  expect(await page.locator('.stack-tower [data-block]').evaluateAll((nodes) => nodes.reduce((total, node) => total + Number(node.dataset.temperature), 0))).toBeCloseTo(100, 5);
  await page.locator('#scene-pause').click();
  const paused = await temperature(page, 3);
  await page.waitForTimeout(200); // Assert stability across frames, rather than waiting for an action.
  expect(await temperature(page, 3)).toBe(paused);
  await page.locator('#scene-pause').click();
  await dragBlock(page, block(page, 2), page.locator('#stack-target'));
  await expect(page.locator('.stack-tower [data-block]')).toHaveCount(3);
  await expect(page.locator('#scene-readout')).toContainText('53 °C');
  await page.locator('#scene-pause').click();
  expect(await page.locator('.stack-tower [data-block]').evaluateAll((nodes) => nodes.reduce((total, node) => total + Number(node.dataset.temperature), 0))).toBeCloseTo(160, 5);
  await page.locator('#scene-pause').click();
  await expect(page.locator('#stack-state')).toHaveText('Misma temperatura, mismo color', { timeout: 25000 });
  await page.screenshot({ path: 'test-results/stack-desktop.png', fullPage: true });
  await block(page, 1).click();
  await page.locator('#stack-target').click();
  await expect(page.locator('#scene-pause')).toBeVisible();
  await page.locator('[data-mission="1"]').click();
  await expect(page.locator('#water-temperature')).toBeVisible();
  expect(errors).toEqual([]);
});

test.describe('touch input', () => {
  test.use({ hasTouch: true });

test('mobile touch selection, invalid drop and four-block stack fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('[data-mission="2"]').click();
  await dragBlock(page, block(page, 3), page.locator('h1'));
  await expect(page.locator('.stack-tower [data-block]')).toHaveCount(0);
  for (const index of [3, 0, 2, 1]) {
    await block(page, index).tap();
    await page.locator('#stack-target').tap();
  }
  await expect(page.locator('.stack-tower [data-block]')).toHaveCount(4);
  await expect(page.locator('#scene-readout')).toContainText('4 bloques están a 50 °C');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('#stack-target')).toBeDisabled();
  await page.screenshot({ path: 'test-results/stack-mobile.png', fullPage: true });
});

});
