import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readProgress, writeProgress, STORAGE_KEY } from '../src/progress.js';

test('preserves the existing progress contract and removes invalid or duplicate missions', () => {
  const storage = { getItem: () => JSON.stringify({ current: 3, completed: [0, 2, 2, -1, 7, '1', null] }) };
  assert.deepEqual(readProgress(storage), { current: 3, completed: [0, 2] });
  storage.setItem = (key, value) => {
    assert.equal(key, STORAGE_KEY);
    assert.deepEqual(JSON.parse(value), { current: 3, completed: [0, 2] });
  };
  assert.equal(writeProgress(storage, readProgress(storage)), true);
});

test('invalid storage starts a fresh expedition', () => {
  for (const value of ['{', 'null', '[]', 'false', '{"current":99,"completed":{}}']) {
    assert.deepEqual(readProgress({ getItem: () => value }), { current: 0, completed: [] });
  }
});

test('unavailable storage leaves the app usable in memory', () => {
  const storage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('full'); } };
  assert.deepEqual(readProgress(storage), { current: 0, completed: [] });
  assert.equal(writeProgress(storage, { current: 0, completed: [] }), false);
  assert.deepEqual(readProgress(null), { current: 0, completed: [] });
  assert.equal(writeProgress(null, {}), false);
});
