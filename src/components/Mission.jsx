import { useCallback, useMemo, useRef, useState } from 'react';
import { LESSONS } from '../data/content.js';
import LessonExplanation from './LessonExplanation.jsx';
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
    <div className="mission-workbench">
    <Experiment index={index} helpers={experimentHelpers} blocked={overlay !== null}
      action={unlocked && <button className="text-button exercise-reopen" onClick={() => setOverlay(answered ? 'success' : 'challenge')}>{answered ? 'Ver logro ✓' : 'Responder el reto'}</button>}>
      {overlay && <ExerciseOverlay lesson={lesson} success={overlay === 'success'} last={index === 6} onClose={() => setOverlay(null)} onNext={next} onCorrect={() => {
        onComplete(index);
        setAnswered(true);
        setOverlay('success');
      }} />}
    </Experiment>
    <div className="below">
      <LessonExplanation lesson={lesson} index={index} openModal={helpers.openModal} />
    </div>
    </div>
    <div className="navigation">
      <button className="outline" id="prev" disabled={index === 0} onClick={() => onNavigate(index - 1)}>← Anterior</button>
      <span>La curiosidad no tiene prisa.</span>
      <button className="primary" id="next" onClick={() => index === 6 ? onFinal() : onNavigate(index + 1)}>{index === 6 ? 'Ir al reto final' : 'Siguiente misión'} →</button>
    </div>
  </>;
}
