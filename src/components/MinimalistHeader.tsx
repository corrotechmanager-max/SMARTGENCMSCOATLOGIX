import { ArrowLeft, LogOut } from "lucide-react";
import { ShieldLogoSvg, CmsHighlightBadge } from "./BrandLogo";

interface MinimalistHeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onLogout?: () => void;
}

export default function MinimalistHeader({ activePage, setActivePage, onLogout }: MinimalistHeaderProps) {
  return (
    <header className="grid grid-cols-3 items-center px-6 py-3 bg-[#0a0e1a]/95 backdrop-blur-md border-b border-white/5 z-30 w-full">
      {/* Left Column: Navigation / Back Button */}
      <div className="flex items-center justify-start">
        {activePage !== "Dashboard" && (
          <button 
            onClick={() => setActivePage("Dashboard")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer group"
            id="header-back-btn"
            title="Return to Dashboard"
          >
            <ArrowLeft size={14} className="text-amber-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Portal Dashboard</span>
          </button>
        )}
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

      {/* Right Column: Logout Action */}
      <div className="flex items-center justify-end gap-2 md:gap-3">
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
