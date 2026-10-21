import { test, expect } from '@playwright/test';

// Checkpoint behavior is covered in exercise-overlay.spec.js.
test.beforeEach(async ({ page }) => {
  await page.addLocatorHandler(page.getByRole('button', { name: 'Cerrar reto' }), async button => { await button.click(); });
});
const card = (page, i) => page.locator(`[data-object="water${i}"]`);
test('center stays fixed and cannot be selected as a pouring source', async ({ page }) => {
  await page.goto('/');
  const center = card(page, 1);
  await center.click();
  await expect(center).not.toHaveClass(/object-selected|draggable/);
  await expect(page.locator('#scene-bubble')).toContainText('El vaso central está fijo');
  await card(page, 0).click();
  await expect(card(page, 0)).toHaveClass(/object-selected/);
  await expect(center).toContainText('100 g de agua');
  await center.focus();
  await page.keyboard.press('Enter');
  await expect(center).toContainText('125 g de agua');
  await center.focus();
  await page.keyboard.press('Enter');
  await expect(center).not.toHaveClass(/object-selected/);
  await expect(center.locator('svg')).not.toHaveClass(/pouring-glass/);
});
async function hold(page, i) {
  const source = await card(page, i).locator('svg').boundingBox();
  const target = await card(page, 1).locator('svg').boundingBox();
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2);
}
test('released glass returns gradually without pouring more water', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.goto('/');
  await hold(page, 0);
  await page.clock.runFor(400);
  await page.mouse.up();
  const glass = card(page, 0).locator('svg');
  const mass = await card(page, 1).locator('.object-sub').textContent();
  const released = await glass.evaluate(el => el.style.transform);
  await page.clock.runFor(400);
  await expect(glass).toHaveClass(/pouring-glass/);
  const halfway = await glass.evaluate(el => el.style.transform);
  expect(halfway).not.toBe(released);
  expect(halfway).not.toBe('');
  await page.clock.runFor(500);
  await expect(glass).not.toHaveClass(/pouring-glass/);
  expect(await glass.evaluate(el => el.style.transform)).toBe('');
  await expect(card(page, 1).locator('.object-sub')).toHaveText(mass);
});
test('held glass pours five grams every 150 ms, pauses away, resumes and stops on release', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.goto('/');
  await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'));
  await hold(page, 0);
  await page.clock.runFor(176);
  await expect(card(page, 1)).toContainText('105 g de agua');
  await expect(card(page, 1)).toContainText('27.1 °C');
  await expect(card(page, 0)).toContainText('95 g de agua');
  await page.mouse.move(10, 10);
  await page.clock.runFor(400);
  await expect(card(page, 1)).toContainText('105 g de agua');
  const target = await card(page, 1).locator('svg').boundingBox();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2);
  await page.clock.runFor(304);
  await expect(card(page, 1)).toContainText('115 g de agua');
  await page.mouse.up();
  await page.clock.runFor(500);
  await expect(card(page, 1)).toContainText('115 g de agua');
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

test('tap pouring lands on the surface, pauses every effect, and preserves the result', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.goto('/');
  await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'));
  for (const [source, width, expected] of [[0, 1200, '34 °C'], [2, 390, '22 °C']]) {
    await page.setViewportSize({ width, height: 900 });
    await card(page, source).focus();
    await page.keyboard.press('Enter');
    await card(page, 1).focus();
    await page.keyboard.press('Enter');
    await page.clock.runFor(1600);
    await expect(page.locator('#mix-stream')).toHaveCSS('opacity', '1');
    const endpoint = await page.evaluate(() => {
      const receiver = document.querySelector('[data-object="water1"] .mix-glass');
      const surface = Number(receiver.querySelector('.glass-surface').getAttribute('cy'));
      const expected = new DOMPoint(80, surface).matrixTransform(receiver.getScreenCTM());
      const overlay = document.querySelector('#mix-stream');
      const bounds = overlay.getBoundingClientRect();
      const coordinates = overlay.querySelector('.pour-stream-body').getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);
      return { actual: coordinates.slice(-2), expected: [expected.x - bounds.x, expected.y - bounds.y] };
    });
    expect(endpoint.actual[0]).toBeCloseTo(endpoint.expected[0], 3);
    expect(endpoint.actual[1]).toBeCloseTo(endpoint.expected[1], 3);
    await page.locator('#scene-pause').click();
    const stream = await page.locator('#mix-stream').innerHTML();
    const ripples = await card(page, 1).locator('.glass-ripples').innerHTML();
    await page.clock.runFor(300);
    expect(await page.locator('#mix-stream').innerHTML()).toBe(stream);
    expect(await card(page, 1).locator('.glass-ripples').innerHTML()).toBe(ripples);
    await page.locator('.mix-row').screenshot({ path: `test-results/pour-improved-${width}.png` });
    await page.locator('#scene-pause').click();
    await page.clock.runFor(2400);
    await expect(card(page, 1)).toContainText('125 g de agua');
    await expect(card(page, 1)).toContainText(expected);
    await expect(page.locator('#mix-stream')).toHaveCSS('opacity', '0');
    await page.locator('#scene-replay').click();
  }
});
