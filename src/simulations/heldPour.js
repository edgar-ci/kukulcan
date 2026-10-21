// Pointer-held pouring. Only the glass follows the hand; labels stay readable.
export function createHeldPour({ stage, reduced, canStart, onStart, onPortion, onEnd, render, pourVisuals }) {
  const controller = new AbortController();
  const listen = (node, event, callback, options = {}) => node.addEventListener(event, callback, { ...options, signal: controller.signal });
  let held = null;
  let returning = null;
  let frame = 0;
  let suppressed = null;
  const center = stage.querySelector('[data-object="water1"] .mix-glass');

  function settle() {
    if (!returning) return;
    const previous = returning;
    returning = null;
    cancelAnimationFrame(frame);
    previous.glass.style.transform = '';
    previous.glass.classList.remove('pouring-glass');
    render(previous.index, 0);
    onEnd();
  }
  function finish() {
    if (!held) return;
    const previous = held;
    held = null;
    cancelAnimationFrame(frame);
    pourVisuals.stop();
    if (previous.card.hasPointerCapture(previous.id)) previous.card.releasePointerCapture(previous.id);
    if (!previous.moved) return;
    suppressed = previous.card;
    returning = previous;
    if (reduced) { settle(); return; }
    let started = null;
    function returnHome(time) {
      if (!returning) return;
      started ??= time;
      const progress = Math.min(1, (time - started) / 800);
      // Smooth start and landing, with no bounce or sudden change in tilt.
      const remaining = 1 - progress * progress * (3 - 2 * progress);
      previous.glass.style.transform = `translate(${previous.visualX * remaining}px, ${previous.visualY * remaining}px) rotate(${previous.angle * remaining}deg)`;
      render(previous.index, previous.angle * remaining);
      if (progress === 1) settle();
      else frame = requestAnimationFrame(returnHome);
    }
    frame = requestAnimationFrame(returnHome);
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
      const ease = reduced ? 1 : 1 - Math.exp(-elapsed / 65);
      h.visualX += (dx - h.visualX) * ease;
      h.visualY += (dy - h.visualY) * ease;
      h.glass.style.transform = `translate(${h.visualX}px, ${h.visualY}px) rotate(${h.angle}deg)`;
      render(h.index, h.angle, elapsed);
      if(!active)pourVisuals.stop();
      if (active) {
        pourVisuals.paint(h.glass,center,h.direction,time/1000,reduced?1:Math.min(1,Math.abs(h.angle)/85));
        h.accumulated += elapsed;
        while (h.accumulated >= 150 && !h.empty) {
          h.accumulated -= 150;
          h.empty = !onPortion(h.index);
          render(h.index, h.angle, elapsed);
        }
        if (h.empty) pourVisuals.stop();
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
      if (held || returning || event.button !== 0 || !canStart(index)) return;
      const glass = card.querySelector('.mix-glass');
      held = { card, glass, index, id: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, bounds: glass.getBoundingClientRect(), direction: index === 0 ? 1 : -1, angle: 0, visualX: 0, visualY: 0, moved: false, empty: false, last: null, accumulated: 0 };
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
  return () => { finish(); settle(); controller.abort(); };
}
