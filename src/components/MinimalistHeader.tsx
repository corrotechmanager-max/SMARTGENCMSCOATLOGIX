import { ArrowLeft, LogOut } from "lucide-react";

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
          {/* Custom SVG Golden Shield */}
          <svg 
            className="w-8 h-9 md:w-10 md:h-11 drop-shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-transform duration-300 group-hover:scale-105" 
            viewBox="0 0 100 115" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Shield Border */}
            <path 
              d="M50 5 L90 25 V65 C90 85 70 105 50 110 C30 105 10 85 10 65 V25 L50 5 Z" 
              stroke="url(#headerGoldGrad)" 
              strokeWidth="7" 
              fill="rgba(10, 14, 26, 0.4)" 
              strokeLinejoin="round" 
            />
            {/* Inner shield core lines (stylized G/S protection barrier) */}
            <path 
              d="M50 22 L73 33.5 V57 C73 70 63 84 50 88 C37 84 27 70 27 57 V45 H50 V54 H38 V57 C38 65 43 74 50 77 C57 74 62 65 62 57 V39 L50 33 L38 39" 
              stroke="url(#headerGoldGrad)" 
              strokeWidth="5" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <defs>
              <linearGradient id="headerGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="40%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
          </svg>

          {/* Typography */}
          <div className="flex flex-col text-left leading-none">
            <span className="text-sm md:text-lg font-black tracking-wider text-white font-sans uppercase">
              SMARTGEN
            </span>
            <span className="text-[10px] md:text-[13px] font-black tracking-wide text-amber-500 font-sans uppercase flex items-center">
              COATLOGIX
              <span className="text-[7px] md:text-[8px] align-super ml-0.5 font-bold">®</span>
            </span>
            <span className="text-[7px] md:text-[8.5px] text-amber-500/80 tracking-widest font-bold font-mono mt-1.5 uppercase block">
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
