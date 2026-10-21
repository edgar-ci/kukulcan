// Presentation only: the mixing model owns transferred mass and temperature.
export const pourMarkup = `<svg id="mix-stream" aria-hidden="true">
  <path class="pour-stream-edge" fill="none" stroke-linecap="round"/>
  <path class="pour-stream-body" fill="none" stroke-linecap="round"/>
  <path class="pour-stream-shine" fill="none" stroke-linecap="round"/>
  <g class="pour-impact" fill="none" stroke="#d5f6fc" stroke-width="1.5" stroke-linecap="round"><path/><path/></g>
  <g class="pour-droplets" fill="#d7f5fb" stroke="#78b4c5" stroke-width=".5">${'<ellipse/>'.repeat(6)}</g>
</svg>`;

export function createPourVisuals(stage, reduced) {
  const overlay = stage.querySelector('#mix-stream');
  const edge = overlay.querySelector('.pour-stream-edge');
  const body = overlay.querySelector('.pour-stream-body');
  const shine = overlay.querySelector('.pour-stream-shine');
  const splash = [...overlay.querySelectorAll('.pour-impact path')];
  const drops = [...overlay.querySelectorAll('.pour-droplets ellipse')];
  let receiver = null;

  function stop() {
    overlay.style.opacity = '0';
    if (receiver) {
      receiver.querySelector('.glass-ripples').style.opacity = '0';
      receiver.classList.remove('receiving-water');
    }
    receiver = null;
  }

  function paint(donor, target, direction, seconds, strength = 1) {
    if (receiver && receiver !== target) stop();
    receiver = target;
    const sourceMatrix = donor.getScreenCTM(), targetMatrix = target.getScreenCTM();
    if (!sourceMatrix || !targetMatrix) return;
    const start = new DOMPoint(direction > 0 ? 122 : 38, 40).matrixTransform(sourceMatrix);
    const surfaceY = Number(target.querySelector('.glass-surface').getAttribute('cy'));
    const end = new DOMPoint(80, surfaceY).matrixTransform(targetMatrix);
    const bounds = overlay.getBoundingClientRect();
    const scale = Math.min(1, Math.hypot(targetMatrix.c, targetMatrix.d));
    const x1 = start.x - bounds.x, y1 = start.y - bounds.y;
    const x2 = end.x - bounds.x, y2 = end.y - bounds.y;
    const time = reduced ? 0 : seconds;
    const flow = Math.max(0, Math.min(1, strength));
    const bend = direction * 12 * scale;
    const fall = Math.max(12, (y2 - y1) * .45);
    const path = `M${x1} ${y1}C${x1 + bend} ${y1 + 8 * scale} ${x2} ${y2 - fall} ${x2} ${y2}`;
    const width = (5.2 + Math.sin(time * 11) * .35) * scale * Math.sqrt(flow);
    overlay.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    overlay.style.opacity = String(flow);
    edge.setAttribute('d', path);
    edge.setAttribute('stroke', '#78aebb');
    edge.setAttribute('stroke-width', width + 1.2 * scale);
    edge.setAttribute('opacity', '.45');
    body.setAttribute('d', path);
    const sourceFill = donor.querySelector('.glass-water').getAttribute('fill');
    body.setAttribute('stroke', sourceFill.startsWith('url(') ? '#b8dfe6' : sourceFill);
    body.setAttribute('stroke-width', width);
    body.setAttribute('opacity', '.68');
    shine.setAttribute('d', path);
    shine.setAttribute('stroke', '#f3feff');
    shine.setAttribute('stroke-width', Math.max(.7, width * .28));
    shine.setAttribute('opacity', '.85');

    target.classList.add('receiving-water');
    const ripples = target.querySelector('.glass-ripples');
    ripples.style.opacity = String(flow);
    [...ripples.querySelectorAll('ellipse')].forEach((ring, i) => {
      const progress = reduced ? .3 + i * .4 : (time * 1.4 + i * .5) % 1;
      ring.setAttribute('rx', 5 + progress * 33);
      ring.setAttribute('ry', 1.2 + progress * 4);
      ring.setAttribute('opacity', (1 - progress) * .8);
    });
    splash.forEach((arc, i) => {
      const side = i ? 1 : -1;
      const spread = (8 + Math.sin(time * 8 + i) * 2) * scale;
      arc.setAttribute('d', `M${x2} ${y2}Q${x2 + side * spread} ${y2 - 12 * scale} ${x2 + side * spread * 1.8} ${y2 - 2 * scale}`);
      arc.setAttribute('opacity', reduced ? 0 : .7 * flow);
    });
    drops.forEach((drop, i) => {
      const progress = (time * 1.7 + i / drops.length) % 1;
      const side = i % 2 ? 1 : -1;
      const x = x2 + side * (4 + progress * (12 + i % 3 * 4)) * scale;
      const y = y2 - Math.sin(progress * Math.PI) * (9 + i % 3 * 3) * scale;
      drop.setAttribute('cx', x);drop.setAttribute('cy', y);
      drop.setAttribute('rx', 1.1 * scale);drop.setAttribute('ry', 1.8 * scale);
      drop.setAttribute('opacity', reduced ? 0 : Math.sin(progress * Math.PI) * flow * .8);
    });
  }
  return { paint, stop };
}
