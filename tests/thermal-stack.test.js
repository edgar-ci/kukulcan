import assert from 'node:assert/strict';
import { test } from 'node:test';
import { advanceTemperatures, equilibriumTemperature, temperatureColor } from '../src/simulations/thermal-stack.js';

const sum = (values) => values.reduce((total, value) => total + value, 0);

test('contact exchanges heat only between adjacent blocks and conserves energy', () => {
  const source = [20, 20, 80];
  const next = advanceTemperatures(source, 0.05);
  assert.deepEqual(source, [20, 20, 80]);
  assert.equal(next[0], 20);
  assert.ok(next[1] > 20 && next[2] < 80);
  assert.equal(sum(next), sum(source));
  assert.deepEqual(advanceTemperatures(source, 0), source);
});

test('all stack orders converge to the same mean without overshooting', () => {
  for (const initial of [[20, 80], [80, 20], [20, 40, 60, 80], [80, 20, 60, 40]]) {
    let values = initial;
    for (let frame = 0; frame < 3000; frame++) {
      values = advanceTemperatures(values, 1 / 60);
      assert.ok(Math.abs(sum(values) - sum(initial)) < 1e-8);
      assert.ok(values.every((value) => value >= Math.min(...initial) && value <= Math.max(...initial)));
    }
    assert.ok(values.every((value) => Math.abs(value - 50) < 1e-6));
  }
});

test('adding a block changes the target and equal temperatures do not exchange heat', () => {
  assert.equal(equilibriumTemperature([50, 50, 20]), 40);
  assert.deepEqual(advanceTemperatures([50, 50], 1 / 60), [50, 50]);
  assert.deepEqual(advanceTemperatures([80], 1 / 60), [80]);
  assert.deepEqual(advanceTemperatures([20, 80], 1000), advanceTemperatures([20, 80], 0.05));
  assert.throws(() => advanceTemperatures([20, 80], -1), RangeError);
  assert.throws(() => equilibriumTemperature([]), RangeError);
  assert.throws(() => equilibriumTemperature([NaN]), RangeError);
});

test('temperature colors are continuous, bounded, and independent of block identity', () => {
  assert.equal(temperatureColor(20), 'rgb(112, 184, 211)');
  assert.equal(temperatureColor(80), 'rgb(234, 133, 96)');
  assert.equal(temperatureColor(50), 'rgb(173, 159, 154)');
  assert.equal(temperatureColor(0), temperatureColor(20));
  assert.equal(temperatureColor(100), temperatureColor(80));
});
