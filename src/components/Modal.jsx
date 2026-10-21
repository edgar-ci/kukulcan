import { useLayoutEffect, useRef } from 'react';

export default function Modal({ title, children, onClose }) {
  const dialog = useRef(null);
  useLayoutEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement;
    element.showModal();
    return () => {
      element.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return <dialog id="modal" ref={dialog} aria-labelledby="modal-title"
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => {
      if (event.target !== dialog.current) return;
      const bounds = dialog.current.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
    <button id="close-modal" className="close" aria-label="Cerrar ventana" onClick={onClose}>✕</button>
    <div id="modal-body"><h2 id="modal-title">{title}</h2>{children}</div>
  </dialog>;
}
