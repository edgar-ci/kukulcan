// Equal heat capacities; only adjacent blocks exchange energy. No ambient losses.
// The rate is illustrative, not a measured material or physical time scale.
export const initialTemperatures = Object.freeze([20, 40, 60, 80]);

export function equilibriumTemperature(temperatures) {
  if (!temperatures.length || temperatures.some((value) => !Number.isFinite(value))) {
    throw new RangeError('Se necesitan temperaturas válidas.');
  }
  return temperatures.reduce((sum, value) => sum + value, 0) / temperatures.length;
}

export function advanceTemperatures(temperatures, elapsed) {
  equilibriumTemperature(temperatures);
  if (!Number.isFinite(elapsed) || elapsed < 0) throw new RangeError('Tiempo no válido.');
  // Each update is a convex combination. Cap long frames to avoid jumps after inactivity.
  const transferRate = Math.min(elapsed, 0.05) * 1.5;
  const next = [...temperatures];
  for (let index = 0; index < temperatures.length - 1; index++) {
    const transfer = (temperatures[index] - temperatures[index + 1]) * transferRate;
    next[index] -= transfer;
    next[index + 1] += transfer;
  }
  return next;
}

export function temperatureColor(temperature, shade = 0) {
  const fraction = Math.max(0, Math.min(1, (temperature - 20) / 60));
  const cold = [112, 184, 211];
  const hot = [234, 133, 96];
  return `rgb(${cold.map((value, index) => Math.round(Math.max(0, Math.min(255, value + (hot[index] - value) * fraction + shade)))).join(', ')})`;
}
