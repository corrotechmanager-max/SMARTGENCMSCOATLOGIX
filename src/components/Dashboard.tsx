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
  Activity,
  Zap,
  Network,
  PlayCircle
} from "lucide-react";

interface DashboardProps {
  setActivePage: (page: string) => void;
}

export default function Dashboard({ setActivePage }: DashboardProps) {
  const [totalAssets, setTotalAssets] = useState<number>(4);
  const [activeProjects, setActiveProjects] = useState<number>(1);
  const [aiAlerts, setAiAlerts] = useState<number>(1);
  const [pendingJobs, setPendingJobs] = useState<number>(3);
  const [inProgressJobsCount, setInProgressJobsCount] = useState<number>(2);

  useEffect(() => {
    // Load Assets
    const storedAssets = localStorage.getItem("corrotech_assets");
    let assetCount = 4;
    let criticalAssetsCount = 1; // Default is 1 (Offshore Riser R-4 is Poor)
    if (storedAssets) {
      try {
        const assets = JSON.parse(storedAssets);
        if (Array.isArray(assets)) {
          assetCount = assets.length;
          criticalAssetsCount = assets.filter(
            (a) => a.condition === "Critical" || a.condition === "Poor"
          ).length;
        }
      } catch (e) {
        console.error("Failed to parse assets from local storage", e);
      }
    }
    setTotalAssets(assetCount);

    // Load Jobs
    const storedJobs = localStorage.getItem("corrotech_jobs");
    let projectCount = 1; // Default SPIC Marine Dock is 1
    let overdueCount = 0;
    let pendingJobsCount = 3;
    let inProgressCount = 2; // Default has 2 In Progress jobs
    if (storedJobs) {
      try {
        let jobs = JSON.parse(storedJobs);
        if (Array.isArray(jobs)) {
          // Filter out specific target items
          jobs = jobs.filter((j) => {
            const isTargetTitle = j.title && (
              j.title.toLowerCase().includes("maintenance bldg") ||
              j.title.toLowerCase().includes("entrance steel structure")
            );
            const isTargetLocation = j.siteLocation && j.siteLocation.toLowerCase().includes("maintenance building");
            return !(isTargetTitle && isTargetLocation);
          });
          projectCount = jobs.filter((j) => j.type === "Project").length;
          overdueCount = jobs.filter((j) => j.status === "Overdue").length;
          pendingJobsCount = jobs.filter(
            (j) => j.status !== "Completed" && j.status !== "Cancelled"
          ).length;
          inProgressCount = jobs.filter((j) => j.status === "In Progress").length;
        }
      } catch (e) {
        console.error("Failed to parse jobs from local storage", e);
      }
    }
    setActiveProjects(projectCount);
    setPendingJobs(pendingJobsCount);
    setInProgressJobsCount(inProgressCount);

    // AI Alerts: Critical/Poor Assets + Overdue Jobs
    const alerts = criticalAssetsCount + overdueCount;
    setAiAlerts(alerts > 0 ? alerts : 1);
  }, []);

  // Features list mapping to the 9 portal cards (excluding Dashboard which is the header)
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
    <div className="flex-1 min-h-0 bg-[#060913] text-white flex flex-col justify-center items-center relative overflow-y-auto px-6 py-12 md:py-16">
      
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
        {/* Inner Container for Cards and Interconnected Flowing Lines */}
        <div className="relative w-full py-6">
          
          {/* SVG Connection Lines: Weaves from card to card with moving glowing telemetry dot streams */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block select-none">
            <svg className="w-full h-full min-h-[460px]" viewBox="0 0 1000 420" fill="none" xmlns="http://www.w3.org/2000/svg">
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

              {/* Data streams / interconnected lines path definitions */}
              <path id="path-1-2" d="M 125,90 L 375,150" stroke="url(#line-gradient)" strokeWidth="1.5" />
              <path id="path-2-3" d="M 375,150 L 625,90" stroke="url(#line-gradient)" strokeWidth="1.5" />
              <path id="path-3-4" d="M 625,90 L 875,150" stroke="url(#line-gradient)" strokeWidth="1.5" />

              <path id="path-1-5" d="M 125,90 L 125,270" stroke="url(#line-gradient)" strokeWidth="1" strokeDasharray="3,3" />
              <path id="path-2-6" d="M 375,150 L 375,330" stroke="url(#line-gradient)" strokeWidth="1" strokeDasharray="3,3" />
              <path id="path-3-7" d="M 625,90 L 625,270" stroke="url(#line-gradient)" strokeWidth="1" strokeDasharray="3,3" />
              <path id="path-4-8" d="M 875,150 L 875,330" stroke="url(#line-gradient)" strokeWidth="1" strokeDasharray="3,3" />

              <path id="path-5-6" d="M 125,270 L 375,330" stroke="url(#line-gradient)" strokeWidth="1.5" />
              <path id="path-6-7" d="M 375,330 L 625,270" stroke="url(#line-gradient)" strokeWidth="1.5" />
              <path id="path-7-8" d="M 625,270 L 875,330" stroke="url(#line-gradient)" strokeWidth="1.5" />

              {/* Hexagonal diagonal connections to complete the molecular/schematic look */}
              <path d="M 125,90 L 375,330" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="1" />
              <path d="M 125,270 L 375,150" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="1" />
              <path d="M 625,90 L 375,330" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="1" />
              <path d="M 625,270 L 375,150" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="1" />
              <path d="M 625,90 L 875,330" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="1" />
              <path d="M 625,270 L 875,150" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="1" />

              {/* Glowing animated dots running along the data stream lines */}
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
                  <mpath href="#path-3-4" />
                </animateMotion>
              </circle>
              <circle r="3" fill="#fbbf24" filter="url(#glow-effect)">
                <animateMotion dur="5s" repeatCount="indefinite">
                  <mpath href="#path-6-7" />
                </animateMotion>
              </circle>
              <circle r="4" fill="#f59e0b" filter="url(#glow-effect)">
                <animateMotion dur="7s" repeatCount="indefinite">
                  <mpath href="#path-7-8" />
                </animateMotion>
              </circle>
            </svg>
          </div>

          {/* SEPARATE, HIGHLY HIGHLIGHTED IN-PROGRESS OPERATIONS COMMAND HUB PANEL */}
          <div 
            onClick={() => setActivePage("In Progress Jobs")}
            className="w-full max-w-6xl mb-6 relative z-10 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-[#21160d] via-[#0b101d] to-[#121c2d] border border-amber-500/80 hover:border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.45)] transition-all duration-300 cursor-pointer group overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
                <PlayCircle size={22} className="animate-[pulse_1.5s_infinite] text-amber-400" />
              </div>
              
              <div className="space-y-0.5">
                <h2 className="text-base md:text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors uppercase">
                  In-Progress Campaigns
                </h2>
              </div>
            </div>

            <div className="flex items-center sm:flex-row justify-between sm:justify-end gap-6 relative z-10 sm:text-right border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 shrink-0">
              <div>
                <span className="text-lg md:text-xl font-bold text-amber-400 tracking-tight block drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                  {inProgressJobsCount} Active Campaign{inProgressJobsCount === 1 ? "" : "s"}
                </span>
              </div>
              
              <div className="inline-flex items-center gap-1 bg-amber-500 text-gray-950 px-4 py-2 rounded-xl text-[11px] font-bold font-mono tracking-wider uppercase transition-all duration-300 shadow-lg group-hover:bg-amber-400 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <span>VIEW ACTIVE CONSOLE</span>
                <ArrowUpRight size={12} className="stroke-[3]" />
              </div>
            </div>

            {/* Premium Corner Aesthetics */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400 rounded-tl-md" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400 rounded-br-md" />
          </div>

          {/* Symmetrical Grid of Cards with Hexagonal Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 w-full max-w-6xl">
            {portalFeatures.map((feat, index) => {
              const Icon = feat.icon;

              return (
                <div
                  key={feat.id}
                  onClick={() => setActivePage(feat.target)}
                  className={`group relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[175px] text-left select-none ${
                    feat.isActiveState
                      ? "bg-amber-950/40 border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)] text-amber-400"
                      : "bg-[#0e1322]/85 border-white/5 text-white hover:border-amber-500/40 hover:bg-[#131b2e] hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:-translate-y-1"
                  }`}
                  id={`portal-card-${feat.id}`}
                >
                  {/* Subtle index tag */}
                  <span className="absolute top-4 right-4 font-mono text-[9px] text-gray-600 group-hover:text-amber-500/40 font-bold transition-colors">
                    0{index + 1}
                  </span>

                  {/* Icon & Label */}
                  <div className="space-y-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                      feat.isActiveState 
                        ? "bg-amber-500/20 text-amber-400" 
                        : "bg-white/5 text-amber-500/90 group-hover:bg-amber-500/10 group-hover:text-amber-400"
                    }`}>
                      <Icon size={22} className={feat.id === "ai_analysis" ? "animate-[pulse_2s_infinite]" : ""} />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white group-hover:text-amber-400 transition-colors">
                        {feat.name}
                      </h3>
                      {feat.description && (
                        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                          {feat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Telemetry/Data Snippet Caption */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className={`font-semibold ${feat.isActiveState ? "text-amber-400 font-bold animate-pulse" : "text-amber-500/95"}`}>
                      {feat.caption}
                    </span>
                    <ArrowUpRight size={13} className="text-gray-500 group-hover:text-amber-400 transition-colors" />
                  </div>

                  {/* Corner Accent for the active state card */}
                  {feat.isActiveState && (
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400 rounded-tl-md" />
                  )}
                  {feat.isActiveState && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400 rounded-br-md" />
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Bottom Technical Status Line (Anti-AI-Slop Clean Label) */}
        <footer className="mt-12 text-center text-[10px] font-mono text-gray-600">
          ISO-12944 Compliance Gateway • Real-time Hardware Telemetry Ready
        </footer>

      </div>
    </div>
  );
}
