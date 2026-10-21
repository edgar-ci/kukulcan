import { useCallback, useMemo, useRef, useState } from 'react';
import { LESSONS } from '../data/content.js';
import { glossaryHtml } from '../data/glossary.js';
import Experiment from './Experiment.jsx';
import ExerciseOverlay from './ExerciseOverlay.jsx';

export default function Mission({ index, helpers, onComplete, onNavigate, onFinal }) {
  const lesson = LESSONS[index];
  const [overlay, setOverlay] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [answered, setAnswered] = useState(false);
  const reported = useRef(false);
  const exerciseSuccess = useCallback(() => {
    if (reported.current) return;
    reported.current = true;
    setUnlocked(true);
    setOverlay('challenge');
  }, []);
  const experimentHelpers = useMemo(() => ({ ...helpers, onSuccess: exerciseSuccess }), [helpers, exerciseSuccess]);
  const next = () => index === 6 ? onFinal() : onNavigate(index + 1);
  return <>
    <div className="topline"><span className="eyebrow">MISIÓN {String(index + 1).padStart(2, '0')} / 07</span><span className="badge">EXPERIMENTA · DESCUBRE · COMPRENDE</span></div>
    <h1>{lesson.title}</h1><p className="intro">{lesson.intro}</p>
    <Experiment index={index} helpers={experimentHelpers} blocked={overlay !== null}
      action={unlocked && <button className="text-button exercise-reopen" onClick={() => setOverlay(answered ? 'success' : 'challenge')}>{answered ? 'Ver logro ✓' : 'Responder el reto'}</button>}>
      {overlay && <ExerciseOverlay lesson={lesson} success={overlay === 'success'} last={index === 6} onClose={() => setOverlay(null)} onNext={next} onCorrect={() => {
        onComplete(index);
        setAnswered(true);
        setOverlay('success');
      }} />}
    </Experiment>
    <div className="below">
      <section className="explanation" aria-label="Explicación y recursos">
        <div className="explanation-reading">
          <article className="explanation-card explanation-idea" aria-labelledby="lesson-idea">
            <span className="eyebrow">LA IDEA QUE TE LLEVAS</span>
            <h2 id="lesson-idea">{lesson.question}</h2>
            <p>{lesson.explain}</p>
          </article>
          <details className="explanation-card explanation-science">
            <summary>Un poco más de ciencia<span className="science-toggle" aria-hidden="true">+</span></summary>
            <p>{lesson.detail}</p>
          </details>
        </div>
        <section className="explanation-card explanation-resources" aria-labelledby="lesson-resources">
          <h2 id="lesson-resources">Para explorar</h2>
          <button className="curiosity" id="curiosity" onClick={() => helpers.openModal(lesson.curiosity, `<p>${lesson.curious}</p><p><a target="_blank" rel="noopener noreferrer" href="https://phet.colorado.edu/es/simulations/energy-forms-and-changes">Explorar en PhET ↗</a> — cambia los materiales y observa la energía.</p>`)}>
            <span>✦ SIGUE TU CURIOSIDAD</span>{lesson.curiosity} ↗
          </button>
          <button className="text-button" id="glossary" onClick={() => helpers.openModal('Palabras para explorar', glossaryHtml)}>Abrir diccionario de ciencia ↗</button>
        </section>
      </section>

    </div>
    <div className="navigation">
      <button className="outline" id="prev" disabled={index === 0} onClick={() => onNavigate(index - 1)}>← Anterior</button>
      <span>La curiosidad no tiene prisa.</span>
      <button className="primary" id="next" onClick={() => index === 6 ? onFinal() : onNavigate(index + 1)}>{index === 6 ? 'Ir al reto final' : 'Siguiente misión'} →</button>
    </div>
  </>;
}
