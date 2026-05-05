import { useState, useEffect } from "react";

export default function StatusBadge() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("http://localhost:8001/health");
        setStatus(res.ok ? "connected" : "offline");
      } catch {
        setStatus("offline");
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const config = {
    connected: { color: "bg-[#00FF88]", text: "Connected", textColor: "text-[#00FF88]" },
    offline:   { color: "bg-[#FF3B5C]", text: "Offline",   textColor: "text-[#FF3B5C]" },
    checking:  { color: "bg-[#8892A4]", text: "Checking",  textColor: "text-[#8892A4]" },
  };

  const { color, text, textColor } = config[status];

  return (
    <div
      data-testid="status-badge"
      className={`flex items-center gap-2 px-3 py-1 rounded-full border border-[#1E2A3A] bg-[#0A0F1E]`}
    >
      <span className={`w-2 h-2 rounded-full ${color} ${status === "connected" ? "animate-pulse" : ""}`} />
      <span className={`text-xs font-medium ${textColor}`}>{text}</span>
    </div>
  );
}
