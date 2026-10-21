import { test, expect } from '@playwright/test';
import { completeExperiment } from './complete-experiment.js';
import { LESSONS, FINAL_QUIZ } from '../../src/data/content.js';

test('all missions, challenges, final quiz and saved progress work', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  for (let index = 0; index < 7; index++) {
    await page.locator(`[data-mission="${index}"]`).click();
    await expect(page.locator('h1')).toHaveText(LESSONS[index].title);
    await expect(page.locator('#scene-goal')).not.toBeEmpty();
    await expect(page.locator('.challenge')).toHaveCount(0);
    await completeExperiment(page, index);
    await expect(page.getByRole('dialog')).toContainText('PONLO A PRUEBA');
    await page.locator('.challenge .answer').nth(LESSONS[index].answer).click();
    await expect(page.getByRole('dialog')).toContainText('¡Lo lograste!');
    await expect(page.locator('#progress-label')).toHaveText(`${index + 1} de 7 completadas`);
    await page.getByRole('button', { name: 'Seguir experimentando', exact: true }).click();
  }
  await page.reload();
  await expect(page.locator('#progress-label')).toHaveText('7 de 7 completadas');
  await expect(page.locator('h1')).toHaveText(LESSONS[6].title);
  await page.locator('#final-link').click();
  for (let index = 0; index < 5; index++) {
    await page.locator('.final-card').nth(index).locator('.answer').nth(FINAL_QUIZ[index][2]).click();
  }
  await expect(page.locator('#final-result')).toContainText('¡Resolviste los cinco casos!');
  await page.locator('#back-missions').click();
  await page.locator('#reset-progress').click();
  await page.locator('#confirm-reset').click();
  await expect(page.locator('#progress-label')).toHaveText('0 de 7 completadas');
  await page.reload();
  await expect(page.locator('#progress-label')).toHaveText('0 de 7 completadas');
  expect(errors).toEqual([]);
});

test('reference dialogs, converter and sorting remain interactive', async ({ page }) => {
  await page.goto('/');
  await page.locator('#library').click();
  await expect(page.getByRole('dialog')).toContainText('Conexiones Física');
  await page.keyboard.press('Escape');
  await expect(page.locator('#library')).toBeFocused();
  await page.locator('#glossary').click();
  await expect(page.getByRole('dialog')).toContainText('Energía cinética');
  await page.locator('#close-modal').click();
  await page.locator('[data-mission="3"]').click();
  await page.locator('#converter').click();
  await page.getByLabel('Energía', { exact: true }).fill('2');
  await page.getByLabel('Unidad', { exact: true }).selectOption('kcal');
  await expect(page.locator('#conversion-result')).toContainText('8,374 J');
  await page.getByLabel('Energía', { exact: true }).fill('-1');
  await expect(page.locator('#conversion-result')).toContainText('Escribe un número');
  await page.keyboard.press('Escape');
  await page.locator('#explore-calorimeter').click();
  await page.getByRole('button', { name: 'Agitador', exact: true }).click();
  await expect(page.locator('#part-description')).toContainText('distribuir la temperatura');
  await page.keyboard.press('Escape');
  await page.locator('[data-mission="6"]').click();
  await page.locator('#compare-materials').click();
  await expect(page.locator('tbody tr')).toHaveCount(8);
  await page.locator('#sort-materials').click();
  await expect(page.locator('tbody tr').first()).toContainText('Cobre');
});

test('mixing, particle keyboard control and navigation during animation', async ({ page }) => {
  await page.addLocatorHandler(page.getByRole('button', { name: 'Cerrar reto' }), async button => { await button.click(); });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.locator('[data-object="water0"]').click();
  await page.locator('[data-object="water2"]').click();
  await expect(page.locator('[data-object="water2"]')).toContainText('22 °C');
  await page.locator('[data-mission="1"]').click();
  const range = page.locator('#water-temperature');
  await range.focus();
  await page.keyboard.press('End');
  await expect(range).toHaveValue('120');
  await page.keyboard.press('Home');
  await expect(range).toHaveValue('-20');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('#scene-pause')).toBeVisible();
  await page.locator('#scene-pause').click();
  await expect(page.locator('#scene-pause')).toContainText('Continuar');
  await page.locator('[data-mission="2"]').click();
  await expect(page.locator('h1')).toHaveText(LESSONS[2].title);
  await page.locator('[data-mission="1"]').click();
  await expect(page.locator('#water-temperature')).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile layout and unavailable storage', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('unavailable'); } });
  });
  await page.goto('/');
  await expect(page.locator('#storage-note')).toHaveText('Progreso disponible solo durante esta sesión.');
  for (let index = 0; index < 7; index++) {
    await page.locator(`[data-mission="${index}"]`).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
});

test('equilibrium, matching, insulation, instruments and pan interactions', async ({ page }) => {
  await page.goto('/');
  const object = (id) => page.locator(`[data-object="${id}"]`);
  await page.locator('[data-mission="2"]').click();
  await page.locator('[data-block="3"]').click();
  await page.locator('[data-block="0"]').click();
  await expect(page.locator('#scene-readout')).toContainText('2 bloques están a 50 °C');
  await page.locator('[data-mission="3"]').click();
  for (let index = 0; index < 3; index++) {
    await object(`unit${index}`).click();
    await object(`match${index}`).click();
  }
  await expect(page.locator('#scene-readout')).toHaveText('3 de 3 parejas encontradas');
  await page.locator('[data-mission="4"]').click();
  await object('coat').click();
  await object('left').click();
  await object('clock').click();
  await expect(page.locator('#scene-readout')).toContainText('Con funda: 34.8 °C');
  await page.locator('[data-mission="5"]').click();
  for (let index = 0; index < 3; index++) {
    await object(`unit${index}`).click();
    await object(`match${index}`).click();
    await expect(page.locator('#scene-readout')).toContainText(`${index + 1} de 3 encargos resueltos`);
  }
  await page.locator('[data-mission="6"]').click();
  await object('copper-body').click();
  await object('body').click();
  await object('wood-handle').click();
  await object('handle').click();
  await expect(page.locator('#scene-readout')).toContainText('El cuerpo conduce y el mango dificulta');
  await expect(page.locator('#progress-label')).toHaveText('0 de 7 completadas');
});
