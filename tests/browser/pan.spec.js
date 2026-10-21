import { test, expect } from '@playwright/test';

// Checkpoint behavior is covered in exercise-overlay.spec.js.
test.beforeEach(async ({ page }) => {
  await page.addLocatorHandler(page.getByRole('button', { name: 'Cerrar reto' }), async button => { await button.click(); });
});

const piece = (page, id) => page.locator(`[data-object="${id}"]`);
const scene = (page) => page.locator('.pan-lab');
async function enter(page) {
  await page.goto('/');
  await page.locator('[data-mission="6"]').click();
}
async function place(page, id, target) {
  await piece(page, id).click();
  await piece(page, target).click();
  await expect(page.locator(`[data-placement="${target}"] [data-object="${id}"]`)).toHaveCount(1);
}

test('empty silhouettes, wrong destination, keyboard and all material combinations', async ({ page }) => {
  await enter(page);
  await expect(page.locator('.pan-empty')).toHaveCount(2);
  await expect(page.locator('.object-selected')).toHaveCount(0);
  await piece(page, 'copper-body').click();
  await piece(page, 'handle').click();
  await expect(page.locator('.pan-empty')).toHaveCount(2);
  for (const body of ['copper-body', 'steel-body']) {
    for (const handle of ['wood-handle', 'copper-handle']) {
      await page.locator('#scene-replay').click();
      await piece(page, handle).focus();
      await page.keyboard.press('Enter');
      await piece(page, 'handle').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('.pan-empty')).toHaveCount(1);
      await expect(scene(page)).toHaveAttribute('data-phase', 'incomplete');
      await place(page, body, 'body');
      await expect(scene(page)).toHaveAttribute('data-phase', 'result');
      await expect(page.locator('#scene-readout')).toContainText(handle === 'wood-handle' ? 'El cuerpo conduce' : 'también se calienta');
      await expect(page.locator('.pan-assembly')).toHaveAttribute('transform', 'translate(235 205)');
      await expect(scene(page)).not.toHaveClass(/pan-burning/);
    }
  }
});

test('assembly, descent, paused flame, restart and navigation clean up', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await enter(page);
  await place(page, 'copper-body', 'body');
  await place(page, 'wood-handle', 'handle');
  await expect(scene(page)).toHaveAttribute('data-phase', 'assembling');
  await expect(piece(page, 'steel-body')).toBeDisabled();
  await expect(scene(page)).toHaveAttribute('data-phase', 'moving');
  await expect(scene(page)).toHaveAttribute('data-phase', 'heating');
  await expect(scene(page)).toHaveClass(/pan-burning/);
  await page.locator('#scene-pause').click();
  const position = await page.locator('.pan-body-heat').getAttribute('opacity');
  await expect(page.locator('.pan-flame').first()).toHaveCSS('animation-play-state', 'paused');
  await page.waitForTimeout(200);
  await expect(page.locator('.pan-body-heat')).toHaveAttribute('opacity', position);
  await page.screenshot({ path: 'test-results/pan-heating-desktop.png', fullPage: true });
  await page.locator('#scene-pause').click();
  await expect(scene(page)).toHaveAttribute('data-phase', 'result');
  await place(page, 'copper-handle', 'handle');
  await page.locator('#scene-replay').click();
  await expect(page.locator('.pan-empty')).toHaveCount(2);
  await expect(page.locator('.placement-ghost')).toHaveCount(0);
  await piece(page, 'steel-body').click();
  await piece(page, 'body').click();
  await page.locator('[data-mission="5"]').click();
  await expect(page.locator('.placement-ghost')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('drag to a silhouette works and a reset cancels an active placement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await enter(page);
  const from = await piece(page, 'steel-body').boundingBox();
  const to = await piece(page, 'body').boundingBox();
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await page.mouse.up();
  await expect(page.locator('[data-placement="body"] [data-object="steel-body"]')).toBeVisible();
  await expect(page.locator('.pan-empty')).toHaveCount(1);
  await piece(page, 'wood-handle').click();
  await piece(page, 'handle').click();
  await page.locator('#scene-replay').click();
  await expect(page.locator('.pan-empty')).toHaveCount(2);
  await expect(page.locator('.placement-ghost')).toHaveCount(0);
});

test.describe('mobile touch', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test('initial shadows and automatic assembly fit the screen', async ({ page }) => {
    await enter(page);
    await page.screenshot({ path: 'test-results/pan-empty-mobile.png', fullPage: true });
    for (const [id, target] of [['wood-handle', 'handle'], ['steel-body', 'body']]) {
      await piece(page, id).tap();
      await piece(page, target).tap();
    }
    await expect(scene(page)).toHaveAttribute('data-phase', 'result');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: 'test-results/pan-result-mobile.png', fullPage: true });
  });
});
