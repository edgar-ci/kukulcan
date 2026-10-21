import { glossaryHtml } from '../data/glossary.js';
import { EXPLANATIONS } from '../data/explanations.js';
import LessonIllustration from './LessonIllustration.jsx';

export default function LessonExplanation({ lesson, index, openModal }) {
  const context = EXPLANATIONS[index];
  // Keep original copy intact, with enough of the opening to make sense alone.
  const splitAt = lesson.curious.indexOf('. ', index === 1 ? 4 : 0) + 1;
  const curiosityLead = lesson.curious.slice(0, splitAt);
  const curiosityRest = lesson.curious.slice(splitAt).trim();
  return <section className="explanation" aria-label="Explicación y recursos">
    <div className="explanation-reading">
      <figure className="lesson-sketch">
        <LessonIllustration index={index} />
        <figcaption>{context.caption}</figcaption>
      </figure>
      <div className="explanation-copy">
        <article className="explanation-idea" aria-labelledby="lesson-idea">
          <span className="eyebrow">¿POR QUÉ OCURRE?</span>
          <h2 id="lesson-idea">{lesson.question}</h2>
          <p>{lesson.explain}</p>
        </article>
        <section className="explanation-science" aria-labelledby="science-question">
          <h3 id="science-question">{context.question}</h3>
          <div className="science-detail"><p>{lesson.detail}</p></div>
        </section>
      </div>
    </div>
    <section className="explanation-curiosity" aria-labelledby="curiosity-question">
      <div className="curiosity-mark" aria-hidden="true"><span>¿</span><span>?</span></div>
      <div className="curiosity-copy">
        <span className="eyebrow">DEL LABORATORIO A TU DÍA A DÍA</span>
        <h2 id="curiosity-question">{lesson.curiosity}</h2>
        <p className="curiosity-lead">{curiosityLead}</p>
        <details>
          <summary id="curiosity"><span className="when-closed">Descubrir por qué</span><span className="when-open">Cerrar descubrimiento</span><span className="disclosure-arrow" aria-hidden="true">↓</span></summary>
          <div className="curiosity-detail">
            <p>{curiosityRest}</p>
            <a href="https://phet.colorado.edu/es/simulations/energy-forms-and-changes" target="_blank" rel="noopener noreferrer">Explorar en PhET ↗</a>
            <p className="phet-hint">Cambia los materiales y observa la energía.</p>
          </div>
        </details>
      </div>
    </section>
    <div className="explanation-tools"><button className="text-button" id="glossary" onClick={() => openModal('Palabras para explorar', glossaryHtml)}>Abrir diccionario de ciencia ↗</button></div>
  </section>;
}
