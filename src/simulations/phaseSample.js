// Illustrative phase proportions, not a mass/energy simulation. The 1.2 s
// transition is presentation time; temperature still selects an equilibrium view.
const targets = {
  ice: [1, 0, 0],
  melting: [0.5, 0.5, 0],
  water: [0, 1, 0],
  boiling: [0, 0.5, 0.5],
  gas: [0, 0, 1],
};

export function createSample(phase, temperature = 25) {
  return { phase, weights: [...targets[phase]], from: [...targets[phase]], elapsed: 1.2, clock: 0, temperature, bubbleClock: 0 };
}

export function advanceSample(sample, phase, dt, snap = false, temperature = sample.temperature) {
  if (sample.phase !== phase) {
    sample.from = [...sample.weights];
    sample.phase = phase;
    sample.elapsed = 0;
  }
  const step = Math.max(0, Math.min(0.08, dt));
  sample.clock += snap ? 0 : step;
  sample.temperature += (temperature - sample.temperature) * (snap ? 1 : 1 - Math.exp(-step / .25));
  sample.bubbleClock += snap ? 0 : step * bubbleActivity(sample.temperature).speed;
  sample.elapsed = snap ? 1.2 : Math.min(1.2, sample.elapsed + step);
  const progress = sample.elapsed / 1.2;
  const ease = progress * progress * (3 - 2 * progress);
  sample.weights = targets[phase].map((value, i) => sample.from[i] + (value - sample.from[i]) * ease);
  return sample;
}

// 40 °C is an illustrative onset, not a physical threshold. Early bubbles
// represent dissolved air; sustained vapor bubbles represent boiling at 1 atm.
export function bubbleActivity(temperature) {
  const warmth = Math.max(0, Math.min(1, (temperature - 40) / 60));
  return {
    warmth,
    count: warmth === 0 ? 0 : 3 + 21 * warmth,
    speed: .08 + .55 * warmth,
    radius: .8 + 3.4 * warmth,
    strength: Math.min(1, warmth * 5),
  };
}

const icePiece = () => `<g class="sample-ice-piece">
  <path class="ice-top" fill="url(#sample-ice-top)"/>
  <path class="ice-left" fill="url(#sample-ice-left)"/>
  <path class="ice-right" fill="url(#sample-ice-right)"/>
  <path d="M-24-9 -5-17 13-12 M-26 0V17 M3 7V27" fill="none" stroke="#f4ffff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>
  <path d="m12 1 5 11-6 8 4 8 M17 12l8 2 M-17 6l7 8-4 9" fill="none" stroke="#e3faff" stroke-width="1.2" opacity=".65"/>
  <ellipse cx="-13" cy="-8" rx="6" ry="2" fill="#fff" opacity=".65"/>
</g>`;

