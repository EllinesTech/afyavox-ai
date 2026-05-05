export default function MicButton({ state, onClick }) {
  const isRecording = state === "recording";
  const isDisabled = state === "uploading" || state === "transcribing";

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse ring — only visible when recording */}
      <div
        data-testid="recording-indicator"
        className={`absolute w-28 h-28 rounded-full transition-all duration-300 ${
          isRecording ? "mic-recording bg-[#FF3B5C]/10" : "opacity-0"
        }`}
      />
      <button
        onClick={onClick}
        disabled={isDisabled}
        data-testid="mic-button"
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 border-2 font-medium
          ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${isRecording
            ? "bg-[#FF3B5C]/20 border-[#FF3B5C] mic-recording"
            : "bg-[#111827] border-[#00D4FF] mic-idle hover:bg-[#00D4FF]/10"
          }
        `}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording ? (
          /* Stop icon */
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF3B5C">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          /* Mic icon */
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        )}
      </button>
    </div>
  );
}
