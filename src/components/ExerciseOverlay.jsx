import { useLayoutEffect, useRef, useState } from 'react';
import AnswerChoices from './AnswerChoices.jsx';

export default function ExerciseOverlay({ lesson, success, onCorrect, onClose, onNext, last }) {
  const panel = useRef(null);
  const [feedback, setFeedback] = useState('');
  useLayoutEffect(() => {
    const opener = document.activeElement;
    const experiment = panel.current.closest('.experiment');
    panel.current.focus({ preventScroll: true });
    panel.current.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    return () => {
      queueMicrotask(() => {
        if (!experiment.isConnected || experiment.querySelector('[role="dialog"]')) return;
        const fallback = experiment.querySelector('#scene-replay:not([hidden])') || experiment.querySelector('.exercise-reopen');
        const target = opener?.isConnected && opener !== document.body && !opener.disabled && !opener.closest('[inert]') ? opener : fallback;
        target?.focus({ preventScroll: true });
      });
    };
  }, [success]);
  return <div className="exercise-overlay">
    <div className={`exercise-overlay-card ${success ? 'exercise-congrats' : 'challenge'}`} role="dialog" aria-labelledby="exercise-overlay-title" tabIndex={-1} ref={panel}
      onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); onClose(); } }}>
      <button className="exercise-overlay-close" aria-label="Cerrar reto" onClick={onClose}>✕</button>
      {success ? <>
        <div className="congrats-seal" aria-hidden="true">✓</div>
        <span className="eyebrow">MISIÓN COMPLETADA</span>
        <h2 id="exercise-overlay-title">¡Lo lograste!</h2>
        <p>{lesson.why}</p>
        <p className="congrats-note">Tu respuesta es correcta. Sigue explorando.</p>
        <button className="primary" onClick={onNext}>{last ? 'Ir al reto final' : 'Siguiente misión'} →</button>
        <button className="text-button" onClick={onClose}>Seguir experimentando</button>
      </> : <>
        <span className="eyebrow">PONLO A PRUEBA</span>
        <h2 id="exercise-overlay-title">Ya experimentaste. ¿Qué descubriste?</h2>
        <p>{lesson.challenge}</p>
        <AnswerChoices answers={lesson.answers} correct={lesson.answer} onAnswer={right => {
          if (right) onCorrect();
          else setFeedback(`Vuelve a observar. ${lesson.hint} Puedes intentarlo otra vez.`);
        }} />
        <button className="text-button" id="hint" onClick={() => setFeedback(lesson.hint)}>Necesito una pista</button>
        <p className="feedback" id="feedback" aria-live="polite">{feedback}</p>
      </>}
    </div>
  </div>;
}
