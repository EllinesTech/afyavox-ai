import { useState } from "react";
import Navbar from "./components/Navbar";
import RecorderPanel from "./components/Recorder";
import TranscriptPanel from "./components/Transcript";
import NotesPanel from "./components/Notes";

export default function App() {
  const [transcriptionResult, setTranscriptionResult] = useState(null);
  const [transcriptStatus, setTranscriptStatus] = useState("idle");
  const [transcriptError, setTranscriptError] = useState(null);

  // Live partial transcript from WebSocket (best-effort preview)
  const handlePartialTranscript = (partial) => {
    setTranscriptionResult(partial);
    setTranscriptStatus("streaming");
    setTranscriptError(null);
  };

  // Final reliable transcript from POST upload
  const handleTranscriptReceived = (result) => {
    if (!result) return;
    setTranscriptionResult(result);
    setTranscriptStatus("done");
    setTranscriptError(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

        {/* Hero — logo with transparent background */}
        <div className="text-center mb-8">
          <img
            src="/Logo/Afyavox Logo big no bg.png"
            alt="AfyaVox AI"
            className="h-20 mx-auto mb-3 object-contain drop-shadow-[0_0_20px_rgba(0,212,255,0.3)]"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <p className="text-[#8892A4] text-sm max-w-xl mx-auto leading-relaxed">
            Speak in any language. Watch the transcript appear live.<br/>
            Get structured clinical notes instantly. <span className="text-[#00D4FF]">200+ languages worldwide.</span>
          </p>
        </div>

        {/* Recorder */}
        <div className="mb-6">
          <RecorderPanel
            onTranscriptReceived={handleTranscriptReceived}
            onPartialTranscript={handlePartialTranscript}
          />
        </div>

        {/* Transcript + Notes side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TranscriptPanel
            transcript={transcriptionResult?.transcript || ""}
            language={transcriptionResult?.language || ""}
            status={transcriptStatus}
            error={transcriptError}
          />
          <NotesPanel notes={null} status="idle" />
        </div>

        <p className="text-center text-[#8892A4]/40 text-xs mt-10">
          AfyaVox AI v1.0 · © Ellines Tech · Elijah Mwangi
        </p>
      </main>
    </div>
  );
}
