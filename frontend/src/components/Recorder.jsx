import { useState, useRef, useCallback } from "react";
import MicButton from "./MicButton";
import WaveformVisualizer from "./WaveformVisualizer";
import TimerDisplay from "./TimerDisplay";

const STATES = {
  IDLE: "idle",
  RECORDING: "recording",
  PROCESSING: "processing",
  DONE: "done",
  ERROR: "error",
};

const WS_URL = "ws://localhost:8001/ws/transcribe";
const CHUNK_INTERVAL_MS = 2000; // send audio chunk every 2 seconds for live transcription

export default function RecorderPanel({ onTranscriptReceived, onPartialTranscript }) {
  const [state, setState] = useState(STATES.IDLE);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const mediaRef = useRef(null);
  const wsRef = useRef(null);
  const chunksRef = useRef([]);
  const chunkTimerRef = useRef(null);

  // Check MediaRecorder support
  if (typeof MediaRecorder === "undefined") {
    return (
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-400 text-sm text-center">
        Your browser does not support audio recording. Please use Chrome or Firefox.
      </div>
    );
  }

  const sendChunk = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (chunksRef.current.length === 0) return;

    // Take all accumulated chunks, send as one blob, reset buffer
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    chunksRef.current = [];

    blob.arrayBuffer().then((buf) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(buf);
      }
    });
  }, []);

  const startRecording = async () => {
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);
      chunksRef.current = [];

      // Open WebSocket connection
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        // Start sending chunks every CHUNK_INTERVAL_MS for live transcription
        chunkTimerRef.current = setInterval(sendChunk, CHUNK_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "partial") {
            // Live update — show text as it arrives
            onPartialTranscript?.({
              transcript: msg.full,
              language: msg.language,
              status: "streaming",
            });
          } else if (msg.type === "error") {
            console.warn("Transcription chunk error:", msg.message);
          }
        } catch (e) {
          console.error("WS message parse error:", e);
        }
      };

      ws.onerror = () => {
        // WebSocket failed — fall back to regular upload
        clearInterval(chunkTimerRef.current);
        fallbackUpload(mediaStream);
      };

      ws.onclose = () => {
        clearInterval(chunkTimerRef.current);
      };

      // Set up MediaRecorder
      const recorder = new MediaRecorder(mediaStream, { mimeType: "audio/webm" });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Send final remaining chunk
        sendChunk();
        mediaStream.getTracks().forEach((t) => t.stop());
        setStream(null);
        setState(STATES.PROCESSING);

        // Close WebSocket after short delay to let final chunk process
        setTimeout(() => {
          ws.close();
          setState(STATES.DONE);
          // Signal done with whatever was accumulated
          onTranscriptReceived?.({ status: "done" });
        }, 1500);
      };

      mediaRef.current = recorder;
      recorder.start(500); // collect data every 500ms
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

  // Fallback: if WebSocket fails, do a regular POST upload
  const fallbackUpload = async (mediaStream) => {
    setState(STATES.PROCESSING);
    const allChunks = [...chunksRef.current];
    chunksRef.current = [];
    mediaStream.getTracks().forEach((t) => t.stop());
    setStream(null);

    try {
      const blob = new Blob(allChunks, { type: "audio/webm" });
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      const res = await fetch("http://localhost:8001/api/transcribe", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `Server error ${res.status}` }));
        if (res.status === 413) throw new Error("Recording is too large (max 100 MB).");
        if (res.status === 422) throw new Error("Audio could not be processed. Please try again.");
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      onTranscriptReceived?.(data);
      setState(STATES.DONE);
    } catch (err) {
      setError(err.message || "Upload failed. Check your connection and try again.");
      setState(STATES.ERROR);
    }
  };

  const stopRecording = () => {
    clearInterval(chunkTimerRef.current);
    mediaRef.current?.stop();
  };

  const handleMicClick = () => {
    if (state === STATES.RECORDING) stopRecording();
    else if ([STATES.IDLE, STATES.DONE, STATES.ERROR].includes(state)) startRecording();
  };

  const stateLabel = {
    idle: "Tap mic to start recording",
    recording: "Recording — speak now...",
    processing: "Processing final audio...",
    done: "Done — tap mic to record again",
    error: "Error",
  };

  const stateColor = {
    idle: "text-[#8892A4]",
    recording: "text-[#FF3B5C]",
    processing: "text-[#00D4FF]",
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

      {/* Live waveform */}
      <WaveformVisualizer stream={stream} active={state === STATES.RECORDING} />

      {/* Mic button */}
      <div className="flex flex-col items-center gap-3 py-2">
        <MicButton state={state} onClick={handleMicClick} />
        <span className={`text-xs font-medium ${stateColor[state]}`}>
          {stateLabel[state]}
        </span>
      </div>

      {/* Processing spinner */}
      {state === STATES.PROCESSING && (
        <div
          data-testid="upload-indicator"
          className="flex items-center justify-center gap-2 text-[#00D4FF] text-sm"
        >
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Finalising transcript...
        </div>
      )}

      {/* Error */}
      {state === STATES.ERROR && error && (
        <div className="rounded-lg border border-[#FF3B5C]/30 bg-[#FF3B5C]/10 p-3 flex items-start justify-between gap-3">
          <p className="text-[#FF3B5C] text-sm">{error}</p>
          <button
            onClick={() => { setState(STATES.IDLE); setError(null); }}
            className="text-xs px-3 py-1 rounded-lg border border-[#8892A4] text-[#8892A4] hover:bg-white/5 transition-colors shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Live transcription hint */}
      {state === STATES.RECORDING && (
        <p className="text-center text-[#8892A4]/60 text-xs">
          ✦ Transcript appears live below as you speak
        </p>
      )}
    </div>
  );
}
