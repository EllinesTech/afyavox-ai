export default function NotesPanel({ notes, status }) {
  return (
    <div
      data-testid="notes-panel"
      className="rounded-2xl border border-[#1E2A3A] bg-[#111827] p-5 flex flex-col gap-3 min-h-[200px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm uppercase tracking-widest">Clinical Notes</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#7B61FF]/10 text-[#7B61FF] border border-[#7B61FF]/20">
          Phase 3
        </span>
      </div>

      {/* Placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
        <div className="w-12 h-12 rounded-full bg-[#7B61FF]/10 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="1.5">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-[#8892A4] text-sm">AI clinical notes coming in Phase 3</p>
          <p className="text-[#8892A4]/60 text-xs mt-1">Powered by Ollama (LLaMA 3 / Mistral)</p>
        </div>
      </div>

      {/* Disabled action buttons */}
      <div className="flex gap-2">
        <button
          disabled
          className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#1E2A3A] text-[#8892A4]/40 cursor-not-allowed"
        >
          📋 Copy Notes
        </button>
        <button
          disabled
          className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#1E2A3A] text-[#8892A4]/40 cursor-not-allowed"
        >
          ⬇ Export .txt
        </button>
      </div>
    </div>
  );
}
