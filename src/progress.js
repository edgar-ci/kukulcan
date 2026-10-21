export const STORAGE_KEY = 'heat-lab-v1';

export function readProgress(storage) {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) || '{}') || {};
    const valid = (n) => Number.isInteger(n) && n >= 0 && n < 7;
    return {
      current: valid(saved.current) ? saved.current : 0,
      completed: Array.isArray(saved.completed) ? [...new Set(saved.completed.filter(valid))] : [],
    };
  } catch {
    return { current: 0, completed: [] };
  }
}

export function writeProgress(storage, progress) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function browserStorage() {
  try { return window.localStorage; } catch { return null; }
}
