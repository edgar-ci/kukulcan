import { useState } from 'react';
import { LESSONS, MATERIALS } from '../data/content.js';

// Only repository-authored educational HTML/SVG belongs here, never user input.
export function StaticHtml({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Library() {
  return <>
    {LESSONS.map((lesson, index) => <section key={lesson.title}><h3>{index + 1}. {lesson.title}</h3><p>{lesson.explain}</p><p>{lesson.detail}</p></section>)}
    <h3>Conductividad: valores del libro</h3>
    <table><thead><tr><th>Material</th><th>W/(m·K)</th></tr></thead><tbody>{MATERIALS.map(([name, value]) => <tr key={name}><td>{name}</td><td>{value}</td></tr>)}</tbody></table>
    <p>Valores orientativos, dependientes de las condiciones. Se normaliza la escritura de las unidades.</p>
    <h3>Fuentes y exploración</h3>
    <p>Fuente principal: imagen proporcionada de la lectura 15, «El calor, la temperatura y la energía cinética», Conexiones Física 2.º, páginas 68–69. Adaptación educativa con ilustraciones originales.</p>
    <p><a target="_blank" rel="noopener noreferrer" href="https://phet.colorado.edu/es/simulations/energy-forms-and-changes">PhET: Formas y cambios de energía ↗</a>. Experimenta con materiales y observa los cambios de energía.</p>
    <p><a target="_blank" rel="noopener noreferrer" href="https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry">OpenStax: transferencia de calor y calorimetría (inglés) ↗</a>. Referencia para profundizar acompañado de un adulto.</p>
  </>;
}

export function Materials() {
  const [sorted, setSorted] = useState(false);
  const rows = sorted ? [...MATERIALS].sort((a, b) => b[2] - a[2]) : MATERIALS;
  return <>
    <p>Valores de las páginas del libro, en <b>W/(m·K)</b>. Son orientativos: cambian según composición y condiciones. Las barras usan el punto medio de cada rango y escala lineal.</p>
    <div className="table-wrap"><table><thead><tr><th>Material</th><th><button id="sort-materials" onClick={() => setSorted(!sorted)}>Conductividad {sorted ? '↓' : '↕'}</button></th><th>Comparación</th></tr></thead>
      <tbody>{rows.map(([name, value, midpoint]) => <tr key={name}><td>{name}</td><td>{value}</td><td><div className="bar" style={{ width: `${midpoint / 378.65 * 100}%` }} /></td></tr>)}</tbody>
    </table></div>
    <p>El cobre facilita transferir calor; el corcho dificulta esa transferencia. El mercurio figura como dato del libro, no como material para experimentar en casa.</p>
  </>;
}

export function Converter() {
  const [energy, setEnergy] = useState('1');
  const [unit, setUnit] = useState('cal');
  const amount = Number(energy);
  const valid = energy !== '' && Number.isFinite(amount) && amount >= 0 && amount <= 1e6;
  const cal = unit === 'J' ? amount / 4.187 : unit === 'kcal' ? amount * 1000 : amount;
  const format = (value) => value.toLocaleString('es-MX', { maximumFractionDigits: 4 });
  return <>
    <label htmlFor="energy">Energía </label><input id="energy" type="number" min="0" max="1000000" step="any" value={energy} onChange={(event) => setEnergy(event.target.value)} />{' '}
    <label htmlFor="unit">Unidad </label><select id="unit" value={unit} onChange={(event) => setUnit(event.target.value)}><option>cal</option><option>kcal</option><option>J</option></select>
    <p id="conversion-result" role="status">{valid ? `${format(cal)} cal = ${format(cal / 1000)} kcal ≈ ${format(cal * 4.187)} J` : 'Escribe un número entre 0 y 1 000 000.'}</p>
    <p>Usamos 4.187 J/cal, la aproximación del libro.</p>
  </>;
}

export function Calorimeter({ pictures }) {
  const [selected, setSelected] = useState(null);
  const descriptions = [
    'El recipiente reduce el intercambio de calor con el exterior.',
    'El termómetro registra cambios de temperatura. Con la cantidad de materia y sus propiedades, podemos determinar la energía intercambiada.',
    'El agitador ayuda a distribuir la temperatura dentro del recipiente.',
  ];
  return <>
    <div className="calorimeter-explorer">{['Recipiente aislante', 'Termómetro', 'Agitador'].map((name, index) => (
      <button className="lab-object" key={name} onClick={() => setSelected(index)}><StaticHtml html={pictures[index]} /><strong>{name}</strong></button>
    ))}</div>
    <p id="part-description" role="status">{selected === null ? 'Toca una parte para descubrir su función.' : descriptions[selected]}</p>
  </>;
}
