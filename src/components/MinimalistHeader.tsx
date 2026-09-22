import { ArrowLeft, LogOut, ShieldAlert, Shield } from "lucide-react";
import { ShieldLogoSvg, CmsHighlightBadge } from "./BrandLogo";

interface MinimalistHeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onLogout?: () => void;
  userRole?: "operator" | "defect_requester";
}

export default function MinimalistHeader({ 
  activePage, 
  setActivePage, 
  onLogout,
  userRole 
}: MinimalistHeaderProps) {
  const isDefectRequester = userRole === "defect_requester" || 
    (typeof window !== "undefined" && localStorage.getItem("coatlogix_user_role") === "defect_requester");

  return (
    <header className="grid grid-cols-3 items-center px-4 md:px-6 py-3 bg-[#0a0e1a]/95 backdrop-blur-md border-b border-white/5 z-30 w-full">
      {/* Left Column: Navigation Back Button (when activePage != Dashboard) or quick shortcut */}
      <div className="flex items-center justify-start gap-2">
        {activePage !== "Dashboard" ? (
          <button 
            onClick={() => setActivePage("Dashboard")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer group"
            id="header-back-btn"
            title="Return to Dashboard"
          >
            <ArrowLeft size={14} className="text-amber-500 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        ) : isDefectRequester ? (
          <button 
            onClick={() => setActivePage("Defect Log")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition-all cursor-pointer shadow-md shadow-amber-500/20"
            id="header-defect-log-quick-btn"
            title="Go to Defect Log"
          >
            <ShieldAlert size={14} />
            <span className="font-mono text-[11px]">Defect Log</span>
          </button>
        ) : null}
      </div>

      {/* Center Column: Hand-crafted Vector SMARTGEN COATLOGIX Logo */}
      <div className="flex items-center justify-center">
        <button 
          onClick={() => setActivePage("Dashboard")}
          className="flex items-center gap-2.5 focus:outline-none cursor-pointer group select-none"
          id="header-home-btn"
          title="Return to Dashboard"
        >
          {/* Image 3 Shield Logo SVG */}
          <ShieldLogoSvg className="w-8 h-9 md:w-10 md:h-11 group-hover:scale-105" />

          {/* Typography */}
          <div className="flex flex-col text-left leading-none space-y-0.5">
            <span className="text-sm md:text-base font-black tracking-wider text-white font-sans uppercase">
              SMARTGEN
            </span>
            <div className="inline-flex items-center my-0.5">
              <CmsHighlightBadge size="sm" />
            </div>
            <span className="text-[10px] md:text-[12px] font-black tracking-wide text-amber-500 font-sans uppercase flex items-center">
              COATLOGIX
              <span className="text-[7px] md:text-[8px] align-super ml-0.5 font-bold">®</span>
            </span>
            <span className="text-[6.5px] md:text-[8px] text-amber-500/80 tracking-widest font-bold font-mono uppercase block pt-0.5">
              [ Intelligent Integrity. Engineered Protection ]
            </span>
          </div>
        </button>
      </div>

      {/* Right Column: Active Operator Info & Logout Action */}
      <div className="flex items-center justify-end gap-2 md:gap-3">
        {(() => {
          try {
            const raw = localStorage.getItem("coatlogix_current_user");
            if (!raw) return null;
            const u = JSON.parse(raw);
            return (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/5 text-right">
                <div className={`w-2 h-2 rounded-full ${isDefectRequester ? "bg-amber-400 animate-ping" : "bg-emerald-400 animate-pulse"}`} />
                <div className="flex flex-col text-right leading-none space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-200 truncate max-w-[130px]">
                    {u.name || u.email}
                  </span>
                  <span className={`text-[8px] font-mono truncate max-w-[130px] font-bold ${
                    isDefectRequester ? "text-amber-400 uppercase" : "text-emerald-400"
                  }`}>
                    {isDefectRequester ? "Defect Requester" : (u.role || "Authorized Operator")}
                  </span>
                </div>
              </div>
            );
          } catch {
            return null;
          }
        })()}

        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-gray-400 hover:text-amber-500 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/20 active:scale-95 transition-all cursor-pointer"
            title="Lock Vault Portal & Logout"
            id="header-logout-btn"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </header>
  );
}
