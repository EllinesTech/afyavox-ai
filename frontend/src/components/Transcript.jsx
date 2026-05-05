import { useState } from "react";

const LANGUAGE_NAMES = {
  en: "English 🇬🇧", sw: "Swahili 🇰🇪", ki: "Kikuyu 🇰🇪", luo: "Luo 🇰🇪",
  guz: "Kisii 🇰🇪", ar: "Arabic 🇸🇦", zh: "Chinese 🇨🇳", ko: "Korean 🇰🇷",
  ja: "Japanese 🇯🇵", fr: "French 🇫🇷", es: "Spanish 🇪🇸", pt: "Portuguese 🇵🇹",
  de: "German 🇩🇪", hi: "Hindi 🇮🇳", ru: "Russian 🇷🇺", am: "Amharic 🇪🇹",
  so: "Somali 🇸🇴", yo: "Yoruba 🇳🇬", ha: "Hausa 🇳🇬",
};

export default function TranscriptPanel({ transcript, language, status, error }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!transcript) return;
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const langLabel = LANGUAGE_NAMES[language] || (language ? language.toUpperCase() : null);

  return (
    <div className="rounded-2xl border border-[#1E2A3A] bg-[#111827] p-5 flex flex-col gap-3 min-h-[200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-semibold text-sm uppercase tracking-widest">Transcript</h2>
          {langLabel && status === "done" && (
            <span
              data-testid="language-badge"
              className="text-xs px-2 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20"
            >
              {langLabel}
            </span>
          )}
        </div>
        {transcript && status === "done" && (
          <button
            onClick={copy}
            className="text-xs px-3 py-1 rounded-lg border border-[#1E2A3A] text-[#8892A4] hover:text-[#00D4FF] hover:border-[#00D4FF]/30 transition-colors"
            aria-label="Copy transcript"
          >
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>
        )}
      </div>

      {/* Error banner */}
      {status === "error" && error && (
        <div className="rounded-lg border border-[#FF3B5C]/30 bg-[#FF3B5C]/10 p-3">
          <p className="text-[#FF3B5C] text-sm">{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {status === "loading" && (
        <div data-testid="loading-indicator" className="space-y-2 pt-1">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-4/5" />
          <div className="skeleton h-4 w-3/5" />
        </div>
      )}

      {/* Transcript text */}
      {(status === "done" || (status === "error" && transcript)) && (
        <p
          data-testid="transcript-text"
          className="transcript-text text-white/90 text-sm leading-relaxed whitespace-pre-wrap flex-1"
        >
          {transcript}
        </p>
      )}

      {/* Idle placeholder */}
      {status === "idle" && (
        <p className="text-[#8892A4] text-sm italic">
          Transcript will appear here after recording...
        </p>
      )}
    </div>
  );
}
