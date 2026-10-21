import { createCardPlacement } from './cardPlacement.js';

const materials = [
  ['copper-body', 'Cuerpo de cobre', 'Buen conductor'],
  ['steel-body', 'Cuerpo de acero', 'Conductor'],
  ['wood-handle', 'Mango de madera', 'Baja conductividad'],
  ['copper-handle', 'Mango de cobre', 'Alta conductividad'],
];
const bodyShape = '<path d="M-92 0Q0 28 92 0L78 34Q0 65-78 34Z" fill="var(--pan-side)"/><ellipse rx="92" ry="28" fill="var(--pan-rim)"/><ellipse rx="82" ry="21" fill="var(--pan-inside)"/><path d="M-70-7Q0-30 70-7" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>';
const handleShape = '<path d="M0-7H24V7H0Z" fill="#89918b"/><rect x="18" y="-12" width="110" height="24" rx="12" fill="var(--pan-handle)"/><path d="M35-4H104M42 4H95" stroke="var(--pan-grain)" stroke-width="2" stroke-linecap="round"/><ellipse cx="114" rx="5" ry="4" fill="#eef0df"/>';
const palette = (id) => id === 'steel-body' ? '--pan-side:#718680;--pan-rim:#cbd9d3;--pan-inside:#a0b6af' : id.endsWith('body') ? '--pan-side:#a55c39;--pan-rim:#edba83;--pan-inside:#d7925e' : id === 'wood-handle' ? '--pan-handle:#806044;--pan-grain:#bc9566' : '--pan-handle:#cf8957;--pan-grain:#f1c38f';
const icon = (id) => `<svg viewBox="0 0 210 105" aria-hidden="true" style="${palette(id)}"><g transform="translate(${id.endsWith('body') ? '105 40' : '40 55'})">${id.endsWith('body') ? bodyShape : handleShape}</g></svg>`;
const ease = (p) => p * p * (3 - 2 * p);

