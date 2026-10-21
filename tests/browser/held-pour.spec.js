import { test, expect } from '@playwright/test';
const card = (page, i) => page.locator(`[data-object="water${i}"]`);
async function hold(page, i) {
  const source = await card(page, i).locator('svg').boundingBox();
  const target = await card(page, 1).locator('svg').boundingBox();
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2);
}
test('held glass pours ten grams per tick, pauses away, resumes and stops on release', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.goto('/');
  await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'));
  await hold(page, 0);
  await page.clock.runFor(128);
  await expect(card(page, 1)).toContainText('110 g de agua');
  await expect(card(page, 1)).toContainText('29.1 °C');
  await expect(card(page, 0)).toContainText('90 g de agua');
  await page.mouse.move(10, 10);
  await page.clock.runFor(400);
  await expect(card(page, 1)).toContainText('110 g de agua');
  const target = await card(page, 1).locator('svg').boundingBox();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2);
  await page.clock.runFor(208);
  await expect(card(page, 1)).toContainText('130 g de agua');
  await page.mouse.up();
  await page.clock.runFor(500);
  await expect(card(page, 1)).toContainText('130 g de agua');
  await expect(card(page, 0).locator('svg')).not.toHaveClass(/pouring-glass/);
  await page.locator('#scene-replay').click();
  await expect(card(page, 1)).toContainText('100 g de agua');
});
test('both held pours empty safely into the center and cleanup on navigation', async ({ page }) => {
  await page.goto('/');
  for (const i of [0, 2]) {
    await hold(page, i);
    await expect(card(page, i)).toContainText('Vacío');
    await page.mouse.up();
  }
  await expect(card(page, 1)).toContainText('300 g de agua');
  await expect(card(page, 1)).toContainText('35 °C');
  await page.locator('#scene-replay').click();
  await hold(page, 0);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(card(page, 0).locator('svg')).not.toHaveClass(/pouring-glass/);
  await page.locator('[data-mission="1"]').click();
  await expect(page.locator('#mix-stream')).toHaveCount(0);
});
test('touch hold works on mobile with motion enabled', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto('/');
  await card(page, 1).scrollIntoViewIfNeeded();
  const source = await card(page, 0).locator('svg').boundingBox();
  const target = await card(page, 1).locator('svg').boundingBox();
  const point = b => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
  const session = await context.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(source)] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point(target)] });
  await expect(card(page, 1)).not.toContainText('100 g de agua');
  await page.screenshot({ path: 'test-results/held-pour-mobile.png' });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(card(page, 0).locator('svg')).not.toHaveClass(/pouring-glass/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});
