import { useState } from "react";
import Dropzone from "./components/Dropzone";
import Pipeline from "./components/Pipeline";
import Quiz from "./components/Quiz";
import Viewer from "./components/Viewer";
import "./App.css";

export default function App() {
  const [stage, setStage] = useState("upload");
  const [sessionData, setSessionData] = useState(null);

  function handleAnalyzed(data) {
    setSessionData(data);
    setStage("result");
  }

  return (
    <div className="app">
      <header>
        <h1>ArchViz-XR</h1>
        <p>
          Upload a research diagram — we'll turn it into an interactive 3D
          experience
        </p>
      </header>

      {stage === "upload" && <Dropzone onAnalyzed={handleAnalyzed} />}

      {stage === "result" && sessionData && (
        <>
          <Pipeline data={sessionData} />
          <Viewer data={sessionData} />
          <Quiz questions={sessionData.quiz} />
        </>
      )}
    </div>
  );
}
