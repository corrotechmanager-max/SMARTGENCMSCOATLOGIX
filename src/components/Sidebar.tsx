import {
  LayoutDashboard,
  BriefcaseBusiness,
  FolderKanban,
  BrainCircuit,
  CalendarClock,
  Calculator,
  FileBarChart,
  Box,
  Warehouse,
  Settings,
  X,
  Zap,
  ShieldAlert,
  Lock
} from "lucide-react";
import { useState } from "react";
import { ShieldLogoSvg, CmsHighlightBadge } from "./BrandLogo";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Defect Log", icon: ShieldAlert },
  { name: "Projects", icon: FolderKanban },
  { name: "AI Analysis", icon: BrainCircuit },
  { name: "Job Planner", icon: CalendarClock },
  { name: "Calculator", icon: Calculator },
  { name: "Reports", icon: FileBarChart },
  { name: "Assets", icon: Box },
  { name: "Inventory", icon: Warehouse },
  { name: "Settings", icon: Settings },
];

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userRole?: "operator" | "defect_requester";
  onLockedClick?: (moduleName: string) => void;
}

export default function Sidebar({ 
  activePage, 
  setActivePage, 
  isOpen, 
  setIsOpen,
  userRole,
  onLockedClick 
}: SidebarProps) {
  const isDefectRequester = userRole === "defect_requester" || 
    (typeof window !== "undefined" && localStorage.getItem("coatlogix_user_role") === "defect_requester");

  const [lockedItemWarning, setLockedItemWarning] = useState<string | null>(null);

  const handleNavClick = (itemName: string) => {
    const isAllowed = !isDefectRequester || itemName === "Defect Log" || itemName === "Dashboard";

    if (!isAllowed) {
      setLockedItemWarning(itemName);
      if (onLockedClick) {
        onLockedClick(itemName);
      }
      setTimeout(() => setLockedItemWarning(null), 3000);
      return;
    }

    setLockedItemWarning(null);
    setActivePage(itemName);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 border-r border-white/10 bg-[#090d18]/95 backdrop-blur-xl p-6 flex flex-col gap-6 transition-transform duration-300 shadow-[0_0_50px_rgba(0,0,0,0.8)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldLogoSvg className="w-8 h-9" />
            <div className="flex flex-col text-left leading-none space-y-0.5">
              <h1 className="text-xs font-black text-white tracking-wider uppercase font-sans">SMARTGEN</h1>
              <div className="my-0.5">
                <CmsHighlightBadge size="sm" />
              </div>
              <span className="text-[10px] font-bold text-amber-500 tracking-wide uppercase">COATLOGIX ®</span>
            </div>
          </div>
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg border border-white/5 transition-all cursor-pointer"
            title="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Badge Banner inside Sidebar */}
        {isDefectRequester ? (
          <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/30 text-left space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">ACTIVE ROLE</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">RESTRICTED</span>
            </div>
            <p className="text-[11px] font-mono font-semibold text-white">Defect Requester</p>
            <p className="text-[9.5px] font-mono text-gray-400">Only Defect Log is unlocked. Other items are view-locked.</p>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-left flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10.5px] font-mono text-gray-300 font-bold">Authorized Operator</span>
            </div>
            <span className="text-[8.5px] font-mono text-emerald-400 font-bold uppercase">All Unlocked</span>
          </div>
        )}

        {/* Warning notification when clicking locked item */}
        {lockedItemWarning && (
          <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-[10.5px] font-mono flex items-center gap-2 animate-shake">
            <Lock size={14} className="shrink-0 text-red-400" />
            <span>{lockedItemWarning} is locked for Defect Requesters</span>
          </div>
        )}

        <nav className="flex flex-col gap-1 overflow-y-auto pr-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2 px-3">
            System Modules
          </span>
          {navItems.map((item) => {
            const isActive = activePage === item.name;
            const isItemLocked = isDefectRequester && item.name !== "Defect Log" && item.name !== "Dashboard";

            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.name)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left font-medium text-xs cursor-pointer select-none ${
                  isItemLocked
                    ? "text-gray-500 hover:text-gray-400 hover:bg-white/[0.02] opacity-60 border border-transparent"
                    : isActive
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/5 font-bold"
                    : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
                title={isItemLocked ? `${item.name} is locked for your current role` : item.name}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={16} className={isActive ? "text-amber-400" : isItemLocked ? "text-gray-600" : "text-gray-400"} />
                  <span>{item.name}</span>
                </div>

                {isItemLocked ? (
                  <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-amber-500/70 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/20">
                    <Lock size={10} />
                    <span>Locked</span>
                  </span>
                ) : item.name === "Defect Log" && isDefectRequester ? (
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    Active
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/5 pt-4 flex gap-3 items-center">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center font-bold text-amber-500 text-sm">
            {isDefectRequester ? "DR" : "OP"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate leading-tight">
              {isDefectRequester ? "Defect Requester" : "Operator Console"}
            </p>
            <p className="text-[10px] text-gray-400 truncate mt-0.5">
              {isDefectRequester ? "defect.requester@coatlogix.com" : "operator@coatlogix.com"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

