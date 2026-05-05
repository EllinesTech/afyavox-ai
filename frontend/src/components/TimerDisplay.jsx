import { useState, useEffect, useRef } from "react";

export default function TimerDisplay({ active }) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (active) {
      setSeconds(0);
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
      if (!active) setSeconds(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [active]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <span
      data-testid="timer-display"
      className={`font-mono text-sm tabular-nums ${active ? "text-[#FF3B5C]" : "text-[#8892A4]"}`}
    >
      {mm}:{ss}
    </span>
  );
}
