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
  Zap
} from "lucide-react";
import { ShieldLogoSvg, CmsHighlightBadge } from "./BrandLogo";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
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
}

export default function Sidebar({ activePage, setActivePage, isOpen, setIsOpen }: SidebarProps) {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto h-screen w-64 border-r border-white/10 bg-gray-900/95 md:bg-gray-900/50 backdrop-blur-md p-6 flex flex-col gap-8 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between">
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
          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1.5 hover:bg-white/5 rounded-lg border border-white/5 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto pr-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2 px-4">Navigation</span>
          {navItems.map((item) => {
            const isActive = activePage === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActivePage(item.name);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-md shadow-amber-500/5"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/5 pt-4 flex gap-3 items-center">
          <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center font-bold text-amber-500 text-sm">
            US
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate leading-tight">Admin Console</p>
            <p className="text-[10px] text-gray-400 truncate mt-0.5">corrotech@enterprise.com</p>
          </div>
        </div>
      </aside>
    </>
  );
}

