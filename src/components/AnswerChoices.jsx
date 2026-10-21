import { useState } from 'react';

export default function AnswerChoices({ answers, correct, onAnswer }) {
  const [attempts, setAttempts] = useState([]);
  return <div className="answers">{answers.map((answer, index) => (
    <button key={answer} className={`answer ${attempts.includes(index) ? index === correct ? 'correct' : 'wrong' : ''}`}
      onClick={() => {
        setAttempts((previous) => [...new Set([...previous, index])]);
        onAnswer(index === correct);
      }}>{answer}</button>
  ))}</div>;
}
