import { useState, useEffect } from "react";
import { 
  FolderKanban, 
  BrainCircuit, 
  CalendarClock, 
  Calculator, 
  FileBarChart, 
  Box, 
  Warehouse, 
  Settings,
  ArrowUpRight,
  Shield,
  ShieldAlert,
  Activity,
  Zap,
  Network,
  PlayCircle,
  Lock,
  X
} from "lucide-react";
import { subscribeToStore } from "../lib/firebase";
import { Asset, Job, DefectRecord } from "../types";

interface DashboardProps {
  setActivePage: (page: string) => void;
  userRole?: "operator" | "defect_requester";
}

export default function Dashboard({ setActivePage, userRole }: DashboardProps) {
  const isDefectRequester = userRole === "defect_requester" || 
    (typeof window !== "undefined" && localStorage.getItem("coatlogix_user_role") === "defect_requester");

  const [lockedNotice, setLockedNotice] = useState<{
    isOpen: boolean;
    moduleName: string;
    description?: string;
  }>({ isOpen: false, moduleName: "" });

  const [totalAssets, setTotalAssets] = useState<number>(4);
  const [activeProjects, setActiveProjects] = useState<number>(1);
  const [aiAlerts, setAiAlerts] = useState<number>(1);
  const [pendingJobs, setPendingJobs] = useState<number>(3);
  const [inProgressJobsCount, setInProgressJobsCount] = useState<number>(2);
  const [defectsCount, setDefectsCount] = useState<number>(3);

  useEffect(() => {
    let criticalAssetsCount = 1;
    let overdueCount = 0;

    const unsubAssets = subscribeToStore<Asset>("corrotech_assets", [], (assets) => {
      if (Array.isArray(assets) && assets.length > 0) {
        setTotalAssets(assets.length);
        criticalAssetsCount = assets.filter(
          (a) => a.condition === "Critical" || a.condition === "Poor"
        ).length;
      }
      const alerts = criticalAssetsCount + overdueCount;
      setAiAlerts(alerts > 0 ? alerts : 1);
    });

    const unsubDefects = subscribeToStore<DefectRecord>("corrotech_defects", [], (defects) => {
      if (Array.isArray(defects) && defects.length > 0) {
        const active = defects.filter(d => d.status !== "Resolved").length;
        setDefectsCount(active > 0 ? active : defects.length);
      }
    });

    const unsubJobs = subscribeToStore<Job>("corrotech_jobs", [], (rawJobs) => {
      if (Array.isArray(rawJobs) && rawJobs.length > 0) {
        const jobs = rawJobs.filter((j) => {
          const isTargetTitle = j.title && (
            j.title.toLowerCase().includes("maintenance bldg") ||
            j.title.toLowerCase().includes("entrance steel structure")
          );
          const isTargetLocation = j.siteLocation && j.siteLocation.toLowerCase().includes("maintenance building");
          return !(isTargetTitle && isTargetLocation);
        });

        const projectCount = jobs.filter((j) => j.type === "Project").length;
        overdueCount = jobs.filter((j) => j.status === "Overdue").length;
        const pendingJobsCount = jobs.filter(
          (j) => j.status !== "Completed" && j.status !== "Cancelled"
        ).length;
        const inProgressCount = jobs.filter((j) => j.status === "In Progress").length;

        setActiveProjects(projectCount);
        setPendingJobs(pendingJobsCount);
        setInProgressJobsCount(inProgressCount);
      }

      const alerts = criticalAssetsCount + overdueCount;
      setAiAlerts(alerts > 0 ? alerts : 1);
    });

    return () => {
      unsubAssets();
      unsubJobs();
      unsubDefects();
    };
  }, []);

  // Features list mapping to the portal cards (excluding Dashboard which is the header)
  const portalFeatures = [
    {
      id: "projects",
      name: "Projects",
      icon: FolderKanban,
      caption: `${activeProjects} Active Projects`,
      color: "text-amber-500",
      description: "Infrastructure & capital engineering campaigns",
      target: "Projects"
    },
    {
      id: "ai_analysis",
      name: "AI Analysis",
      icon: BrainCircuit,
      caption: `${aiAlerts} Critical Alerts`,
      color: "text-amber-400 animate-pulse",
      description: "Corrosion neural evaluation",
      target: "AI Analysis",
      isActiveState: true // Golden glow selected state!
    },
    {
      id: "job_planner",
      name: "Job Planner",
      icon: CalendarClock, // clock and calendar rendered clearly
      caption: `${pendingJobs} Jobs Pending`,
      color: "text-amber-500",
      description: "Preventative & schedules",
      target: "Job Planner"
    },
    {
      id: "defect_log",
      name: "Defect Log",
      icon: ShieldAlert,
      caption: `${defectsCount} Active Defect Reports`,
      color: "text-amber-500",
      description: "Report corrosion & damage",
      target: "Defect Log"
    },
    {
      id: "calculator",
      name: "Calculator",
      icon: Calculator, // calculator icon rendered clearly
      caption: "2 Corrosion Calculators",
      color: "text-amber-500",
      description: "Surface prep & coating consumption",
      target: "Calculator"
    },
    {
      id: "reports",
      name: "Reports",
      icon: FileBarChart,
      caption: "ISO-12944 Compliance",
      color: "text-amber-500",
      description: "Diagnostics & telemetry summaries",
      target: "Reports"
    },
    {
      id: "assets",
      name: "Assets",
      icon: Box,
      caption: `${totalAssets} Registered Assets`,
      color: "text-amber-500",
      description: "Global enterprise asset registry",
      target: "Assets"
    },
    {
      id: "inventory",
      name: "Inventory",
      icon: Warehouse,
      caption: "Anodes & Coatings stock",
      color: "text-amber-500",
      description: "Storage depots & levels",
      target: "Inventory"
    },
    {
      id: "settings",
      name: "Settings",
      icon: Settings,
      caption: "System Keys & Options",
      color: "text-amber-500",
      description: "API configuration panel",
      target: "Settings"
    }
  ];

  return (
    <div className="flex-1 min-h-0 bg-[#060913] text-white flex flex-col items-center relative overflow-y-auto px-4 sm:px-6 py-6 md:py-8">
      
      {/* Background Effect: High-fidelity corrosion prevention & cathodic protection field lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <svg className="absolute inset-0 w-full h-full opacity-[0.14]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <defs>
            <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="center-glow-grad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#060913" stopOpacity="0" />
            </radialGradient>
            {/* Pulsing glow filter */}
            <filter id="field-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Core Grid */}
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          <rect width="100%" height="100%" fill="url(#center-glow-grad)" />

          {/* PIPELINE INFRASTRUCTURE REPRESENTATION (Cathode) */}
          <g transform="translate(100, 380)">
            {/* The primary steel pipeline */}
            <rect x="0" y="10" width="1000" height="30" fill="none" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1.5" />
            <rect x="0" y="15" width="1000" height="20" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" />
            <text x="20" y="-10" fill="rgba(245, 158, 11, 0.4)" fontSize="10" fontFamily="monospace" letterSpacing="2">STEEL PIPELINE (CATHODE)</text>
            <text x="20" y="5" fill="rgba(245, 158, 11, 0.3)" fontSize="8" fontFamily="monospace">PROTECTION LEVEL: -850mV CSE MINIMUM</text>

            {/* Impressed Current Anode Groundbed (Anode) */}
            <circle cx="500" cy="220" r="14" fill="none" stroke="rgba(245, 158, 11, 0.5)" strokeWidth="1.5" />
            <circle cx="500" cy="220" r="6" fill="rgba(245, 158, 11, 0.25)" />
            <text x="525" y="225" fill="rgba(245, 158, 11, 0.5)" fontSize="10" fontFamily="monospace" fontWeight="bold">SACRIFICIAL ANODE (Zn/Al)</text>

            {/* Current delivery wire connection */}
            <path d="M 500,206 L 500,40" fill="none" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1" strokeDasharray="3,3" />

            {/* Electro-chemical Cathodic Protection Field Curves representing protective electron discharge */}
            <path d="M 500,220 C 400,210 200,100 200,30" fill="none" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="1" strokeDasharray="6,4" />
            <path d="M 500,220 C 450,210 350,110 350,30" fill="none" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="1" strokeDasharray="6,4" />
            <path d="M 500,220 C 500,180 500,80 500,30" fill="none" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1.2" />
            <path d="M 500,220 C 550,210 650,110 650,30" fill="none" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="1" strokeDasharray="6,4" />
            <path d="M 500,220 C 600,210 800,100 800,30" fill="none" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="1" strokeDasharray="6,4" />

            {/* Floating Protection Ions Indicator */}
            <g transform="translate(300, 140)">
              <circle r="6" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" />
              <text x="-4" y="3" fill="rgba(245, 158, 11, 0.5)" fontSize="8" fontFamily="monospace">e⁻</text>
            </g>
            <g transform="translate(700, 130)">
              <circle r="6" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" />
              <text x="-4" y="3" fill="rgba(245, 158, 11, 0.5)" fontSize="8" fontFamily="monospace">e⁻</text>
            </g>
            <g transform="translate(500, 110)">
              <circle r="6" fill="none" stroke="rgba(245, 158, 11, 0.5)" strokeWidth="1" />
              <text x="-4" y="3" fill="rgba(245, 158, 11, 0.7)" fontSize="8" fontFamily="monospace">e⁻</text>
            </g>

            {/* Additional Chemical Equations */}
            <text x="680" y="235" fill="rgba(245, 158, 11, 0.25)" fontSize="9" fontFamily="monospace" letterSpacing="1">REACTION: O₂ + 2H₂O + 4e⁻ → 4OH⁻</text>
            <text x="120" y="235" fill="rgba(245, 158, 11, 0.25)" fontSize="9" fontFamily="monospace" letterSpacing="1">ANODIC: Zn → Zn²⁺ + 2e⁻</text>
          </g>

          {/* Circular potential field contours */}
          <circle cx="600" cy="600" r="160" fill="none" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="1" strokeDasharray="2,6" />
          <circle cx="600" cy="600" r="240" fill="none" stroke="rgba(245, 158, 11, 0.05)" strokeWidth="0.8" />
          
          {/* Wavefront propagation (protective current potential field) */}
          <path d="M 100,600 Q 300,550 500,600 T 900,600" fill="none" stroke="rgba(245, 158, 11, 0.07)" strokeWidth="1" strokeDasharray="15,10" />
          <path d="M 100,630 Q 300,580 500,630 T 900,630" fill="none" stroke="rgba(245, 158, 11, 0.04)" strokeWidth="1" />

          {/* Electro-potential contour level notations */}
          <text x="50" y="100" fill="rgba(245, 158, 11, 0.2)" fontSize="9" fontFamily="monospace">POTENTIAL RADIAL CONTOURS (mV)</text>
          <text x="50" y="120" fill="rgba(245, 158, 11, 0.15)" fontSize="8" fontFamily="monospace">CELL 1: -1100 mV</text>
          <text x="50" y="135" fill="rgba(245, 158, 11, 0.15)" fontSize="8" fontFamily="monospace">CELL 2: -950 mV</text>
          <text x="50" y="150" fill="rgba(245, 158, 11, 0.15)" fontSize="8" fontFamily="monospace">CELL 3: -850 mV (CRITICAL COMPLIANCE LIMIT)</text>
        </svg>
      </div>

      <div className="max-w-5xl w-full z-10 relative flex flex-col pt-4">

        {/* DEFECT REQUESTER RESTRICTED SESSION BANNER */}
        {isDefectRequester && (
          <div className="w-full mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-black/80 to-amber-950/50 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldAlert size={22} className="animate-pulse text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-black uppercase tracking-wider text-amber-300">
                    DEFECT REQUESTER SESSION ACTIVE
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    DEFECT LOG ACCESS ONLY
                  </span>
                </div>
                <p className="text-[11px] font-mono text-gray-300 mt-0.5">
                  Your role is authorized for the <strong>Defect Log</strong>. Other engineering modules and consoles are locked in view-only mode.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActivePage("Defect Log")}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-lg shadow-amber-500/25 active:scale-95"
              id="dashboard-jump-defect-btn"
            >
              <ShieldAlert size={14} className="stroke-[2.5]" />
              <span>Open Defect Log</span>
              <ArrowUpRight size={13} className="stroke-[3]" />
            </button>
          </div>
        )}

        {/* Inner Container for Cards and Interconnected Flowing Lines */}
        <div className="relative w-full py-6">
          
          {/* SVG Connection Lines: Weaves from card to card with moving glowing telemetry dot streams */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block select-none">
            <svg className="w-full h-full min-h-[480px]" viewBox="0 0 1000 480" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(245, 158, 11, 0.15)" />
                  <stop offset="50%" stopColor="rgba(245, 158, 11, 0.4)" />
                  <stop offset="100%" stopColor="rgba(245, 158, 11, 0.15)" />
                </linearGradient>
                <filter id="glow-effect" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Data streams / interconnected lines path definitions for 3x3 grid */}
              <path id="path-1-2" d="M 165,80 L 500,80" stroke="url(#line-gradient)" strokeWidth="1.5" />
              <path id="path-2-3" d="M 500,80 L 835,80" stroke="url(#line-gradient)" strokeWidth="1.5" />
              <path id="path-4-5" d="M 165,240 L 500,240" stroke="url(#line-gradient)" strokeWidth="1.5" />
              <path id="path-5-6" d="M 500,240 L 835,240" stroke="url(#line-gradient)" strokeWidth="1.5" />
              <path id="path-7-8" d="M 165,400 L 500,400" stroke="url(#line-gradient)" strokeWidth="1.5" />
              <path id="path-8-9" d="M 500,400 L 835,400" stroke="url(#line-gradient)" strokeWidth="1.5" />

              {/* Vertical data stream lines */}
              <path id="path-1-4" d="M 165,80 L 165,240" stroke="url(#line-gradient)" strokeWidth="1" strokeDasharray="3,3" />
              <path id="path-4-7" d="M 165,240 L 165,400" stroke="url(#line-gradient)" strokeWidth="1" strokeDasharray="3,3" />
              <path id="path-2-5" d="M 500,80 L 500,240" stroke="url(#line-gradient)" strokeWidth="1" strokeDasharray="3,3" />
              <path id="path-5-8" d="M 500,240 L 500,400" stroke="url(#line-gradient)" strokeWidth="1" strokeDasharray="3,3" />
              <path id="path-3-6" d="M 835,80 L 835,240" stroke="url(#line-gradient)" strokeWidth="1" strokeDasharray="3,3" />
              <path id="path-6-9" d="M 835,240 L 835,400" stroke="url(#line-gradient)" strokeWidth="1" strokeDasharray="3,3" />

              {/* Diagonal cross traces */}
              <path d="M 165,80 L 500,240" stroke="rgba(245, 158, 11, 0.07)" strokeWidth="1" />
              <path d="M 500,80 L 165,240" stroke="rgba(245, 158, 11, 0.07)" strokeWidth="1" />
              <path d="M 500,80 L 835,240" stroke="rgba(245, 158, 11, 0.07)" strokeWidth="1" />
              <path d="M 835,80 L 500,240" stroke="rgba(245, 158, 11, 0.07)" strokeWidth="1" />
              <path d="M 165,240 L 500,400" stroke="rgba(245, 158, 11, 0.07)" strokeWidth="1" />
              <path d="M 500,240 L 165,400" stroke="rgba(245, 158, 11, 0.07)" strokeWidth="1" />
              <path d="M 500,240 L 835,400" stroke="rgba(245, 158, 11, 0.07)" strokeWidth="1" />
              <path d="M 835,240 L 500,400" stroke="rgba(245, 158, 11, 0.07)" strokeWidth="1" />

              {/* Glowing animated telemetry pulses */}
              <circle r="4" fill="#fbbf24" filter="url(#glow-effect)">
                <animateMotion dur="4.5s" repeatCount="indefinite">
                  <mpath href="#path-1-2" />
                </animateMotion>
              </circle>
              <circle r="3.5" fill="#f59e0b" filter="url(#glow-effect)">
                <animateMotion dur="6s" repeatCount="indefinite">
                  <mpath href="#path-2-3" />
                </animateMotion>
              </circle>
              <circle r="4" fill="#fbbf24" filter="url(#glow-effect)">
                <animateMotion dur="5.5s" repeatCount="indefinite">
                  <mpath href="#path-4-5" />
                </animateMotion>
              </circle>
              <circle r="3" fill="#fbbf24" filter="url(#glow-effect)">
                <animateMotion dur="5s" repeatCount="indefinite">
                  <mpath href="#path-5-6" />
                </animateMotion>
              </circle>
              <circle r="4" fill="#f59e0b" filter="url(#glow-effect)">
                <animateMotion dur="7s" repeatCount="indefinite">
                  <mpath href="#path-8-9" />
                </animateMotion>
              </circle>
            </svg>
          </div>

          {/* SEPARATE, HIGHLY HIGHLIGHTED IN-PROGRESS OPERATIONS COMMAND HUB PANEL */}
          <div 
            onClick={() => {
              if (isDefectRequester) {
                setLockedNotice({
                  isOpen: true,
                  moduleName: "In-Progress Campaigns",
                  description: "Execution monitoring and active campaigns console is restricted to Authorized Operators. As a Defect Requester, your active permissions are scoped to the Defect Log."
                });
                return;
              }
              setActivePage("In Progress Jobs");
            }}
            className={`w-full max-w-6xl mb-6 relative z-10 p-4 md:p-5 rounded-2xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDefectRequester
                ? "bg-gradient-to-r from-[#18110b] via-[#090d18] to-[#0f1624] border border-amber-500/40 opacity-75 hover:opacity-90 cursor-not-allowed shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                : "bg-gradient-to-r from-[#21160d] via-[#0b101d] to-[#121c2d] border border-amber-500/80 hover:border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.45)] cursor-pointer group"
            }`}
            id="portal-card-in-progress-hub"
          >
            {/* Ambient Animated Protection Field Lines & Wavefront */}
            <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity duration-300">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-[pulse_2s_infinite]" />
              <div className="absolute inset-y-0 right-1/4 w-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -inset-y-10 left-1/3 w-40 bg-gradient-to-r from-amber-500/15 to-transparent blur-2xl transform skew-x-12 animate-[pulse_4s_infinite]" />
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-105 transition-transform duration-300 shrink-0">
                {isDefectRequester ? (
                  <Lock size={20} className="text-amber-400/80" />
                ) : (
                  <PlayCircle size={22} className="animate-[pulse_1.5s_infinite] text-amber-400" />
                )}
              </div>
              
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base md:text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors uppercase">
                    In-Progress Campaigns
                  </h2>
                  {isDefectRequester && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-500/30 uppercase">
                      <Lock size={10} /> Locked
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-mono">
                  {isDefectRequester ? "Requires Operator authorization to execute campaigns" : "Active corrosion remediation campaigns in the field"}
                </p>
              </div>
            </div>

            <div className="flex items-center sm:flex-row justify-between sm:justify-end gap-6 relative z-10 sm:text-right border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 shrink-0">
              <div>
                <span className="text-lg md:text-xl font-bold text-amber-400 tracking-tight block drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                  {inProgressJobsCount} Active Campaign{inProgressJobsCount === 1 ? "" : "s"}
                </span>
              </div>
              
              <div className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-[11px] font-bold font-mono tracking-wider uppercase transition-all duration-300 shadow-lg ${
                isDefectRequester
                  ? "bg-amber-950/60 text-amber-400 border border-amber-500/30 hover:bg-amber-900/60"
                  : "bg-amber-500 text-gray-950 group-hover:bg-amber-400 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              }`}>
                {isDefectRequester ? (
                  <>
                    <Lock size={12} />
                    <span>LOCKED OVERVIEW</span>
                  </>
                ) : (
                  <>
                    <span>VIEW ACTIVE CONSOLE</span>
                    <ArrowUpRight size={12} className="stroke-[3]" />
                  </>
                )}
              </div>
            </div>

            {/* Premium Corner Aesthetics */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400 rounded-tl-md" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400 rounded-br-md" />
          </div>

          {/* Symmetrical Grid of Cards with Hexagonal Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 w-full max-w-6xl">
            {portalFeatures.map((feat, index) => {
              const Icon = feat.icon;
              const isDefectLog = feat.target === "Defect Log";
              const isCardLocked = isDefectRequester && !isDefectLog;

              return (
                <div
                  key={feat.id}
                  onClick={() => {
                    if (isCardLocked) {
                      setLockedNotice({
                        isOpen: true,
                        moduleName: feat.name,
                        description: `The ${feat.name} module is locked for your current role (Defect Requester). Your permissions are strictly designated for submitting and monitoring corrosion defect logs.`
                      });
                      return;
                    }
                    setActivePage(feat.target);
                  }}
                  className={`group relative p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[175px] text-left select-none ${
                    isCardLocked
                      ? "bg-[#090d18]/70 border-white/5 text-gray-400 opacity-65 hover:opacity-85 hover:border-amber-500/30 cursor-not-allowed"
                      : isDefectRequester && isDefectLog
                      ? "bg-amber-950/50 border-2 border-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.35)] text-amber-400 cursor-pointer hover:scale-[1.02]"
                      : feat.isActiveState
                      ? "bg-amber-950/40 border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)] text-amber-400 cursor-pointer"
                      : "bg-[#0e1322]/85 border-white/5 text-white hover:border-amber-500/40 hover:bg-[#131b2e] hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:-translate-y-1 cursor-pointer"
                  }`}
                  id={`portal-card-${feat.id}`}
                >
                  {/* Subtle index tag or locked badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    {isCardLocked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8.5px] font-mono font-bold bg-amber-950/90 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                        <Lock size={9} />
                        <span>LOCKED</span>
                      </span>
                    ) : isDefectRequester && isDefectLog ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8.5px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                        <span>✓ UNLOCKED</span>
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] text-gray-600 group-hover:text-amber-500/40 font-bold transition-colors">
                        {index + 1 < 10 ? `0${index + 1}` : `${index + 1}`}
                      </span>
                    )}
                  </div>

                  {/* Icon & Label */}
                  <div className="space-y-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                      isCardLocked
                        ? "bg-white/5 text-gray-500 group-hover:text-amber-400"
                        : (isDefectRequester && isDefectLog) || feat.isActiveState
                        ? "bg-amber-500/20 text-amber-400" 
                        : "bg-white/5 text-amber-500/90 group-hover:bg-amber-500/10 group-hover:text-amber-400"
                    }`}>
                      {isCardLocked ? (
                        <Icon size={22} className="opacity-60" />
                      ) : (
                        <Icon size={22} className={feat.id === "ai_analysis" || (isDefectRequester && isDefectLog) ? "animate-[pulse_2s_infinite]" : ""} />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
                          isCardLocked ? "text-gray-300 group-hover:text-amber-400" : "text-white group-hover:text-amber-400"
                        }`}>
                          {feat.name}
                        </h3>
                      </div>
                      {feat.description && (
                        <p className={`text-xs leading-relaxed line-clamp-2 ${
                          isCardLocked ? "text-gray-500" : "text-gray-400"
                        }`}>
                          {feat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Telemetry/Data Snippet Caption */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className={`font-semibold ${
                      isCardLocked
                        ? "text-gray-500"
                        : (isDefectRequester && isDefectLog) || feat.isActiveState 
                        ? "text-amber-400 font-bold animate-pulse" 
                        : "text-amber-500/95"
                    }`}>
                      {isCardLocked ? `Locked (${feat.caption})` : feat.caption}
                    </span>
                    {isCardLocked ? (
                      <Lock size={12} className="text-amber-500/40 group-hover:text-amber-400" />
                    ) : (
                      <ArrowUpRight size={13} className="text-gray-500 group-hover:text-amber-400 transition-colors" />
                    )}
                  </div>

                  {/* Corner Accent for the active state card */}
                  {((isDefectRequester && isDefectLog) || feat.isActiveState) && (
                    <>
                      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400 rounded-tl-md" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400 rounded-br-md" />
                    </>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* RESTRICTION MODAL DIALOG WHEN DEFECT REQUESTER CLICKS LOCKED MODULE */}
        {lockedNotice.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="max-w-md w-full bg-[#0d1322] border-2 border-amber-500/50 rounded-2xl p-6 md:p-7 shadow-[0_0_60px_rgba(245,158,11,0.35)] relative overflow-hidden text-left space-y-5">
              
              {/* Top ambient glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0">
                  <Lock size={24} className="text-amber-400 animate-pulse" />
                </div>
                <button
                  onClick={() => setLockedNotice({ isOpen: false, moduleName: "" })}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close Notice"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[9.5px] font-bold uppercase tracking-wider">
                  <ShieldAlert size={12} />
                  <span>ROLE PERMISSION RESTRICTION</span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight font-display">
                  {lockedNotice.moduleName} Is Locked
                </h3>
                <p className="text-xs font-mono text-gray-300 leading-relaxed">
                  {lockedNotice.description || "This module is locked for the Defect Requester role. Your account permissions are restricted strictly to the Defect Log."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 font-mono text-[10.5px] space-y-1.5 text-gray-400">
                <div className="flex items-center justify-between text-amber-400 font-bold border-b border-white/5 pb-1">
                  <span>ACTIVE ROLE</span>
                  <span className="text-amber-300">DEFECT REQUESTER</span>
                </div>
                <p>• Permitted Module: <span className="text-emerald-400 font-bold">Defect Log</span></p>
                <p>• Elevation: <span className="text-gray-400">Contact Anti-Corrosion Admin for Operator Access</span></p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setLockedNotice({ isOpen: false, moduleName: "" });
                    setActivePage("Defect Log");
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 active:scale-95"
                >
                  <ShieldAlert size={14} className="stroke-[2.5]" />
                  <span>Go to Defect Log</span>
                </button>
                <button
                  onClick={() => setLockedNotice({ isOpen: false, moduleName: "" })}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-mono text-xs uppercase tracking-wider font-bold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Bottom Technical Status Line (Anti-AI-Slop Clean Label) */}
        <footer className="mt-12 text-center text-[10px] font-mono text-gray-600">
          ISO-12944 Compliance Gateway • Real-time Hardware Telemetry Ready
        </footer>

      </div>
    </div>
  );
}
