import { useEffect, useRef } from 'react';
import { mountScene } from '../simulations/scenes.js';

// The animation engine owns the stage; model notes stay outside the visible UI.
export default function Experiment({ index, helpers, blocked = false, action, children }) {
  const stage = useRef(null);

  useEffect(() => {
    const root = stage.current;
    const noteElement = document.createElement('p');
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let dispose;
    const mount = () => {
      dispose?.();
      dispose = mountScene(index, root, noteElement, helpers);
    };
    mount();
    media.addEventListener('change', mount);
    return () => {
      dispose?.();
      media.removeEventListener('change', mount);
      root.replaceChildren();
      noteElement.textContent = '';
    };
  }, [index, helpers]);

  return <section className="experiment" aria-label="Experimento interactivo">
    <div className="lab-head"><span><i className="live-dot" /> MESA DE EXPERIMENTOS</span><span>0{index + 1}</span></div>
    {action}
    <div inert={blocked}>
      <div className="stage" id="stage" ref={stage} />
    </div>
    {children}
  </section>;
}
