import { useEffect, useRef } from "react";

export default function WaveformVisualizer({ stream, active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(null);

  useEffect(() => {
    if (!active || !stream) {
      // Draw flat line when not active
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#1E2A3A";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;
    dataRef.current = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;
      analyser.getByteFrequencyData(dataRef.current);

      ctx.clearRect(0, 0, width, height);
      const barWidth = (width / dataRef.current.length) * 2.5;
      let x = 0;

      for (let i = 0; i < dataRef.current.length; i++) {
        const barHeight = (dataRef.current[i] / 255) * height;
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, "#00FF88");
        gradient.addColorStop(1, "#00D4FF");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      audioCtx.close();
    };
  }, [stream, active]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={80}
      className="w-full h-20 rounded-lg bg-[#0A0F1E]"
      aria-hidden="true"
    />
  );
}
