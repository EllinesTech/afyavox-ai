import { useState } from "react";
import Navbar from "./components/Navbar";
import RecorderPanel from "./components/Recorder";
import TranscriptPanel from "./components/Transcript";
import NotesPanel from "./components/Notes";

export default function App() {
  const [transcriptionResult, setTranscriptionResult] = useState(null);
  const [transcriptStatus, setTranscriptStatus] = useState("idle");
  const [transcriptError, setTranscriptError] = useState(null);

  // Called every 2 seconds with live partial text while recording
  const handlePartialTranscript = (partial) => {
    setTranscriptionResult(partial);
    setTranscriptStatus("streaming");
    setTranscriptError(null);
  };

  // Called when recording fully stops
  const handleTranscriptReceived = (result) => {
    if (!result) return;

    if (result.status === "no_speech_detected") {
      setTranscriptStatus("error");
      setTranscriptError("No speech detected. Please try again.");
      return;
    }

    if (result.status === "done") {
      // Streaming session ended — keep whatever partial text we have
      setTranscriptStatus("done");
      return;
    }

    // Fallback upload result
    setTranscriptionResult(result);
    setTranscriptStatus("done");
    setTranscriptError(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-8">
          <img
            src="/Logo/Afyavox Logo big no bg.png"
            alt="AfyaVox AI"
            className="h-16 mx-auto mb-4 object-contain"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <h1 className="text-2xl font-bold text-white mb-2">
            Afya<span className="text-[#00D4FF]">Vox</span> AI
          </h1>
          <p className="text-[#8892A4] text-sm max-w-xl mx-auto">
            Speak in any language. Watch the transcript appear live.
            Get structured clinical notes instantly. 200+ languages worldwide.
          </p>
        </div>

        {/* Recorder */}
        <div className="mb-6">
          <RecorderPanel
            onTranscriptReceived={handleTranscriptReceived}
            onPartialTranscript={handlePartialTranscript}
          />
        </div>

        {/* Transcript + Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TranscriptPanel
            transcript={transcriptionResult?.transcript || ""}
            language={transcriptionResult?.language || ""}
            status={transcriptStatus}
            error={transcriptError}
          />
          <NotesPanel notes={null} status="idle" />
        </div>

        <p className="text-center text-[#8892A4]/40 text-xs mt-8">
          AfyaVox AI v1.0 · © Ellines Tech · Elijah Mwangi
        </p>
      </main>
    </div>
  );
}
