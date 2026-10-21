import { useState } from 'react';
import { FINAL_QUIZ } from '../data/content.js';
import AnswerChoices from './AnswerChoices.jsx';

export default function FinalQuiz({ onBack }) {
  const [solved, setSolved] = useState([]);
  const [feedback, setFeedback] = useState({});
  return <>
    <div className="eyebrow">LA ÚLTIMA MISIÓN</div>
    <h1>Piensa como un científico<span style={{ color: 'var(--orange)' }}>.</span></h1>
    <p className="intro">Cinco situaciones nuevas. Sin reloj, sin penalizaciones. Puedes volver a las misiones cuando quieras.</p>
    {FINAL_QUIZ.map(([question, answers, correct, explanation], index) => (
      <section className="final-card" key={question}>
        <h3>{index + 1}. {question}</h3>
        <AnswerChoices answers={answers} correct={correct} onAnswer={(right) => {
          setFeedback((previous) => ({ ...previous, [index]: right ? `Exacto. ${explanation}` : `Piensa de nuevo: ${explanation} Inténtalo otra vez.` }));
          if (right) setSolved((previous) => [...new Set([...previous, index])]);
        }} />
        <p className="feedback" id={`final-feedback-${index}`} aria-live="polite">{feedback[index]}</p>
      </section>
    ))}
    <p id="final-result" aria-live="polite">{Object.keys(feedback).length > 0 && (solved.length === 5 ? '¡Resolviste los cinco casos! Ahora puedes explicar cómo viaja la energía.' : `${solved.length} de 5 situaciones resueltas.`)}</p>
    <div className="source-links">
      <a target="_blank" rel="noopener noreferrer" href="https://phet.colorado.edu/es/simulations/energy-forms-and-changes">Explora energía y materiales en PhET ↗</a>
      <a target="_blank" rel="noopener noreferrer" href="https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry">Profundiza con OpenStax (en inglés) ↗</a>
    </div>
    <button id="back-missions" className="outline" onClick={onBack}>← Volver a las misiones</button>
  </>;
}
