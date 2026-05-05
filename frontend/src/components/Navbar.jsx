import StatusBadge from "./StatusBadge";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#111827]/95 backdrop-blur-sm border-b border-[#1E2A3A] flex items-center justify-between px-6">
      {/* Logo + name */}
      <div className="flex items-center gap-3">
        {/* Standalone logo — no background */}
        <img
          src="/Logo/Afyavox Logo no bg.png"
          alt="AfyaVox"
          className="w-8 h-8 object-contain"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        {/* Fallback */}
        <div
          style={{ display: "none" }}
          className="w-8 h-8 rounded-full bg-[#00D4FF]/20 border border-[#00D4FF]/40 items-center justify-center text-[#00D4FF] font-bold text-sm"
        >
          A
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-white font-bold text-lg tracking-tight">Afya</span>
          <span className="text-[#00D4FF] font-bold text-lg tracking-tight">Vox</span>
          <span className="text-[#8892A4] font-medium text-sm ml-1">AI</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <StatusBadge />
        <span className="text-[#8892A4]/50 text-xs hidden sm:block">v1.0</span>
      </div>
    </nav>
  );
}