export const sampleMarkup = `<svg class="phase-glass" viewBox="0 0 280 280" role="img" aria-labelledby="sample-title">
  <title id="sample-title">Agua líquida</title>
  <defs>
    <linearGradient id="sample-glass" x1="0" x2="1"><stop stop-color="#b9d9d7" stop-opacity=".3"/><stop offset=".25" stop-color="#fff" stop-opacity=".12"/><stop offset=".8" stop-color="#f6ffff" stop-opacity=".08"/><stop offset="1" stop-color="#91bfbd" stop-opacity=".35"/></linearGradient>
    <linearGradient id="sample-water" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#a6e1e8" stop-opacity=".7"/><stop offset=".55" stop-color="#59b5ce" stop-opacity=".76"/><stop offset="1" stop-color="#2986ad" stop-opacity=".88"/></linearGradient>
    <linearGradient id="sample-surface" x1="0" x2="1"><stop stop-color="#e0f9f7"/><stop offset=".55" stop-color="#9edce5"/><stop offset="1" stop-color="#5eb7cc"/></linearGradient>
    <linearGradient id="sample-ice-top" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f4ffff"/><stop offset="1" stop-color="#bce9f3"/></linearGradient>
    <linearGradient id="sample-ice-left" x1="0" x2="1" y2="1"><stop stop-color="#c9f0f5" stop-opacity=".95"/><stop offset="1" stop-color="#7bc7df" stop-opacity=".85"/></linearGradient>
    <linearGradient id="sample-ice-right" x1="0" x2="1" y2="1"><stop stop-color="#9edcea" stop-opacity=".9"/><stop offset="1" stop-color="#429abd" stop-opacity=".9"/></linearGradient>
    <radialGradient id="sample-vapor-cloud" cx="42%" cy="35%" r="65%"><stop stop-color="#ffffff" stop-opacity=".98"/><stop offset=".55" stop-color="#edf7fa" stop-opacity=".92"/><stop offset="1" stop-color="#8daab7" stop-opacity=".42"/></radialGradient>
    <filter id="sample-vapor-soft" x="-20%" y="-25%" width="140%" height="150%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation=".7"/></filter>
    <clipPath id="sample-interior"><path d="M65 91Q140 107 215 91L207 231Q140 254 73 231Z"/></clipPath>
  </defs>
  <ellipse cx="140" cy="255" rx="88" ry="10" fill="#688f80" opacity=".1"/>
  <ellipse cx="140" cy="253" rx="62" ry="5" fill="#688f80" opacity=".12"/>
  <path d="M60 90 69 234Q140 262 211 234L220 90" fill="url(#sample-glass)" stroke="#88aaa5" stroke-width="1.6"/>
  <ellipse cx="140" cy="90" rx="80" ry="13" fill="#e8f5ed" fill-opacity=".35" stroke="#aac6bc" stroke-width="1.4"/>
  <g clip-path="url(#sample-interior)">
    <g id="phase-liquid"><path class="sample-water-body" fill="url(#sample-water)"/><path class="sample-water-surface" fill="url(#sample-surface)" stroke="#d8f6f7" stroke-width="1.3"/><path class="sample-water-glint" fill="none" stroke="#efffff" stroke-width="1.6" stroke-linecap="round" opacity=".75"/></g>
    <g id="phase-ice" stroke="#66abc5" stroke-width="1" stroke-linejoin="round">${icePiece().repeat(3)}</g>
    <g class="sample-bubbles" fill="#e4faff" fill-opacity=".25" stroke="#e9fcff" stroke-width="1">${'<circle/>'.repeat(24)}</g>
  </g>
  <path d="m68 107 8 120 M211 112l-7 113" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".65"/>
  <path d="m80 113 3 42" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".45"/>
  <path d="M70 234Q140 260 210 234L209 241Q140 265 71 241Z" fill="#abcfc9" opacity=".55"/>
  <path d="M75 238Q140 259 205 238" fill="none" stroke="#f6fffb" stroke-width="2.5"/>
  <ellipse cx="140" cy="90" rx="80" ry="13" fill="none" stroke="#88aaa5" stroke-width="1.8"/>
  <path d="M64 88C74 73 180 74 207 84" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>
  <g id="phase-vapor" fill="url(#sample-vapor-cloud)" stroke="#99b2bc" stroke-opacity=".2" stroke-width=".7" filter="url(#sample-vapor-soft)">${Array.from({length:9},()=>'<path class="sample-vapor-puff" d="M-31 6C-41 2-36-12-25-12C-28-25-9-29-3-20C6-32 24-25 23-14C37-17 43-2 32 5C22 14-18 17-31 6Z"/>').join('')}</g>
</svg>`;

