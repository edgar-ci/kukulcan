import { test, expect } from '@playwright/test';

// Checkpoint behavior is covered in exercise-overlay.spec.js.
test.beforeEach(async ({ page }) => {
  await page.addLocatorHandler(page.getByRole('button', { name: 'Cerrar reto' }), async button => { await button.click(); });
});

async function selectTemperature(page, temperature) {
  await page.locator('#water-temperature').fill(String(temperature));
}

test('warming adds small bubbles progressively and removes them when cold or fully gaseous', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-mission="1"]').click();
  const bubbles = page.locator('.sample-bubbles circle');
  const visibleCount = () => bubbles.evaluateAll((nodes) => nodes.filter((node) => Number(node.getAttribute('opacity')) > 0).length);
  let previousCount = 0;
  for (const temperature of [25, 40, 50, 70, 90, 100]) {
    await selectTemperature(page, temperature);
    const count = await visibleCount();
    if (temperature <= 40) expect(count).toBe(0);
    else {
      expect(count).toBeGreaterThan(previousCount);
      previousCount = count;
    }
    if (temperature > 40 && temperature < 100) {
      await expect(page.locator('#phase-caption')).toContainText('todavía no hierve');
    }
    await page.locator('.phase-sample').screenshot({ path: `test-results/bubbles-${temperature}.png` });
  }
  const still = await page.locator('.sample-bubbles').innerHTML();
  await page.waitForTimeout(100);
  expect(await page.locator('.sample-bubbles').innerHTML()).toBe(still);
  for (const temperature of [120, 25, -20]) {
    await selectTemperature(page, temperature);
    expect(await visibleCount()).toBe(0);
  }
  await page.locator('#phase-science').click();
  await expect(page.getByRole('dialog')).toContainText('no como umbral físico');
});

test('all sample states are readable with reduced motion on desktop and mobile', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-mission="1"]').click();
  for (const width of [1200, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [temperature, phase, opacity] of [
      [-20, 'ice', [1, 0, 0]], [0, 'melting', [1, 1, 0]], [25, 'water', [0, 1, 0]],
      [100, 'boiling', [0, 1, .5]], [120, 'gas', [0, 0, 1]],
    ]) {
      await selectTemperature(page, temperature);
      await expect(page.locator('.phase-lab')).toHaveAttribute('data-phase', phase);
      for (const [i, id] of ['phase-ice', 'phase-liquid', 'phase-vapor'].entries()) {
        await expect(page.locator(`#${id}`)).toHaveAttribute('opacity', String(opacity[i]));
      }
      await expect(page.locator('.phase-particles circle')).toHaveCount(64);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width !== 320) await page.locator('.phase-lab').screenshot({ path: `test-results/phase-${width}-${phase}.png` });
    }
  }
  await expect(page.locator('#scene-pause')).toBeHidden();
  const staticFrame = await page.locator('.phase-glass').innerHTML();
  await page.waitForTimeout(100);
  expect(await page.locator('.phase-glass').innerHTML()).toBe(staticFrame);
});

