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

const API_BASE = "http://localhost:8001";

export default function RecorderPanel({ onTranscriptReceived, onPartialTranscript }) {
  const [state, setState] = useState(STATES.IDLE);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [retryBlob, setRetryBlob] = useState(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const wsRef = useRef(null);

  if (typeof MediaRecorder === "undefined") {
    return (
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-400 text-sm text-center">
        Your browser does not support audio recording. Please use Chrome or Firefox.
      </div>
    );
  }

  // ── WebSocket live preview (best-effort, non-blocking) ──────────
  const startLivePreview = (mediaStream) => {
    try {
      const ws = new WebSocket(`ws://localhost:8001/ws/transcribe`);
      wsRef.current = ws;
      const previewChunks = [];
      let previewTimer = null;

      ws.onopen = () => {
        previewTimer = setInterval(() => {
          if (previewChunks.length === 0) return;
          const blob = new Blob(previewChunks.splice(0), { type: "audio/webm" });
          blob.arrayBuffer().then(buf => {
            if (ws.readyState === WebSocket.OPEN) ws.send(buf);
          });
        }, 2500);
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "partial" && msg.full) {
            onPartialTranscript?.({
              transcript: msg.full,
              language: msg.language,
              status: "streaming",
            });
          }
        } catch {}
      };

      ws.onerror = () => { clearInterval(previewTimer); };
      ws.onclose = () => { clearInterval(previewTimer); };

      // Feed preview chunks from MediaRecorder
      const previewRecorder = new MediaRecorder(mediaStream, { mimeType: "audio/webm" });
      previewRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) previewChunks.push(e.data);
      };
      previewRecorder.start(500);

      return () => {
        previewRecorder.stop();
        clearInterval(previewTimer);
        ws.close();
      };
    } catch {
      return () => {};
    }
  };

  // ── Main upload after recording stops ──────────────────────────
  const uploadBlob = async (blob) => {
    setState(STATES.UPLOADING);
    setRetryBlob(blob);

    try {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");

      setState(STATES.TRANSCRIBING);
      const res = await fetch(`${API_BASE}/api/transcribe`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `Server error ${res.status}` }));
        if (res.status === 413) throw new Error("Recording too large (max 100 MB). Please record a shorter session.");
        if (res.status === 422) throw new Error("Audio could not be processed. Please try recording again.");
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const data = await res.json();

      if (data.status === "no_speech_detected") {
        setError("No speech detected. Please speak clearly and try again.");
        setState(STATES.ERROR);
        return;
      }

      onTranscriptReceived?.(data);
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

      // Start live WebSocket preview (non-blocking)
      const stopPreview = startLivePreview(mediaStream);

      // Main recorder — collects full audio for reliable POST upload
      const recorder = new MediaRecorder(mediaStream, { mimeType: "audio/webm" });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stopPreview();
        wsRef.current?.close();
        mediaStream.getTracks().forEach(t => t.stop());
        setStream(null);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        uploadBlob(blob);
      };

      mediaRef.current = recorder;
      recorder.start(250);
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

  const retry = () => {
    if (retryBlob) uploadBlob(retryBlob);
  };

  const handleMicClick = () => {
    if (state === STATES.RECORDING) stopRecording();
    else if ([STATES.IDLE, STATES.DONE, STATES.ERROR].includes(state)) startRecording();
  };

  const stateLabel = {
    idle: "Tap mic to start recording",
    recording: "Recording — speak now...",
    uploading: "Uploading audio...",
    transcribing: "Transcribing with Whisper...",
    done: "Done — tap mic to record again",
    error: "Error",
  };

  const stateColor = {
    idle: "text-[#8892A4]",
    recording: "text-[#FF3B5C] animate-pulse",
    uploading: "text-[#00D4FF]",
    transcribing: "text-[#7B61FF]",
    done: "text-[#00FF88]",
    error: "text-[#FF3B5C]",
  };

  return (
    <div className="rounded-2xl border border-[#1E2A3A] bg-[#111827] p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm uppercase tracking-widest">
          Record Consultation
        </h2>
        <div className="flex items-center gap-3">
          <TimerDisplay active={state === STATES.RECORDING} />
          <span className="text-xs text-[#8892A4]">Auto-detect · 200+ languages</span>
        </div>
      </div>

      {/* Waveform */}
      <WaveformVisualizer stream={stream} active={state === STATES.RECORDING} />

      {/* Mic button */}
      <div className="flex flex-col items-center gap-3 py-2">
        <MicButton state={state} onClick={handleMicClick} />
        <span className={`text-xs font-medium ${stateColor[state]}`}>
          {stateLabel[state]}
        </span>
      </div>

      {/* Upload/transcribing spinner */}
      {(state === STATES.UPLOADING || state === STATES.TRANSCRIBING) && (
        <div
          data-testid="upload-indicator"
          className="flex items-center justify-center gap-2 text-[#00D4FF] text-sm"
        >
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {state === STATES.UPLOADING ? "Uploading audio..." : "Transcribing with Whisper AI..."}
        </div>
      )}

      {/* Error */}
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

      {state === STATES.RECORDING && (
        <p className="text-center text-[#8892A4]/60 text-xs">
          ✦ Live transcript appears below as you speak
        </p>
      )}
    </div>
  );
}
