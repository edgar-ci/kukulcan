// Pointer-held pouring. Only the glass follows the hand; labels stay readable.
export function createHeldPour({ stage, reduced, canStart, onStart, onPortion, onEnd, render }) {
  const controller = new AbortController();
  const listen = (node, event, callback, options = {}) => node.addEventListener(event, callback, { ...options, signal: controller.signal });
  let held = null;
  let frame = 0;
  let suppressed = null;
  const center = stage.querySelector('[data-object="water1"] .mix-glass');
  const overlay = stage.querySelector('#mix-stream');
  const stream = overlay.querySelector('path');
  function finish() {
    if (!held) return;
    const previous = held;
    held = null;
    cancelAnimationFrame(frame);
    previous.glass.style.transform = '';
    previous.glass.classList.remove('pouring-glass');
    overlay.style.opacity = '0';
    render(previous.index, 0);
    if (previous.card.hasPointerCapture(previous.id)) previous.card.releasePointerCapture(previous.id);
    if (previous.moved) { suppressed = previous.card; onEnd(); }
  }
  function tick(time) {
    if (!held) return;
    const h = held;
    const elapsed = h.last === null ? 0 : Math.min(100, time - h.last);
    h.last = time;
    if (h.moved) {
      const target = center.getBoundingClientRect();
      const near = Math.abs(h.x - (target.x + target.width / 2)) <= target.width / 2 + 24 && h.y >= target.top - 70 && h.y <= target.bottom;
      const active = near && !h.empty;
      const desired = active ? h.direction * 105 : 0;
      h.angle = reduced ? desired : h.angle + (desired - h.angle) * Math.min(1, elapsed / 90);
      const dx = active ? target.x + target.width / 2 - h.bounds.x - h.bounds.width / 2 - h.direction * target.width * .32 : h.x - h.startX;
      const dy = active ? target.top - h.bounds.top - target.height * .35 : h.y - h.startY;
      h.glass.style.transform = `translate(${dx}px, ${dy}px) rotate(${h.angle}deg)`;
      render(h.index, h.angle);
      overlay.style.opacity = active ? '1' : '0';
      if (active) {
        const start = new DOMPoint(h.direction > 0 ? 122 : 38, 40).matrixTransform(h.glass.getScreenCTM());
        const end = new DOMPoint(80, 65).matrixTransform(center.getScreenCTM());
        const bounds = overlay.getBoundingClientRect();
        overlay.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
        stream.setAttribute('d', `M${start.x - bounds.x} ${start.y - bounds.y} Q${end.x - bounds.x} ${start.y - bounds.y} ${end.x - bounds.x} ${end.y - bounds.y}`);
        stream.setAttribute('stroke', h.glass.querySelector('.glass-water').getAttribute('fill'));
        h.accumulated += elapsed;
        while (h.accumulated >= 100 && !h.empty) {
          h.accumulated -= 100;
          h.empty = !onPortion(h.index);
          render(h.index, h.angle);
        }
        if (h.empty) overlay.style.opacity = '0';
      } else h.accumulated = 0;
    }
    frame = requestAnimationFrame(tick);
  }
  for (const index of [0, 2]) {
    const card = stage.querySelector(`[data-object="water${index}"]`);
    card.classList.add('draggable');
    listen(card, 'click', event => {
      if (suppressed === card && event.detail !== 0) { event.preventDefault(); event.stopImmediatePropagation(); suppressed = null; }
    }, { capture: true });
    listen(card, 'pointerdown', event => {
      suppressed = null;
      if (held || event.button !== 0 || !canStart(index)) return;
      const glass = card.querySelector('.mix-glass');
      held = { card, glass, index, id: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, bounds: glass.getBoundingClientRect(), direction: index === 0 ? 1 : -1, angle: 0, moved: false, empty: false, last: null, accumulated: 0 };
      card.setPointerCapture(event.pointerId);
      frame = requestAnimationFrame(tick);
    });
    listen(card, 'pointermove', event => {
      if (!held || held.id !== event.pointerId) return;
      held.x = event.clientX; held.y = event.clientY;
      if (!held.moved && Math.hypot(held.x - held.startX, held.y - held.startY) > 8) {
        held.moved = true;
        held.glass.classList.add('pouring-glass');
        onStart(index);
      }
    });
    listen(card, 'pointerup', finish);
    listen(card, 'pointercancel', finish);
    listen(card, 'lostpointercapture', finish);
  }
  listen(document, 'keydown', event => { if (event.key === 'Escape') finish(); });
  listen(document, 'visibilitychange', () => { if (document.hidden) finish(); });
  listen(window, 'blur', finish);
  listen(window, 'resize', finish);
  return () => { finish(); controller.abort(); };
}
