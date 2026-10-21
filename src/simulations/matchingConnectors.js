const colors = ['#287f9a', '#bc5425', '#8054ab'];
const svgNamespace = 'http://www.w3.org/2000/svg';

// Owns the matching board's pointer interaction and SVG only; cards stay fixed.
export function createMatchingConnectors({ grid, reduced, onSelect, onConnect, onCancel }) {
  const controller = new AbortController();
  const connections = [];
  const frames = new Set();
  let selected = null;
  let drag = null;
  let preview = null;
  let disposed = false;
  let suppressClick = false;
  const sources = [...grid.querySelectorAll('[data-object^="unit"]')];
  const targets = [...grid.querySelectorAll('[data-object^="match"]')];
  const svg = document.createElementNS(svgNamespace, 'svg');
  svg.classList.add('matching-connectors');
  svg.setAttribute('aria-hidden', 'true');
  grid.append(svg);

  function path(color, provisional = false) {
    const element = document.createElementNS(svgNamespace, 'path');
    element.setAttribute('stroke', color);
    element.setAttribute('class', provisional ? 'connector-preview' : 'connector-line');
    svg.append(element);
    return element;
  }
  function anchor(card, source) {
    const bounds = card.getBoundingClientRect();
    const board = grid.getBoundingClientRect();
    return { x: (source ? bounds.right : bounds.left) - board.left, y: bounds.top + bounds.height / 2 - board.top };
  }
  function draw(element, start, end, bounce = 0) {
    const bend = Math.max(20, Math.abs(end.x - start.x) * .45);
    element.setAttribute('d', `M ${start.x} ${start.y} C ${start.x + bend} ${start.y + bounce}, ${end.x - bend} ${end.y + bounce}, ${end.x} ${end.y}`);
  }
  function redraw() {
    connections.forEach(connection => draw(connection.path, anchor(sources[connection.index], true), anchor(targets.find(card => card.dataset.object === `match${connection.index}`), false), connection.bounce));
    if (preview && drag) {
      const bounds = grid.getBoundingClientRect();
      draw(preview, anchor(sources[selected], true), { x: drag.clientX - bounds.left, y: drag.clientY - bounds.top });
    }
  }
  function clearPreview() {
    preview?.remove();
    preview = null;
  }
  function cancel() {
    if (selected === null && !drag) return;
    selected = null;
    clearPreview();
    const previous = drag;
    drag = null;
    if (previous && previous.card.hasPointerCapture(previous.pointerId)) previous.card.releasePointerCapture(previous.pointerId);
    onCancel();
  }
  function connect(target) {
    if (selected === null || target.disabled) return;
    const index = selected;
    clearPreview();
    if (!onConnect(index, Number(target.dataset.object.slice(5)))) return;
    selected = null;
    target.style.setProperty('--connector-color', colors[index]);
    target.classList.add('has-connector');
    const connection = { index, path: path(colors[index]), bounce: 0 };
    connections.push(connection);
    redraw();
    if (reduced) return;
    let started;
    function tick(time) {
      if (disposed) return;
      started ??= time;
      const progress = Math.min(1, (time - started) / 350);
      connection.bounce = Math.sin(progress * Math.PI * 3) * 7 * (1 - progress);
      redraw();
      if (progress < 1) schedule(tick);
    }
    schedule(tick);
  }
  function schedule(callback) {
    const id = requestAnimationFrame(time => { frames.delete(id); callback(time); });
    frames.add(id);
  }
  const listen = (element, event, callback) => element.addEventListener(event, callback, { signal: controller.signal });
  sources.forEach((card, index) => {
    card.style.setProperty('--connector-color', colors[index]);
    card.classList.add('connector-source');
    card.setAttribute('aria-pressed', 'false');
    function select() { selected = index; onSelect(index); }
    listen(card, 'click', event => {
      if (suppressClick && event.detail !== 0) { suppressClick = false; return; }
      if (!card.disabled) select();
    });
    listen(card, 'pointerdown', event => {
      if (card.disabled || event.button !== 0 || drag) return;
      suppressClick = false;
      drag = { card, pointerId: event.pointerId, x: event.clientX, y: event.clientY, clientX: event.clientX, clientY: event.clientY, moved: false };
      card.setPointerCapture(event.pointerId);
    });
    listen(card, 'pointermove', event => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      drag.clientX = event.clientX;
      drag.clientY = event.clientY;
      if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 8) {
        select();
        drag.moved = true;
        preview = path(colors[index], true);
      }
      redraw();
    });
    listen(card, 'pointerup', event => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const moved = drag.moved;
      drag = null;
      if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
      if (!moved) return;
      suppressClick = true;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-object^="match"]');
      if (target && grid.contains(target) && !target.disabled) connect(target);
      else cancel();
    });
    listen(card, 'pointercancel', cancel);
    listen(card, 'lostpointercapture', () => { if (drag) cancel(); });
  });
  targets.forEach(card => listen(card, 'click', () => {
    if (selected === null) onConnect(null, Number(card.dataset.object.slice(5)));
    else connect(card);
  }));
  listen(document, 'keydown', event => { if (event.key === 'Escape') cancel(); });
  listen(window, 'scroll', redraw);
  const observer = new ResizeObserver(redraw);
  observer.observe(grid);
  [...sources, ...targets].forEach(card => observer.observe(card));
  return () => {
    disposed = true;
    controller.abort();
    observer.disconnect();
    frames.forEach(cancelAnimationFrame);
    if (drag?.card.hasPointerCapture(drag.pointerId)) drag.card.releasePointerCapture(drag.pointerId);
    svg.remove();
  };
}
