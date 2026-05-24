import { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

export default function Dropzone({ onAnalyzed }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: async (files) => {
      if (!files.length) return;
      setStatus("uploading");
      setError("");

      const form = new FormData();
      form.append("file", files[0]);

      try {
        setStatus("analyzing");
        const res = await axios.post("http://127.0.0.1:8000/analyze", form);
        setStatus("done");
        onAnalyzed(res.data);
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        setError("Analysis failed. Make sure the backend is running.");
        setStatus("idle");
      }
    },
  });

  return (
    <div style={{ textAlign: "center" }}>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #7c6ff7",
          borderRadius: "16px",
          padding: "3rem",
          cursor: "pointer",
          background: isDragActive ? "#1a1a2e" : "#13131f",
          transition: "background 0.2s",
        }}
      >
        <input {...getInputProps()} />
        {status === "idle" && (
          <>
            <p style={{ fontSize: "3rem" }}>📄</p>
            <p style={{ fontSize: "1.1rem", marginTop: "1rem" }}>
              {isDragActive
                ? "Drop it here!"
                : "Drag & drop a diagram image, or click to select"}
            </p>
            <p style={{ color: "#666", marginTop: "0.5rem" }}>
              PNG, JPG, WEBP supported
            </p>
          </>
        )}
        {status === "uploading" && <p>⏳ Uploading...</p>}
        {status === "analyzing" && (
          <>
            <p style={{ fontSize: "1.2rem" }}>🔍 Analyzing diagram...</p>
            <p style={{ color: "#888", marginTop: "0.5rem" }}>
              Running OCR → NER → Knowledge Graph → Gemini
            </p>
          </>
        )}
        {status === "done" && <p style={{ color: "#4caf50" }}>✅ Done!</p>}
      </div>
      {error && <p style={{ color: "#f44336", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
}
