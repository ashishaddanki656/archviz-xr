import { useState } from "react";

export default function Quiz({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!questions || questions.length === 0) return null;

  function handleSelect(qi, oi) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qi]: oi }));
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  const score = questions.reduce(
    (acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0),
    0,
  );

  return (
    <div
      style={{
        margin: "2rem 0",
        background: "#13131f",
        borderRadius: "12px",
        padding: "1.5rem",
      }}
    >
      <h2 style={{ color: "#7c6ff7", marginBottom: "1.5rem" }}>Quiz</h2>

      {questions.map((q, qi) => (
        <div key={qi} style={{ marginBottom: "1.5rem" }}>
          <p style={{ marginBottom: "0.75rem", fontWeight: "500" }}>
            {qi + 1}. {q.q}
          </p>
          {q.options.map((opt, oi) => {
            let bg = "#1e1e2e";
            if (submitted) {
              if (oi === q.answer) bg = "#1b3a1b";
              else if (answers[qi] === oi) bg = "#3a1b1b";
            } else if (answers[qi] === oi) {
              bg = "#2a2a4a";
            }
            return (
              <div
                key={oi}
                onClick={() => handleSelect(qi, oi)}
                style={{
                  padding: "0.6rem 1rem",
                  marginBottom: "0.4rem",
                  borderRadius: "8px",
                  background: bg,
                  cursor: submitted ? "default" : "pointer",
                  border: "1px solid #2a2a3a",
                  transition: "background 0.2s",
                }}
              >
                {opt}
              </div>
            );
          })}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          style={{
            background: "#7c6ff7",
            color: "white",
            border: "none",
            padding: "0.75rem 2rem",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Submit
        </button>
      ) : (
        <p style={{ color: "#4caf50", fontWeight: "bold" }}>
          Score: {score} / {questions.length}
        </p>
      )}
    </div>
  );
}
