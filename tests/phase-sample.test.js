import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSample, advanceSample, bubbleActivity } from '../src/simulations/phaseSample.js';

test('illustrative bubbles increase continuously with warmth up to boiling', () => {
  for (const temperature of [-20, 0, 25, 40]) {
    assert.equal(bubbleActivity(temperature).count, 0);
    assert.equal(bubbleActivity(temperature).strength, 0);
  }
  const stages = [41, 50, 70, 90, 100].map(bubbleActivity);
  for (let i = 1; i < stages.length; i++) {
    for (const property of ['count', 'speed', 'radius']) {
      assert.ok(stages[i][property] > stages[i - 1][property]);
    }
  }
  assert.equal(stages.at(-1).count, 24);
  assert.deepEqual(bubbleActivity(120), bubbleActivity(100));
});

test('changing heat within the liquid phase smoothly adjusts and reverses bubble activity', () => {
  const sample = createSample('water', 25);
  advanceSample(sample, 'water', 0, false, 95);
  assert.equal(sample.temperature, 25);
  for (let i = 0; i < 120; i++) advanceSample(sample, 'water', 1 / 60, false, 95);
  assert.ok(sample.temperature > 94 && sample.temperature < 95);
  assert.ok(sample.bubbleClock > 0);
  const hot = structuredClone(sample);
  advanceSample(sample, 'water', 0, false, 25);
  assert.deepEqual(sample, hot);
  for (let i = 0; i < 120; i++) advanceSample(sample, 'water', 1 / 60, false, 25);
  assert.equal(bubbleActivity(sample.temperature).count, 0);
  advanceSample(sample, 'water', 0, true, 80);
  assert.equal(sample.temperature, 80);
});

test('phase views settle at the selected proportions in both directions', () => {
  const sample = createSample('water');
  for (const [phase, expected] of [
    ['ice', [1, 0, 0]], ['melting', [.5, .5, 0]], ['water', [0, 1, 0]],
    ['boiling', [0, .5, .5]], ['gas', [0, 0, 1]],
    ['boiling', [0, .5, .5]], ['water', [0, 1, 0]], ['melting', [.5, .5, 0]], ['ice', [1, 0, 0]],
  ]) {
    for (let i = 0; i < 80; i++) {
      advanceSample(sample, phase, 1 / 60);
      assert.ok(sample.weights.every((weight) => Number.isFinite(weight) && weight >= 0 && weight <= 1));
      assert.ok(Math.abs(sample.weights.reduce((sum, weight) => sum + weight, 0) - 1) < 1e-10);
    }
    assert.deepEqual(sample.weights, expected);
  }
});

test('reversal starts from the visible proportions without jumping or restarting on repeated input', () => {
  const sample = createSample('ice');
  for (let i = 0; i < 30; i++) advanceSample(sample, 'water', 1 / 60);
  const visible = [...sample.weights];
  assert.ok(visible[0] > 0 && visible[0] < 1);
  advanceSample(sample, 'ice', 0);
  assert.deepEqual(sample.weights, visible);
  advanceSample(sample, 'ice', 1 / 60);
  assert.ok(sample.weights[0] > visible[0]);
  assert.ok(sample.weights[0] - visible[0] < .01);
});

test('reduced motion snaps and zero elapsed time preserves the image', () => {
  const sample = createSample('water');
  advanceSample(sample, 'gas', 0, true);
  assert.deepEqual(sample.weights, [0, 0, 1]);
  assert.equal(sample.clock, 0);
  const paused = structuredClone(sample);
  advanceSample(sample, 'gas', 0);
  assert.deepEqual(sample, paused);
});
