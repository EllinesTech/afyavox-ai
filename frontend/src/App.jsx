import { useState } from "react";
import Navbar from "./components/Navbar";
import RecorderPanel from "./components/Recorder";
import TranscriptPanel from "./components/Transcript";
import NotesPanel from "./components/Notes";

export default function App() {
  const [transcriptionResult, setTranscriptionResult] = useState(null);
  const [transcriptStatus, setTranscriptStatus] = useState("idle");
  const [transcriptError, setTranscriptError] = useState(null);

  const handleTranscriptReceived = (result) => {
    if (result.status === "no_speech_detected") {
      setTranscriptStatus("error");
      setTranscriptError("No speech detected in the recording. Please try again.");
      return;
    }
    setTranscriptionResult(result);
    setTranscriptStatus("done");
    setTranscriptError(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />

      {/* Main content — offset for fixed navbar */}
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

        {/* Hero section */}
        <div className="text-center mb-8">
          <img
            src="/Logo/Afyavox Logo big no bg.png"
            alt="AfyaVox AI"
            className="h-16 mx-auto mb-4 object-contain"
          />
          <p className="text-[#8892A4] text-sm max-w-xl mx-auto">
            Speak in any language. Get structured clinical notes instantly.
            Supports 200+ languages worldwide.
          </p>
        </div>

        {/* Recorder — full width hero panel */}
        <div className="mb-6">
          <RecorderPanel
            onTranscriptReceived={handleTranscriptReceived}
            onTranscribing={() => setTranscriptStatus("loading")}
          />
        </div>

        {/* Transcript + Notes — side by side on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TranscriptPanel
            transcript={transcriptionResult?.transcript || ""}
            language={transcriptionResult?.language || ""}
            status={transcriptStatus}
            error={transcriptError}
          />
          <NotesPanel notes={null} status="idle" />
        </div>

        {/* Footer */}
        <p className="text-center text-[#8892A4]/40 text-xs mt-8">
          AfyaVox AI v1.0 · © Ellines Tech · Elijah Mwangi
        </p>
      </main>
    </div>
  );
}
