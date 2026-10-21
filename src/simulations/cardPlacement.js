// Move the original controls; visual copies exist only for the short flight.
export function createCardPlacement(stage, reduced) {
  const homes = new Map();
  const targets = new Map();
  const flights = new Set();
  let alive = true;
  const item = (id) => stage.querySelector(`[data-object="${id}"]`);

  function prepare(sourceIds, targetIds) {
    homes.clear();
    targets.clear();
    sourceIds.forEach((id) => {
      const button = item(id);
      const home = document.createElement('div');
      home.className = 'object-home';
      home.dataset.home = id;
      button.before(home);
      home.append(button);
      homes.set(id, home);
    });
    targetIds.forEach((id) => {
      const button = item(id);
      const wrapper = document.createElement('div');
      wrapper.className = `placement-target${button.classList.contains('job-target') ? ' placement-job' : ''}`;
      const slot = document.createElement('div');
      slot.className = 'placement-slot';
      slot.dataset.placement = id;
      button.before(wrapper);
      wrapper.append(button, slot);
      targets.set(id, slot);
    });
  }

  function move(button, destination, originRect) {
    const from = originRect || button.getBoundingClientRect();
    const ghost = button.cloneNode(true);
    const home = homes.get(button.dataset.object);
    home.style.minHeight = `${home.getBoundingClientRect().height}px`;
    destination.append(button);
    button.classList.toggle('placed-card', destination !== home);
    homes.forEach((slot) => slot.classList.toggle('object-home-empty', !slot.firstElementChild));
    if (reduced) return null;
    const to = button.getBoundingClientRect();
    ghost.removeAttribute('data-object');
    ghost.removeAttribute('id');
    ghost.removeAttribute('aria-pressed');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.tabIndex = -1;
    ghost.classList.remove('object-cue', 'object-selected', 'is-dragging');
    ghost.classList.add('placement-ghost');
    Object.assign(ghost.style, {
      left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`,
    });
    // Match the destination layout before scaling back to the source rectangle.
    ghost.classList.toggle('placed-card', destination !== home);
    document.body.append(ghost);
    button.classList.add('placement-in-flight');
    const dx = from.left - to.left, dy = from.top - to.top;
    const sx = from.width / to.width, sy = from.height / to.height;
    const lift = Math.min(80, Math.max(32, Math.hypot(dx, dy) * .18));
    const transform = (x, y, xScale, yScale, angle = 0) =>
      `translate(${x}px, ${y}px) scale(${xScale}, ${yScale}) rotate(${angle}deg)`;
    const animation = ghost.animate([
      { transform: transform(dx, dy, sx, sy), offset: 0 },
      { transform: transform(dx * .58, dy * .58 - lift, 1 + (sx - 1) * .58, 1 + (sy - 1) * .58, dx > 0 ? -3 : 3), offset: .42 },
      { transform: transform(0, 0, 1.04, .94), offset: .78 },
      { transform: transform(0, -7, .99, 1.02), offset: .9 },
      { transform: transform(0, 0, 1, 1), offset: 1 },
    ], { duration: 620, easing: 'cubic-bezier(.22,.65,.3,1)', fill: 'forwards' });
    const flight = { animation, ghost, button };
    flights.add(flight);
    return animation.finished.catch(() => {}).then(() => {
      ghost.remove();
      button.classList.remove('placement-in-flight');
      flights.delete(flight);
    });
  }

  function place(sourceId, targetId, originRect, done) {
    const button = item(sourceId), destination = targets.get(targetId);
    const focused = document.activeElement;
    const pending = [];
    const previous = destination.firstElementChild;
    if (previous && previous !== button) {
      pending.push(move(previous, homes.get(previous.dataset.object)));
    }
    pending.push(move(button, destination, originRect));
    const complete = () => {
      if (!alive) return;
      // Reparenting a focused control can otherwise lose keyboard focus.
      if (focused === button) button.focus({ preventScroll: true });
      done();
    };
    if (reduced) complete();
    else Promise.all(pending).then(complete);
  }

  function dispose() {
    alive = false;
    flights.forEach(({ animation, ghost, button }) => {
      animation.cancel();
      ghost.remove();
      button.classList.remove('placement-in-flight');
    });
    flights.clear();
  }
  return { prepare, place, dispose };
}
