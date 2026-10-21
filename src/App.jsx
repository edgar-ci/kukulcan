import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LESSONS } from './data/content.js';
import { browserStorage, readProgress, writeProgress } from './progress.js';
import Mission from './components/Mission.jsx';
import FinalQuiz from './components/FinalQuiz.jsx';
import Modal from './components/Modal.jsx';
import { Calorimeter, Converter, Library, Materials, StaticHtml } from './components/ReferenceContent.jsx';

export default function App() {
  const [progress, setProgress] = useState(() => readProgress(browserStorage()));
  const [sessionOnly, setSessionOnly] = useState(false);
  const [view, setView] = useState('mission');
  const [revision, setRevision] = useState(0);
  const [modal, setModal] = useState(null);
  const main = useRef(null);
  const focusRequested = useRef(false);

  useEffect(() => { setSessionOnly(!writeProgress(browserStorage(), progress)); }, [progress]);
  useEffect(() => {
    if (focusRequested.current) {
      main.current.focus();
      focusRequested.current = false;
    }
  }, [progress.current, view, revision]);

  const navigate = (index) => {
    focusRequested.current = true;
    setProgress((previous) => ({ ...previous, current: index }));
    setView('mission');
    setRevision((previous) => previous + 1);
  };
  const showFinal = () => {
    focusRequested.current = true;
    setView('final');
    setRevision((previous) => previous + 1);
  };
  const complete = (index) => setProgress((previous) => ({ ...previous, completed: [...new Set([...previous.completed, index])] }));
  const closeModal = useCallback(() => setModal(null), []);
  const helpers = useMemo(() => ({
    openModal: (title, html) => setModal({ title, content: <StaticHtml html={html} /> }),
    materialsModal: () => setModal({ title: '¿Qué material conduce más?', content: <Materials /> }),
    openConverter: () => setModal({ title: 'Conversor de energía', content: <Converter /> }),
    openCalorimeter: (pictures) => setModal({ title: 'Explora el calorímetro', content: <Calorimeter pictures={pictures} /> }),
  }), []);

  return <>
    <a className="skip" href="#main">Saltar al experimento</a>
    <header>
      <a className="brand" href="#" aria-label="Volver a primera misión" onClick={(event) => { event.preventDefault(); navigate(0); }}><span className="logo">°</span><span>LABORATORIO<br /><strong>DEL CALOR</strong></span></a>
      <span className="header-note">PEQUEÑAS PREGUNTAS. GRANDES DESCUBRIMIENTOS.</span>
      <button id="library" className="outline" onClick={() => setModal({ title: 'Tu cuaderno del calor', content: <Library /> })}>Todo el contenido ↗</button>
    </header>
    <div className="shell">
      <aside>
        <div className="eyebrow">TU EXPEDICIÓN</div><h2>Explora lo<br />invisible<span>.</span></h2><p className="muted">7 misiones · A tu ritmo</p>
        <nav id="map" aria-label="Mapa de misiones">{LESSONS.map((lesson, index) => {
          const done = progress.completed.includes(index);
          const active = view === 'mission' && progress.current === index;
          return <button key={lesson.title} className={`mission ${active ? 'active' : ''} ${done ? 'done' : ''}`} data-mission={index} aria-current={active ? 'step' : undefined} onClick={() => navigate(index)}><span>{done ? '✓' : String(index + 1).padStart(2, '0')}</span>{lesson.short}</button>;
        })}</nav>
        <div className="progress-box"><span id="progress-label">{progress.completed.length} de 7 completadas</span><progress id="progress" max="7" value={progress.completed.length} aria-labelledby="progress-label" /><small id="storage-note">{sessionOnly ? 'Progreso disponible solo durante esta sesión.' : 'Tu progreso se guarda en este navegador.'}</small></div>
        <button id="final-link" className="outline" onClick={showFinal}>Reto final →</button>
        <button id="reset-progress" className="text-button" onClick={() => setModal({ title: '¿Reiniciar tu expedición?', content: <><p>Se borrarán las misiones completadas en este navegador.</p><button id="confirm-reset" onClick={() => {
          closeModal();
          setProgress({ current: 0, completed: [] });
          navigate(0);
        }}>Sí, reiniciar progreso</button></> })}>Reiniciar progreso</button>
      </aside>
      <main id="main" tabIndex={-1} ref={main}>
        {view === 'final' ? <FinalQuiz key={`final-${revision}`} onBack={() => navigate(progress.current)} /> : <Mission key={`${progress.current}-${revision}`} index={progress.current} helpers={helpers} onComplete={complete} onNavigate={navigate} onFinal={showFinal} />}
      </main>
    </div>
    <footer><span>UN LABORATORIO PARA HACERSE PREGUNTAS</span><span>Basado en la lectura 15 · Física 2.º · pp. 68–69</span></footer>
    {modal && <Modal title={modal.title} onClose={closeModal}>{modal.content}</Modal>}
  </>;
}
