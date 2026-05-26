import { useState } from "react";
import axios from "axios";

export default function VoiceQA({ sessionId }) {
  const [status, setStatus] = useState("idle");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  function startListening() {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setError("Your browser doesn't support voice. Use Chrome.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    setStatus("listening");
    setAnswer("");
    setError("");

    recognition.onresult = async (e) => {
      const q = e.results[0][0].transcript;
      setQuestion(q);
      setStatus("thinking");

      try {
        const res = await axios.post("http://127.0.0.1:8000/voice-query", {
          session_id: sessionId,
          question: q,
        });
        setAnswer(res.data.answer);
        setStatus("done");
        speak(res.data.answer);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to get answer. Is the backend running?");
        setStatus("idle");
      }
    };

    recognition.onerror = (e) => {
      setError("Mic error: " + e.error);
      setStatus("idle");
    };

    recognition.onend = () => {
      if (status === "listening") setStatus("idle");
    };

    recognition.start();
  }

  function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    window.speechSynthesis.speak(utter);
  }

  return (
    <div
      style={{
        margin: "2rem 0",
        background: "#13131f",
        borderRadius: "12px",
        padding: "1.5rem",
      }}
    >
      <h2 style={{ color: "#7c6ff7", marginBottom: "0.5rem" }}>Voice Q&A</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1.2rem" }}>
        Ask a question about the diagram — speak and get an answer
      </p>

      <button
        onClick={startListening}
        disabled={status === "listening" || status === "thinking"}
        style={{
          background: status === "listening" ? "#c0392b" : "#7c6ff7",
          color: "white",
          border: "none",
          padding: "0.8rem 2rem",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "1rem",
          transition: "background 0.2s",
        }}
      >
        {status === "idle" && "🎤 Ask a question"}
        {status === "listening" && "🔴 Listening..."}
        {status === "thinking" && "⏳ Thinking..."}
        {status === "done" && "🎤 Ask another"}
      </button>

      {question && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.8rem",
            background: "#1e1e2e",
            borderRadius: "8px",
          }}
        >
          <p style={{ color: "#888", fontSize: "0.8rem" }}>YOU ASKED</p>
          <p style={{ marginTop: "0.3rem" }}>{question}</p>
        </div>
      )}

      {answer && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.8rem",
            background: "#1a2a1a",
            borderRadius: "8px",
            borderLeft: "3px solid #7c6ff7",
          }}
        >
          <p style={{ color: "#888", fontSize: "0.8rem" }}>ANSWER</p>
          <p style={{ marginTop: "0.3rem", lineHeight: 1.7 }}>{answer}</p>
        </div>
      )}

      {error && <p style={{ color: "#f44336", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
}