export function mountPan(stage, noteElement, helpers) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let placement;
  let body = null, handle = null, selected = null;
  let busy = false, paused = false, alive = true;
  let frame = 0, elapsed = 0, last = null, drag = null, suppressClick = false;
  stage.className = 'stage play-stage pan-lab';
  noteElement.textContent = 'Modelo cualitativo: el cobre conduce más que el acero; la madera dificulta que el calor llegue a la mano. Los colores y tiempos son ilustrativos, no temperaturas calculadas.';
  const q = (selector) => stage.querySelector(selector);
  const item = (id) => q(`[data-object="${id}"]`);
  const say = (message) => { q('#scene-bubble').textContent = message; };

  function select(id) {
    selected = id;
    materials.forEach(([key]) => {
      item(key).classList.toggle('object-selected', key === id);
      item(key).setAttribute('aria-pressed', String(key === id));
    });
    if (id) say(`Coloca esta pieza en la silueta del ${id.endsWith('body') ? 'cuerpo' : 'mango'}.`);
  }

  function lock(value) {
    busy = value;
    stage.querySelectorAll('[data-object]').forEach((button) => { button.disabled = value; });
  }

  function paint(join = 0, travel = 0, heat = 0) {
    const x = 195 + 40 * travel;
    const y = 86 + 119 * travel - 35 * Math.sin(Math.PI * travel);
    q('.pan-assembly').setAttribute('transform', `translate(${x} ${y})`);
    q('.pan-handle-art').setAttribute('transform', `translate(${160 - 72 * join} ${-12 + 12 * join})`);
    q('.pan-body-art').style.cssText = body ? palette(body) : '';
    q('.pan-handle-art').style.cssText = handle ? palette(handle) : '';
    q('.pan-body-art').classList.toggle('pan-empty', !body);
    q('.pan-handle-art').classList.toggle('pan-empty', !handle);
    q('.pan-body-heat').setAttribute('opacity', String(heat * .45));
    q('.pan-handle-heat').setAttribute('opacity', String(heat * (handle === 'copper-handle' ? .65 : .06)));
    q('.pan-ground-shadow').setAttribute('opacity', String(.1 + travel * .15));
    q('.pan-ground-shadow').setAttribute('rx', String(85 + travel * 10));
  }

  function finish() {
    stage.dataset.phase = 'result';
    stage.classList.remove('pan-burning', 'scene-paused');
    q('#scene-pause').hidden = true;
    const good = handle === 'wood-handle';
    q('#scene-readout').textContent = good
      ? '✓ El cuerpo conduce y el mango dificulta el paso del calor.'
      : 'El mango de cobre también se calienta: prueba uno de madera.';
    say(good ? `${body === 'copper-body' ? 'El cobre conduce muy bien.' : 'El acero conduce menos que el cobre.'} La madera reduce el paso de energía hacia la mano.` : 'Conducir bien ayuda a cocinar, pero no protege la mano. Cambia el mango.');
    lock(false);
    if (good) helpers.onSuccess?.();
    if (document.activeElement === document.body) q('#scene-replay').focus({ preventScroll: true });
  }

  function renderTime() {
    const phase = elapsed < 650 ? 'assembling' : elapsed < 1500 ? 'moving' : 'heating';
    if (stage.dataset.phase !== phase) {
      stage.dataset.phase = phase;
      say(phase === 'assembling' ? 'El cuerpo y el mango se unen.' : phase === 'moving' ? 'La sartén está lista. La colocamos sobre el fogón.' : 'La energía pasa del fogón al cuerpo y de ahí hacia el mango.');
    }
    paint(ease(Math.min(1, elapsed / 650)), ease(Math.max(0, Math.min(1, (elapsed - 650) / 850))), Math.max(0, Math.min(1, (elapsed - 1500) / 2600)));
    stage.classList.toggle('pan-burning', phase === 'heating');
  }

  function tick(time) {
    if (!alive) return;
    if (last !== null && !paused) elapsed += Math.min(time - last, 80);
    last = time;
    renderTime();
    if (elapsed >= 4100) { finish(); return; }
    frame = requestAnimationFrame(tick);
  }

  function start() {
    lock(true);
    select(null);
    elapsed = 0; last = null; paused = false;
    q('#scene-pause').textContent = 'Ⅱ Pausar';
    q('#scene-pause').hidden = reduced;
    if (reduced) { paint(1, 1, 1); finish(); return; }
    renderTime();
    frame = requestAnimationFrame(tick);
  }

  function place(id, destination, origin) {
    if (busy) return;
    if (!id || !id.endsWith(destination)) {
      say(`Elige una pieza para el ${destination === 'body' ? 'cuerpo' : 'mango'} y colócala aquí.`);
      return;
    }
    if ((destination === 'body' ? body : handle) === id) return;
    const wasFinished = stage.dataset.phase === 'result';
    select(null);
    lock(true);
    q('#scene-readout').textContent = '';
    const performPlacement = () => {
      if (!alive) return;
      stage.dataset.phase = 'placing';
      placement.place(id, destination, origin, () => {
        if (destination === 'body') body = id;
        else handle = id;
        paint();
        lock(false);
        if (body && handle) start();
        else {
          stage.dataset.phase = 'incomplete';
          say('Ahora coloca la pieza que falta.');
        }
      });
    };
    if (wasFinished && !reduced) {
      stage.dataset.phase = 'returning';
      let returnLast = null, returnElapsed = 0;
      const returnTick = (time) => {
        if (!alive) return;
        if (returnLast !== null) returnElapsed += Math.min(time - returnLast, 80);
        returnLast = time;
        const progress = ease(Math.min(1, returnElapsed / 650));
        paint(1 - progress, 1 - progress, 1 - progress);
        if (progress === 1) performPlacement();
        else frame = requestAnimationFrame(returnTick);
      };
      frame = requestAnimationFrame(returnTick);
    } else { paint(); performPlacement(); }
  }

  function wirePiece(id) {
    const button = item(id);
    button.onclick = (event) => {
      if (suppressClick && event.detail !== 0) { suppressClick = false; return; }
      suppressClick = false;
      if (!busy) select(id);
    };
    button.onpointerdown = (event) => {
      if (busy || event.button !== 0) return;
      suppressClick = false;
      drag = { id, x: event.clientX, y: event.clientY, moved: false, pointer: event.pointerId };
      button.setPointerCapture(event.pointerId);
    };
    button.onpointermove = (event) => {
      if (!drag || drag.id !== id) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (Math.hypot(dx, dy) > 8) {
        if (!drag.moved) select(id);
        drag.moved = true;
        button.classList.add('is-dragging');
        button.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };
    button.onpointerup = (event) => {
      if (!drag) return;
      const moved = drag.moved;
      const origin = button.getBoundingClientRect();
      button.style.transform = '';
      button.classList.remove('is-dragging');
      drag = null;
      if (!moved) return;
      suppressClick = true;
      const target = document.elementsFromPoint(event.clientX, event.clientY)
        .map((element) => element.closest('[data-pan-target]'))
        .find(Boolean);
      if (target) place(id, target.dataset.panTarget, origin);
      else say('La pieza volvió a su lugar. Colócala en su silueta.');
    };
    button.onpointercancel = () => {
      drag = null;
      button.style.transform = '';
      button.classList.remove('is-dragging');
      select(null);
    };
  }

  function reset() {
    cancelAnimationFrame(frame);
    placement?.dispose();
    body = null; handle = null; selected = null; busy = false; paused = false; drag = null; suppressClick = false;
    stage.classList.remove('pan-burning', 'scene-paused');
    stage.dataset.phase = 'incomplete';
    stage.innerHTML = `
      <div class="scene-goal"><span>CONSTRUYE Y OBSERVA</span><strong id="scene-goal">Construye una sartén que cocine y proteja</strong></div>
      <div class="scene-bubble" id="scene-bubble" role="status" aria-live="polite">Coloca un cuerpo y un mango en sus siluetas.</div>
      <div class="scene-board">
        <div class="object-shelf">${materials.map(([id, label, sub]) => `<button type="button" class="lab-object draggable" data-object="${id}" aria-pressed="false" aria-label="${label}. ${sub}">${icon(id)}<strong>${label}</strong><span class="object-sub">${sub}</span></button>`).join('')}</div>
        <div class="pan-workspace">
          <svg class="pan-scene" viewBox="0 0 600 360" aria-hidden="true" focusable="false">
            <defs><linearGradient id="pan-stove-metal" x2="0" y2="1"><stop stop-color="#647e74"/><stop offset="1" stop-color="#304f47"/></linearGradient><linearGradient id="pan-flame" x2="0" y2="1"><stop stop-color="#fce3a1"/><stop offset=".5" stop-color="#ed9b4f"/><stop offset="1" stop-color="#568eb0"/></linearGradient></defs>
            <ellipse class="pan-ground-shadow" cx="235" cy="322" rx="85" ry="13" fill="#233f34"/>
            <path d="M120 277Q235 246 350 277V310Q235 348 120 310Z" fill="url(#pan-stove-metal)"/>
            <ellipse cx="235" cy="277" rx="115" ry="32" fill="#a7b7a3" stroke="#657f71" stroke-width="2"/>
            <ellipse cx="235" cy="276" rx="78" ry="22" fill="#334d47" stroke="#e0e4ce" stroke-width="5"/>
            <ellipse cx="235" cy="277" rx="54" ry="14" fill="#60756a"/>
            <g class="pan-flames">${[173, 198, 223, 248, 273, 298].map((x, i) => `<g transform="translate(${x} ${270 + Math.sin(i) * 4})"><g class="pan-flame" style="animation-delay:-${i * .23}s;animation-duration:${.7 + i * .09}s"><path d="M-9 0C-17-17-2-23 0-42C3-29 17-15 9 0Z" fill="url(#pan-flame)"/><path d="M-4 0Q-8-12 1-24Q2-12 5 0" fill="#fff0b5"/></g></g>`).join('')}</g>
            <path d="M141 271L173 260M297 260L329 271M191 291L205 277M265 277L279 291" stroke="#314c43" stroke-width="10" stroke-linecap="round"/>
            <circle cx="235" cy="312" r="10" fill="#dce0cc"/><path d="M235 312L239 306" stroke="#526a5f" stroke-width="3" stroke-linecap="round"/>
            <g class="pan-assembly"><g class="pan-handle-art">${handleShape}<rect class="pan-handle-heat" x="18" y="-12" width="110" height="24" rx="12" fill="#f36f37"/></g><g class="pan-body-art">${bodyShape}<path class="pan-body-heat" d="M-92 0Q0 28 92 0L78 34Q0 65-78 34Z" fill="#f36f37"/></g></g>
          </svg>
          <div class="pan-targets">${['body', 'handle'].map((id) => `<div data-pan-target="${id}"><button type="button" class="lab-object destination" data-object="${id}" aria-label="Coloca el ${id === 'body' ? 'cuerpo' : 'mango'} en su silueta"><strong>${id === 'body' ? 'Cuerpo' : 'Mango'}</strong><span class="object-sub">Coloca aquí</span></button></div>`).join('')}</div>
        </div>
        <button class="text-button" id="compare-materials">Consultar los ocho materiales ↗</button>
      </div>
      <div class="scene-readout" id="scene-readout" aria-live="polite"></div>
      <div class="scene-footer"><small>Toca una pieza y su silueta, o arrástrala.</small><button id="scene-pause" class="text-button" hidden>Ⅱ Pausar</button><button id="scene-replay" class="text-button">↺ Volver a probar</button></div>`;
    placement = createCardPlacement(stage, reduced);
    placement.prepare(materials.map(([id]) => id), ['body', 'handle']);
    materials.forEach(([id]) => wirePiece(id));
    ['body', 'handle'].forEach((id) => { item(id).onclick = () => place(selected, id); });
    q('#compare-materials').onclick = helpers.materialsModal;
    q('#scene-replay').onclick = () => { reset(); item('copper-body').focus({ preventScroll: true }); };
    q('#scene-pause').onclick = () => {
      paused = !paused;
      last = null;
      stage.classList.toggle('scene-paused', paused);
      q('#scene-pause').textContent = paused ? '▶ Continuar' : 'Ⅱ Pausar';
    };
    paint();
  }
  const visibility = () => {
    last = null;
    if (document.hidden && busy && !q('#scene-pause').hidden) {
      paused = true;
      stage.classList.add('scene-paused');
      q('#scene-pause').textContent = '▶ Continuar';
    }
  };
  document.addEventListener('visibilitychange', visibility);
  reset();
  return () => {
    alive = false;
    cancelAnimationFrame(frame);
    placement.dispose();
    document.removeEventListener('visibilitychange', visibility);
  };
}
