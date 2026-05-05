import Recorder from "./components/Recorder";
import Transcript from "./components/Transcript";
import Notes from "./components/Notes";
import { useState } from "react";

export default function App() {
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState(null);

  return (
    <div className="app">
      <h1>Afyavox AI</h1>
      <Recorder onTranscript={setTranscript} />
      <Transcript text={transcript} />
      <Notes data={notes} />
    </div>
  );
}
