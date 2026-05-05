import { useState, useRef } from "react";

export default function Recorder({ onTranscript }) {
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef(null);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRef.current = new MediaRecorder(stream);
    const chunks = [];
    mediaRef.current.ondataavailable = (e) => chunks.push(e.data);
    mediaRef.current.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      // TODO: POST to /api/transcribe and call onTranscript(result)
    };
    mediaRef.current.start();
    setRecording(true);
  };

  const stop = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  return (
    <div>
      <button onClick={recording ? stop : start}>
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
}
