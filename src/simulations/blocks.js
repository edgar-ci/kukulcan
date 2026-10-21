import { advanceTemperatures, equilibriumTemperature, initialTemperatures, temperatureColor } from './thermal-stack.js';

const format = (temperature) => temperature.toLocaleString('es-MX', { maximumFractionDigits: 0 });
const name = (index) => String.fromCharCode(65 + index);
// Slow illustrative heat exchange so color changes are easier to observe.
const animationTimeScale = 1 / 3;

export function mountBlocks(stage, noteElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let temperatures = [...initialTemperatures];
  let stack = [];
  let selected = null;
  let paused = false;
  let frame = 0;
  let previousTime = null;
  let settled = false;
  let alive = true;
  let drag = null;
  let suppressClick = false;

  stage.className = 'stage play-stage stack-lab';
  stage.innerHTML = `
    <div class="scene-goal"><span>CONSTRUYE Y OBSERVA</span><strong id="scene-goal">Apila bloques. ¿A qué temperatura llegarán?</strong></div>
    <div class="scene-bubble" id="scene-bubble" role="status" aria-live="polite">Arrastra un bloque sobre otro, o selecciónalo y toca su destino.</div>
    <div class="scene-board">
      <div class="stack-shelf" aria-label="Bloques disponibles"></div>
      <div class="stack-workspace">
        <div class="stack-platform">
          <div class="stack-tower" role="group" aria-label="Pila de bloques, de abajo hacia arriba"></div>
          <button type="button" class="stack-target" id="stack-target">↓ Colocar en la pila</button>
          <span class="stack-base" aria-hidden="true"></span>
        </div>
        <div class="stack-observation"><span class="eyebrow">MISMO MATERIAL Y TAMAÑO</span>
          <strong id="stack-state">Empieza con dos bloques</strong>
          <p id="stack-description">Elige un bloque y colócalo sobre otro. El calor pasa del más caliente al más frío.</p>
          <div class="stack-legend"><span>20 °C</span><i aria-hidden="true"></i><span>80 °C</span></div>
          <small>El color representa la temperatura.</small>
          <button type="button" id="stack-remove" class="outline" disabled>↑ Retirar el de arriba</button>
        </div>
      </div>
    </div>
    <p class="scene-readout" id="scene-readout" aria-live="polite"></p>
    <div class="scene-footer"><small>También puedes usar Tab y Enter para elegir y apilar.</small><button id="scene-pause" class="text-button" hidden>Ⅱ Pausar</button><button id="scene-replay" class="text-button">↺ Reiniciar bloques</button></div>`;
  noteElement.textContent = 'Bloques de igual capacidad térmica, sin pérdidas al ambiente. Solo intercambian calor entre vecinos en contacto. El tiempo y los colores son ilustrativos; cada bloque se representa con una temperatura uniforme.';
  const q = (selector) => stage.querySelector(selector);
  const shelf = q('.stack-shelf');
  const tower = q('.stack-tower');
  const target = q('#stack-target');
  const say = (message) => { q('#scene-bubble').textContent = message; };
  const buttons = temperatures.map((temperature, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thermal-block';
    button.dataset.block = index;
    button.innerHTML = `<svg viewBox="0 0 220 88" aria-hidden="true" focusable="false"><path class="block-top" d="M12 22 42 3H208L178 22Z"/><path class="block-side" d="M178 22 208 3V61L178 80Z"/><path class="block-front" d="M12 22H178V80H12Z"/><text x="27" y="44" class="block-name">BLOQUE ${name(index)}</text><text x="27" y="68" class="block-temperature"></text></svg><span class="block-origin">Al inicio: ${temperature} °C</span>`;
    shelf.append(button);
    return button;
  });

  function paint() {
    buttons.forEach((button, index) => {
      const temperature = temperatures[index];
      button.querySelector('.block-front').setAttribute('fill', temperatureColor(temperature));
      button.querySelector('.block-top').setAttribute('fill', temperatureColor(temperature, 24));
      button.querySelector('.block-side').setAttribute('fill', temperatureColor(temperature, -24));
      button.querySelector('.block-temperature').textContent = `${format(temperature)} °C`;
      button.dataset.temperature = temperature;
      button.setAttribute('aria-label', `Bloque ${name(index)}, ${format(temperature)} °C${stack.includes(index) ? ', en la pila' : ', disponible'}`);
    });
  }

  function select(index) {
    selected = index;
    buttons.forEach((button, id) => {
      button.classList.toggle('block-selected', id === index);
      button.setAttribute('aria-pressed', String(id === index));
    });
    target.classList.toggle('awaiting-block', index !== null);
  }

  function arrange() {
    buttons.forEach((button, index) => {
      if (!stack.includes(index)) shelf.append(button);
      button.classList.toggle('is-stacked', stack.includes(index));
    });
    stack.forEach((index) => tower.append(buttons[index]));
    target.textContent = stack.length ? '↓ Apilar otro bloque arriba' : '↓ Colocar en la pila';
    target.disabled = stack.length === temperatures.length;
    q('#stack-remove').disabled = !stack.length;
  }

  function updateState() {
    settled = false;
    previousTime = null;
    q('#scene-readout').textContent = '';
    if (stack.length < 2) {
      q('#stack-state').textContent = stack.length ? 'Falta un bloque para comparar' : 'Empieza con dos bloques';
      q('#stack-description').textContent = 'Elige un bloque y colócalo sobre otro. El calor pasa del más caliente al más frío.';
      q('#scene-pause').hidden = true;
      return;
    }
    const average = equilibriumTemperature(stack.map((index) => temperatures[index]));
    q('#stack-state').textContent = paused ? 'Intercambio en pausa' : 'El calor pasa entre vecinos';
    q('#stack-description').textContent = `${stack.length} bloques en contacto. Si los dejas juntos, todos llegarán a ${format(average)} °C. Prueba añadir uno más frío o más caliente.`;
    q('#scene-readout').textContent = `Equilibrio previsto: ${format(average)} °C en cada bloque.`;
    q('#scene-pause').hidden = reduced;
    if (reduced || Math.max(...stack.map((id) => temperatures[id])) - Math.min(...stack.map((id) => temperatures[id])) < 0.02) finish(average);
    else schedule();
  }

  function finish(average) {
    stack.forEach((index) => { temperatures[index] = average; });
    settled = true;
    paint();
    q('#stack-state').textContent = 'Misma temperatura, mismo color';
    q('#stack-description').textContent = 'Ya no hay transferencia neta de calor. Las partículas siguen moviéndose. Añade otro bloque para cambiar el equilibrio.';
    q('#scene-readout').textContent = `Equilibrio térmico: los ${stack.length} bloques están a ${format(average)} °C.`;
    q('#scene-pause').hidden = true;
  }

  function tick(time) {
    frame = 0;
    if (!alive || paused || stack.length < 2 || settled) return;
    const elapsed = previousTime === null ? 0 : (time - previousTime) / 1000;
    previousTime = time;
    const next = advanceTemperatures(stack.map((index) => temperatures[index]), Math.min(elapsed, 0.05) * animationTimeScale);
    stack.forEach((index, position) => { temperatures[index] = next[position]; });
    paint();
    if (Math.max(...next) - Math.min(...next) < 0.02) finish(equilibriumTemperature(next));
    else schedule();
  }

  function schedule() {
    if (!frame && !paused && !reduced && !settled && stack.length > 1) frame = requestAnimationFrame(tick);
  }

  function place(source, destination = null) {
    if (source === null || stack.includes(source)) return;
    if (destination === source) { select(null); return; }
    // A pair can be formed directly in the shelf; an existing tower accepts blocks only on top.
    if (destination !== null && !stack.includes(destination)) {
      if (stack.length) { say('Ya hay una pila. Coloca el bloque sobre ella o reinicia para formar otra.'); return; }
      stack.push(destination);
    }
    stack.push(source);
    select(null);
    arrange();
    updateState();
    say(stack.length === 1 ? `El bloque ${name(source)} es la base. Añade otro encima.` : `Bloque ${name(source)} apilado. Observa la temperatura y el color de cada bloque.`);
    buttons[source].focus({ preventScroll: true });
  }

  function activate(index) {
    if (selected !== null) { place(selected, index); return; }
    if (stack.includes(index)) { say('Elige un bloque disponible para añadirlo encima, o retira el de arriba.'); return; }
    select(index);
    say(`Elegiste el bloque ${name(index)} a ${format(temperatures[index])} °C. Toca otro bloque o «Colocar en la pila».`);
  }

  function clearDrag() {
    if (!drag) return;
    drag.ghost?.remove();
    drag.button.classList.remove('block-dragging');
    drag = null;
  }

  buttons.forEach((button, index) => {
    button.onclick = () => {
      if (suppressClick) { suppressClick = false; return; }
      activate(index);
    };
    button.onpointerdown = (event) => {
      if (event.button !== 0 || stack.includes(index)) return;
      suppressClick = false;
      drag = { button, index, x: event.clientX, y: event.clientY, moved: false, ghost: null };
      button.setPointerCapture(event.pointerId);
    };
    button.onpointermove = (event) => {
      if (!drag || drag.button !== button) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 7) return;
      if (!drag.moved) {
        drag.moved = true;
        select(index);
        drag.ghost = button.cloneNode(true);
        drag.ghost.className = 'thermal-block block-ghost';
        drag.ghost.removeAttribute('data-block');
        drag.ghost.setAttribute('aria-hidden', 'true');
        drag.ghost.tabIndex = -1;
        stage.append(drag.ghost);
        button.classList.add('block-dragging');
      }
      drag.ghost.style.left = `${event.clientX - 90}px`;
      drag.ghost.style.top = `${event.clientY - 40}px`;
    };
    button.onpointerup = (event) => {
      if (!drag || drag.button !== button) return;
      const moved = drag.moved;
      clearDrag();
      if (!moved) return;
      suppressClick = true;
      const destination = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-block], .stack-platform');
      if (destination && stage.contains(destination) && destination !== button) {
        place(index, destination.dataset.block === undefined ? null : Number(destination.dataset.block));
      } else {
        select(null);
        say('El bloque volvió a su lugar. Suéltalo sobre otro bloque o sobre la pila.');
      }
    };
    button.onpointercancel = () => { clearDrag(); select(null); say('Arrastre cancelado. Puedes elegir un bloque y tocar su destino.'); };
    button.onlostpointercapture = () => { if (drag?.button === button) { clearDrag(); select(null); } };
  });
  target.onclick = () => {
    suppressClick = false;
    if (selected === null) say('Primero elige un bloque disponible.');
    else place(selected);
  };
  q('#stack-remove').onclick = () => {
    const index = stack.pop();
    if (index === undefined) return;
    select(null);
    arrange();
    updateState();
    paint();
    say(`Retiraste el bloque ${name(index)} a ${format(temperatures[index])} °C. Conserva esa temperatura mientras está separado.`);
  };
  q('#scene-pause').onclick = () => {
    paused = !paused;
    previousTime = null;
    q('#scene-pause').textContent = paused ? '▶ Continuar' : 'Ⅱ Pausar';
    q('#stack-state').textContent = paused ? 'Intercambio en pausa' : 'El calor pasa entre vecinos';
    schedule();
  };
  q('#scene-replay').onclick = () => {
    cancelAnimationFrame(frame); frame = 0;
    clearDrag();
    stack = [];
    temperatures = [...initialTemperatures];
    paused = false;
    suppressClick = false;
    q('#scene-pause').textContent = 'Ⅱ Pausar';
    select(null);
    arrange();
    paint();
    updateState();
    say('Bloques a sus temperaturas iniciales. Prueba cambiar cuál queda arriba y cuál abajo.');
  };
  const onVisibility = () => { previousTime = null; };
  document.addEventListener('visibilitychange', onVisibility);
  arrange();
  paint();
  return () => {
    alive = false;
    cancelAnimationFrame(frame);
    clearDrag();
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
