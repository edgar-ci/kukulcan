import { useState } from 'react';
import { LESSONS } from '../data/content.js';
import { glossaryHtml } from '../data/glossary.js';
import Experiment from './Experiment.jsx';
import AnswerChoices from './AnswerChoices.jsx';

export default function Mission({ index, helpers, onComplete, onNavigate, onFinal }) {
  const lesson = LESSONS[index];
  const [feedback, setFeedback] = useState('');
  return <>
    <div className="topline"><span className="eyebrow">MISIÓN {String(index + 1).padStart(2, '0')} / 07</span><span className="badge">EXPERIMENTA · DESCUBRE · COMPRENDE</span></div>
    <h1>{lesson.title}</h1><p className="intro">{lesson.intro}</p>
    <Experiment index={index} helpers={helpers} />
    <div className="below">
      <section className="explanation">
        <span className="eyebrow">LA IDEA QUE TE LLEVAS</span><h3 style={{ marginTop: 10 }}>{lesson.question}</h3><p>{lesson.explain}</p>
        <details><summary>Un poco más de ciencia</summary><p>{lesson.detail}</p></details>
        <button className="text-button" id="glossary" onClick={() => helpers.openModal('Palabras para explorar', glossaryHtml)}>Abrir diccionario de ciencia ↗</button>
        <button className="curiosity" id="curiosity" onClick={() => helpers.openModal(lesson.curiosity, `<p>${lesson.curious}</p><p><a target="_blank" rel="noopener noreferrer" href="https://phet.colorado.edu/es/simulations/energy-forms-and-changes">Explorar en PhET ↗</a> — cambia los materiales y observa la energía.</p>`)}>
          <span>✦ SIGUE TU CURIOSIDAD</span>{lesson.curiosity} ↗
        </button>
      </section>
      <section className="challenge">
        <span className="eyebrow">PONLO A PRUEBA</span><h3 style={{ marginTop: 10 }}>Un pequeño reto</h3><p>{lesson.challenge}</p>
        <AnswerChoices answers={lesson.answers} correct={lesson.answer} onAnswer={(right) => {
          setFeedback(right ? `¡Lo descubriste! ${lesson.why}` : `Vuelve a observar. ${lesson.hint} Puedes intentarlo otra vez.`);
          if (right) onComplete(index);
        }} />
        <button className="text-button" id="hint" onClick={() => setFeedback(lesson.hint)}>Necesito una pista</button>
        <p className="feedback" id="feedback" aria-live="polite">{feedback}</p>
      </section>
    </div>
    <div className="navigation">
      <button className="outline" id="prev" disabled={index === 0} onClick={() => onNavigate(index - 1)}>← Anterior</button>
      <span>La curiosidad no tiene prisa.</span>
      <button className="primary" id="next" onClick={() => index === 6 ? onFinal() : onNavigate(index + 1)}>{index === 6 ? 'Ir al reto final' : 'Siguiente misión'} →</button>
    </div>
  </>;
}
