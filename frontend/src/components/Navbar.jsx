import StatusBadge from "./StatusBadge";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-panel border-b border-[#1E2A3A] flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <img
          src="/Logo/Afyavox Logo icon.png"
          alt="AfyaVox AI"
          className="w-10 h-10 object-contain"
        />
        <div>
          <span className="text-white font-semibold text-lg tracking-wide">AfyaVox</span>
          <span className="text-[#00D4FF] font-semibold text-lg"> AI</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <StatusBadge />
        <span className="text-muted text-xs hidden sm:block">v1.0</span>
      </div>
    </nav>
  );
}
