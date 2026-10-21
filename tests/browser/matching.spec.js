import { test, expect } from '@playwright/test';

const card = (page, id) => page.locator(`[data-object="${id}"]`);
const lines = page => page.locator('.connector-line');
async function start(page, mission = 3) {
  await page.goto('/');
  await page.locator(`[data-mission="${mission}"]`).click();
}
async function dragTo(page, source, target) {
  await card(page, source).evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
  const a = await card(page, source).boundingBox();
  const b = target ? await card(page, target).boundingBox() : { x: 5, y: 5, width: 0, height: 0 };
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 });
}

test('click and keyboard connect only equivalent cards, retain colors and reset', async ({ page }) => {
  await start(page);
  await card(page, 'unit0').click();
  await card(page, 'match1').click();
  await expect(lines(page)).toHaveCount(0);
  await expect(page.locator('#scene-bubble')).toContainText('Todavía no coinciden');
  await card(page, 'match0').click();
  await expect(lines(page)).toHaveCount(1);
  await expect(card(page, 'unit0')).toBeDisabled();
  for (const i of [1, 2]) {
    await card(page, `unit${i}`).focus();
    await page.keyboard.press('Space');
    await card(page, `match${i}`).focus();
    await page.keyboard.press('Enter');
  }
  await expect(lines(page)).toHaveCount(3);
  const colors = await lines(page).evaluateAll(elements => elements.map(el => el.getAttribute('stroke')));
  expect(new Set(colors).size).toBe(3);
  await expect(page.locator('#scene-readout')).toContainText('3 de 3');
  await page.getByRole('button', { name: 'Cerrar reto' }).click();
  await expect(page.locator('#scene-replay')).toBeFocused();
  await page.locator('#scene-replay').click();
  await expect(lines(page)).toHaveCount(0);
  await expect(card(page, 'unit0')).toBeEnabled();
});

test('drag previews without moving cards, cancels and rejects wrong destinations', async ({ page }) => {
  await start(page);
  const relativeBox = () => card(page, 'unit0').evaluate(element => {
    const card = element.getBoundingClientRect();
    const grid = element.closest('.matching-grid').getBoundingClientRect();
    return { x: card.x - grid.x, y: card.y - grid.y, width: card.width, height: card.height, transform: getComputedStyle(element).transform };
  });
  const original = await relativeBox();
  await dragTo(page, 'unit0', 'match1');
  await expect(page.locator('.connector-preview')).toHaveCount(1);
  expect(await relativeBox()).toEqual(original);
  await page.mouse.up();
  await expect(lines(page)).toHaveCount(0);
  await expect(page.locator('.connector-preview')).toHaveCount(0);
  await dragTo(page, 'unit0', null);
  await page.mouse.up();
  await expect(card(page, 'unit0')).toHaveAttribute('aria-pressed', 'false');
  await dragTo(page, 'unit0', 'match0');
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(lines(page)).toHaveCount(0);
  await expect(page.locator('.connector-preview')).toHaveCount(0);
  await dragTo(page, 'unit0', 'match0');
  await page.mouse.up();
  await expect(lines(page)).toHaveCount(1);
});

test('connectors stay anchored after resize and clean up during animation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await start(page);
  await card(page, 'unit0').click();
  await card(page, 'match0').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(async () => page.evaluate(() => {
    const grid = document.querySelector('.matching-grid').getBoundingClientRect();
    const source = document.querySelector('[data-object="unit0"]').getBoundingClientRect();
    const target = document.querySelector('[data-object="match0"]').getBoundingClientRect();
    const path = document.querySelector('.connector-line');
    const start = path.getPointAtLength(0), end = path.getPointAtLength(path.getTotalLength());
    return Math.max(Math.abs(start.x - source.right + grid.left), Math.abs(start.y - source.top - source.height / 2 + grid.top), Math.abs(end.x - target.left + grid.left), Math.abs(end.y - target.top - target.height / 2 + grid.top));
  })).toBeLessThan(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/matching-mobile.png', fullPage: true });
  await card(page, 'unit1').click();
  await card(page, 'match1').click();
  await page.locator('[data-mission="4"]').click();
  await expect(page.locator('.matching-connectors')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test.describe('touch connections', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test('touch drag connects and reduced motion settles immediately', async ({ page }) => {
    await start(page);
    const source = await card(page, 'unit2').boundingBox();
    const target = await card(page, 'match2').boundingBox();
    const session = await page.context().newCDPSession(page);
    const point = box => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(source)] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point(target)] });
    await expect(page.locator('.connector-preview')).toHaveCount(1);
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(lines(page)).toHaveCount(1);
    await expect(card(page, 'match2')).toBeDisabled();
    const shape = await lines(page).getAttribute('d');
    await card(page, 'unit0').tap();
    await card(page, 'match0').tap();
    expect(await lines(page).first().getAttribute('d')).toBe(shape);
    await session.detach();
  });
});

test('instruments use images, reject wrong pairs, connect by drag and keyboard, and reset', async ({ page }) => {
  await start(page, 5);
  await expect(page.locator('.instrument-matching .lab-object svg')).toHaveCount(6);
  await card(page, 'match0').click();
  await expect(page.locator('#scene-bubble')).toContainText('Selecciona primero');
  await card(page, 'unit0').click();
  await card(page, 'match1').click();
  await expect(lines(page)).toHaveCount(0);
  await expect(page.locator('#scene-bubble')).toContainText('Revisa tanto el rango');
  await dragTo(page, 'unit0', 'match0');
  await page.mouse.up();
  await expect(lines(page)).toHaveCount(1);
  for (const i of [1, 2]) {
    await card(page, `unit${i}`).focus();
    await page.keyboard.press('Space');
    await card(page, `match${i}`).focus();
    await page.keyboard.press('Enter');
  }
  await expect(lines(page)).toHaveCount(3);
  await page.getByRole('button', { name: 'Cerrar reto' }).click();
  await expect(page.locator('#scene-replay')).toBeFocused();
  await page.screenshot({ path: 'test-results/instruments-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/instruments-mobile.png', fullPage: true });
  await page.locator('#scene-replay').click();
  await expect(lines(page)).toHaveCount(0);
  await expect(card(page, 'unit0')).toBeEnabled();
  await page.locator('[data-mission="4"]').click();
  await expect(page.locator('.matching-connectors')).toHaveCount(0);
});
