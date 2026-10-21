export async function completeExperiment(page, index) {
  const object = id => page.locator(`[data-object="${id}"]`);
  if (index === 0) {
    for (const source of [0, 2]) {
      for (let pour = 0; pour < 4; pour++) {
        await object(`water${source}`).click();
        await object('water1').click();
      }
    }
  } else if (index === 1) {
    const range = page.locator('#water-temperature');
    await range.focus();
    await page.keyboard.press('Home');
    await page.keyboard.press('End');
  } else if (index === 2) {
    await page.locator('[data-block="3"]').click();
    await page.locator('[data-block="0"]').click();
  } else if (index === 3 || index === 5) {
    for (let i = 0; i < 3; i++) {
      await object(`unit${i}`).click();
      await object(`match${i}`).click();
    }
  } else if (index === 4) {
    await object('coat').click();
    await object('left').click();
    await object('clock').click();
  } else {
    await object('copper-body').click();
    await object('body').click();
    await object('wood-handle').click();
    await object('handle').click();
  }
}