export function createSamplePainter(svg) {
  const find = (selector) => svg.querySelector(selector);
  const liquid = find('#phase-liquid');
  const body = find('.sample-water-body');
  const surface = find('.sample-water-surface');
  const glint = find('.sample-water-glint');
  const ice = find('#phase-ice');
  const pieces = [...svg.querySelectorAll('.sample-ice-piece')].map((group) => ({
    group, top: group.querySelector('.ice-top'), left: group.querySelector('.ice-left'), right: group.querySelector('.ice-right'),
  }));
  const bubbles = [...svg.querySelectorAll('.sample-bubbles circle')];
  const vapor = find('#phase-vapor');
  const puffs = [...vapor.querySelectorAll('.sample-vapor-puff')];

  return (sample, reduced) => {
    const [solid, water, gas] = sample.weights;
    const time = reduced ? 0 : sample.clock;
    const level = 240 - water * 104;
    const wave = Math.sin(time * 1.7) * 1.6 * water;
    liquid.setAttribute('opacity', Math.min(1, water * 8));
    body.setAttribute('d', `M64 ${level}Q140 ${level + 14 + wave} 216 ${level}L210 242Q140 262 70 242Z`);
    surface.setAttribute('d', `M64 ${level}C90 ${level - 13 + wave} 187 ${level - 13 - wave} 216 ${level}C190 ${level + 14 + wave} 91 ${level + 14 - wave} 64 ${level}Z`);
    glint.setAttribute('d', `M83 ${level - 2}Q112 ${level - 9 + wave} 142 ${level - 7}`);

    ice.setAttribute('opacity', Math.min(1, solid * 12));
    const size = Math.cbrt(solid);
    const round = 2 + (1 - solid) * 8;
    pieces.forEach(({ group, top, left, right }, i) => {
      const x = [108, 169, 137][i];
      // Settle the stack as pieces shrink, then lift them with the liquid surface.
      const restingCenter = 240 - (i === 2 ? 83 : 37 * [1.04, .96][i]) * size;
      const y = Math.min(restingCenter, level + 10 * size);
      const bob = Math.sin(time * 1.4 + i * 2) * water * 2;
      group.setAttribute('transform', `translate(${x} ${y + bob}) rotate(${[-10, 10, -5][i] + Math.sin(time + i) * water * 2}) scale(${size * [1.04, .96, .88][i]})`);
      top.setAttribute('d', `M${-32 + round} -13L${-3 - round} -25Q-3 -27 ${-3 + round} -25L${32 - round} -12Q35 -10 ${32 - round} -7L${3 + round} 5Q3 7 ${3 - round} 5L${-32 + round} -8Q-35 -10 ${-32 + round} -13Z`);
      left.setAttribute('d', `M-32 -10 3 6V${36 - round}Q3 38 ${3 - round} 35L${-32 + round} 22Q-33 21 -33 ${21 - round}Z`);
      right.setAttribute('d', `M3 6 33 -10V${20 - round}Q33 22 ${33 - round} 24L${3 + round} 36Q3 38 3 ${36 - round}Z`);
    });

    const activity = bubbleActivity(sample.temperature);
    bubbles.forEach((bubble, i) => {
      const cycle = ((reduced ? .36 : sample.bubbleClock) * (1 + i % 3 * .12) + i * .381966) % 1;
      const attached = .65 * (1 - activity.warmth);
      const rise = Math.max(0, (cycle - attached) / (1 - attached));
      const visible = Math.max(0, Math.min(1, activity.count - i));
      bubble.setAttribute('cx', 82 + (i * 47 % 116) + Math.sin(time * 2 + i) * rise * 2);
      bubble.setAttribute('cy', 236 - rise * Math.max(0, 236 - level));
      bubble.setAttribute('r', (.55 + cycle * .45) * activity.radius * (1 + i % 3 * .12));
      bubble.setAttribute('opacity', visible * activity.strength * Math.min(1, water * 4)
        * Math.min(1, cycle * 12) * Math.min(1, (1 - rise) * 8));
    });
    vapor.setAttribute('opacity', gas);
    puffs.forEach((puff, i) => {
      // Staggered puffs rise from the rim, broaden, then disperse. Reduced
      // motion retains a distributed cloud, without starting an animation loop.
      const progress = reduced ? .12 + i / puffs.length * .8 : (time * .18 + i / puffs.length) % 1;
      const drift = Math.sin(time * .65 + i * 1.7) * 7 * progress;
      const x = 140 + (i % 3 - 1) * (9 + progress * 13) + drift;
      const y = 109 - progress * 80;
      const scale = .42 + progress * .85;
      puff.setAttribute('transform', `translate(${x} ${y}) scale(${scale} ${scale * .85})`);
      puff.setAttribute('opacity', Math.pow(Math.sin(progress * Math.PI), .65) * .9);
    });
  };
}
