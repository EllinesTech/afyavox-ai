import { useState, useRef } from "react";
import MicButton from "./MicButton";
import WaveformVisualizer from "./WaveformVisualizer";
import TimerDisplay from "./TimerDisplay";

const STATES = {
  IDLE: "idle",
  RECORDING: "recording",
  UPLOADING: "uploading",
  TRANSCRIBING: "transcribing",
  DONE: "done",
  ERROR: "error",
};

export default function RecorderPanel({ onTranscriptReceived }) {
  const [state, setState] = useState(STATES.IDLE);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [retryBlob, setRetryBlob] = useState(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  // Check MediaRecorder support
  if (typeof MediaRecorder === "undefined") {
    return (
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-400 text-sm text-center">
        Your browser does not support audio recording. Please use Chrome or Firefox.
      </div>
    );
  }

  const uploadBlob = async (blob) => {
    setState(STATES.UPLOADING);
    setRetryBlob(blob);
    try {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      const res = await fetch("http://localhost:8000/api/transcribe", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `Server error ${res.status}` }));
        if (res.status === 413) throw new Error("Recording is too large (max 100 MB). Please record a shorter session.");
        if (res.status === 422) throw new Error("Audio could not be processed. Please try recording again.");
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      setState(STATES.TRANSCRIBING);
      const data = await res.json();
      onTranscriptReceived(data);
      setState(STATES.DONE);
      setRetryBlob(null);
    } catch (err) {
      setError(err.message || "Upload failed. Check your connection and try again.");
      setState(STATES.ERROR);
    }
  };

  const startRecording = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);
      chunksRef.current = [];
      const recorder = new MediaRecorder(mediaStream, { mimeType: "audio/webm" });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        mediaStream.getTracks().forEach(t => t.stop());
        setStream(null);
        uploadBlob(blob);
      };
      mediaRef.current = recorder;
      recorder.start(250); // collect data every 250ms
      setState(STATES.RECORDING);
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access in your browser settings.");
      } else {
        setError(err.message || "Could not access microphone.");
      }
      setState(STATES.ERROR);
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
  };

  const handleMicClick = () => {
    if (state === STATES.RECORDING) stopRecording();
    else if (state === STATES.IDLE || state === STATES.DONE || state === STATES.ERROR) startRecording();
  };

  const retry = () => {
    if (retryBlob) uploadBlob(retryBlob);
  };

  const stateLabel = {
    idle: "Ready to record",
    recording: "Recording...",
    uploading: "Uploading...",
    transcribing: "Transcribing...",
    done: "Done — click mic to record again",
    error: "Error",
  };

  return (
    <div className="rounded-2xl border border-[#1E2A3A] bg-[#111827] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm uppercase tracking-widest">
          Record Consultation
        </h2>
        <div className="flex items-center gap-3">
          <TimerDisplay active={state === STATES.RECORDING} />
          <span className="text-xs text-[#8892A4]">Auto-detect language</span>
        </div>
      </div>

      {/* Waveform */}
      <WaveformVisualizer stream={stream} active={state === STATES.RECORDING} />

      {/* Mic button + status */}
      <div className="flex flex-col items-center gap-3 py-2">
        <MicButton state={state} onClick={handleMicClick} />
        <span className="text-xs text-[#8892A4]">{stateLabel[state]}</span>
      </div>

      {/* Upload/transcribing indicator */}
      {(state === STATES.UPLOADING || state === STATES.TRANSCRIBING) && (
        <div
          data-testid="upload-indicator"
          className="flex items-center justify-center gap-2 text-[#00D4FF] text-sm"
        >
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {state === STATES.UPLOADING ? "Uploading audio..." : "Transcribing with Whisper..."}
        </div>
      )}

      {/* Error state */}
      {state === STATES.ERROR && error && (
        <div className="rounded-lg border border-[#FF3B5C]/30 bg-[#FF3B5C]/10 p-3 flex items-start justify-between gap-3">
          <p className="text-[#FF3B5C] text-sm">{error}</p>
          <div className="flex gap-2 shrink-0">
            {retryBlob && (
              <button
                onClick={retry}
                className="text-xs px-3 py-1 rounded-lg border border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
              >
                Retry
              </button>
            )}
            <button
              onClick={() => { setState(STATES.IDLE); setError(null); }}
              className="text-xs px-3 py-1 rounded-lg border border-[#8892A4] text-[#8892A4] hover:bg-white/5 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