test('sample reverses smoothly, pauses all effects, and cleans up on navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.locator('[data-mission="1"]').click();
  await selectTemperature(page, -20);
  await expect(page.locator('#phase-liquid')).toHaveAttribute('opacity', '0');
  await selectTemperature(page, 25);
  await expect.poll(async () => Number(await page.locator('#phase-liquid').getAttribute('opacity'))).toBeGreaterThan(0);
  await page.locator('#scene-pause').click();
  const intermediate = await page.locator('.phase-glass').innerHTML();
  await page.locator('.phase-sample').screenshot({ path: 'test-results/phase-melting-intermediate.png' });
  await page.waitForTimeout(120);
  expect(await page.locator('.phase-glass').innerHTML()).toBe(intermediate);
  const pausedIce = await page.locator('#phase-ice').innerHTML();
  await selectTemperature(page, -20);
  // Retargeting while paused must preserve the exact geometry already on screen.
  expect(await page.locator('#phase-ice').innerHTML()).toBe(pausedIce);
  await page.locator('#scene-pause').click();
  await expect(page.locator('#phase-liquid')).toHaveAttribute('opacity', '0');
  await selectTemperature(page, 100);
  await expect(page.locator('#phase-vapor')).toHaveAttribute('opacity', '0.5');
  await page.locator('.phase-sample').screenshot({ path: 'test-results/phase-boiling-animated.png' });
  await page.locator('#scene-pause').click();
  const boiling = await page.locator('.phase-glass').innerHTML();
  await page.waitForTimeout(120);
  expect(await page.locator('.phase-glass').innerHTML()).toBe(boiling);
  await page.locator('[data-mission="2"]').click();
  await page.locator('[data-mission="1"]').click();
  await expect(page.locator('.phase-glass')).toHaveCount(1);
  await expect(page.locator('#water-temperature')).toHaveValue('25');
  expect(errors).toEqual([]);
});

test('particle design preserves molecule size and pauses spheres, lattice and trails', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('[data-mission="1"]').click();
  await expect(page.getByText('Mismas 64 moléculas · distinto movimiento', { exact: true })).toHaveCount(0);
  await selectTemperature(page, 120);
  const spheres = page.locator('.particle-spheres circle');
  const before = await spheres.first().getAttribute('cx');
  await expect.poll(() => spheres.first().getAttribute('cx')).not.toBe(before);
  await expect.poll(() => page.locator('.particle-trails path').first().getAttribute('opacity')).not.toBe('0');
  await page.locator('#scene-pause').click();
  const paused = await page.locator('.phase-particles svg').innerHTML();
  await page.waitForTimeout(150);
  expect(await page.locator('.phase-particles svg').innerHTML()).toBe(paused);
  expect(await spheres.evaluateAll(nodes => nodes.every(node => node.getAttribute('r') === '5.5'))).toBe(true);
  await page.locator('.phase-card').screenshot({ path: 'test-results/particles-moving.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('#scene-pause')).toBeHidden();
  for (const temperature of [-20, 25, 120]) {
    await selectTemperature(page, temperature);
    const staticFrame = await page.locator('.phase-particles svg').innerHTML();
    await page.waitForTimeout(80);
    expect(await page.locator('.phase-particles svg').innerHTML()).toBe(staticFrame);
    await page.locator('.phase-card').screenshot({ path: `test-results/particles-${temperature}.png` });
  }
  await page.locator('#particle-definition').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toContainText('Una lupa imaginaria');
});

test('temperature colors change particles and background continuously and reverse on cooling', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-mission="1"]').click();
  const panel = page.locator('.phase-particles');
  const palette = () => panel.evaluate(element => ({
    body: getComputedStyle(element).getPropertyValue('--particle-body'),
    background: getComputedStyle(element).backgroundImage,
    sphere: getComputedStyle(element.querySelector('#molecule-sphere stop[offset=".72"]')).stopColor,
  }));
  const colors = [];
  for (const temperature of [-20, 25, 60, 100, 120]) {
    await selectTemperature(page, temperature);
    colors.push(await palette());
    await page.locator('.phase-card').screenshot({ path: `test-results/particle-color-${temperature}.png` });
  }
  expect(new Set(colors.map(color => color.body)).size).toBe(5);
  expect(new Set(colors.map(color => color.background)).size).toBe(5);
  expect(new Set(colors.map(color => color.sphere)).size).toBe(5);
  await selectTemperature(page, -20);
  expect(await palette()).toEqual(colors[0]);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const initial = await palette();
  await selectTemperature(page, 120);
  await expect.poll(async () => (await palette()).body).not.toBe(initial.body);
  await page.locator('#scene-pause').click();
  const paused = await palette();
  await page.waitForTimeout(150);
  expect(await palette()).toEqual(paused);
});
