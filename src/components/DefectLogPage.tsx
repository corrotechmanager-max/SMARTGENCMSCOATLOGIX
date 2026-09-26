import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { 
  ShieldAlert, 
  Plus, 
  Pencil, 
  Trash2, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Box, 
  Calendar, 
  User, 
  Layers, 
  ArrowRight,
  Sparkles,
  Download
} from "lucide-react";
import { DefectRecord, Asset } from "../types";
import { subscribeToStore, saveToStore } from "../lib/firebase";

// Default pre-seeded defect records
const DEFAULT_DEFECTS: DefectRecord[] = [
  {
    id: "def-1",
    defectCode: "DEF-2026-001",
    title: "Deep localized galvanic pitting at water-level splash zone",
    assetName: "Offshore Riser R-4",
    location: "Platform Alpha, Sector 4",
    defectType: "Galvanic Corrosion",
    severity: "Critical",
    status: "Under Investigation",
    reportedDate: "2026-06-12",
    reportedBy: "Mansoor Ahmed (Anti Corrosion Officer)",
    department: "Anti Corrosion Department",
    description: "Deep localized galvanic pitting at water-level splash zone. Sacrificial zinc anode depleted by >85%. Wall thickness reduced by 2.4mm.",
    correctiveAction: "Immediate clamp sleeve installation and zinc sacrificial anode retrofit scheduled."
  },
  {
    id: "def-2",
    defectCode: "DEF-2026-002",
    title: "Extensive osmotic blistering noted across bottom annular plate weld",
    assetName: "Storage Tank T-102",
    location: "Tank Farm West, Bay 2",
    defectType: "Coating Blistering & Delamination",
    severity: "Major",
    status: "Remediation Scheduled",
    reportedDate: "2026-06-14",
    reportedBy: "Mansoor Ahmed (Anti Corrosion Officer)",
    department: "Anti Corrosion Department",
    description: "Extensive osmotic blistering noted across bottom annular plate weld. Moisture penetration identified beneath epoxy barrier coat.",
    correctiveAction: "Abrasive blast to Sa 2.5 and apply 2 coats of high-build surface tolerant epoxy with polyurethane topcoat."
  },
  {
    id: "def-3",
    defectCode: "DEF-2026-003",
    title: "Mechanical scrape damaged polyurethane topcoat on counterweight hinge",
    assetName: "Stacker Re-claimer # 1",
    location: "Plant Area 3, Grid B-7",
    defectType: "Heavy duty Vehicle / Equipment Wear",
    severity: "Moderate",
    status: "Open",
    reportedDate: "2026-06-15",
    reportedBy: "Mansoor Ahmed (Anti Corrosion Officer)",
    department: "Anti Corrosion Department",
    description: "Mechanical scrape damaged polyurethane topcoat on counterweight hinge; surface flash rusting Grade C initiated.",
    correctiveAction: "Needle gun scale removal to St 3 followed by zinc-rich primer spot patch and polyurethane seal."
  },
  {
    id: "def-4",
    defectCode: "DEF-2026-004",
    title: "Tape wrap unbonded at soil casing entry point",
    assetName: "North Pipeline Segment A",
    location: "Plant Area 3, Grid B-7",
    defectType: "Pitting Corrosion",
    severity: "Minor",
    status: "Resolved",
    reportedDate: "2026-05-28",
    reportedBy: "Mansoor Ahmed (Anti Corrosion Officer)",
    department: "Anti Corrosion Department",
    description: "Tape wrap unbonded at soil casing entry point. Mild atmospheric surface corrosion noted.",
    correctiveAction: "Surface wire brushed, cold-applied petrolatum mastic wrap and HDPE outer cover installed."
  }
];

export const DEFECT_TYPES = [
  "Pitting Corrosion",
  "Galvanic Corrosion",
  "Coating Blistering & Delamination",
  "Heavy duty Vehicle / Equipment Wear",
  "Stress Corrosion Cracking (SCC)",
  "Weld Joint & Crevice Decay",
  "Mechanical Impact / Abrasion",
  "Atmospheric Rust Grade C/D",
  "Erosion-Corrosion",
  "Under-Insulation Corrosion (CUI)",
  "Other"
];

export const DEPARTMENT_OPTIONS = [
  "Anti Corrosion Department",
  "Scaffolding",
  "HVAC",
  "Civil",
  "Fire Fighting",
  "Electrical",
  "Turbine",
  "Boiler",
  "I&C",
  "Coal Operation",
  "Chemical",
  "Administration",
  "Resident Area",
  "Warehouse Management"
] as const;

interface DefectLogPageProps {
  userRole?: "operator" | "defect_requester";
}

export default function DefectLogPage({ userRole }: DefectLogPageProps = {}) {
  const isDefectRequester = userRole === "defect_requester" || 
    (typeof window !== "undefined" && localStorage.getItem("coatlogix_user_role") === "defect_requester");

  const [defects, setDefects] = useState<DefectRecord[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<DefectRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields - observations at top, department in reported by, manual input option for asset & location
  const [formDescription, setFormDescription] = useState("");
  const [formAssetName, setFormAssetName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [assetInputMode, setAssetInputMode] = useState<"manual" | "dropdown">("manual");
  const [formDefectType, setFormDefectType] = useState("Pitting Corrosion");
  const [formSeverity, setFormSeverity] = useState<"Critical" | "Major" | "Moderate" | "Minor">("Major");
  const [formStatus, setFormStatus] = useState<"Open" | "Under Investigation" | "Remediation Scheduled" | "Resolved">("Open");
  const [formReportedBy, setFormReportedBy] = useState("Mansoor Ahmed (Anti Corrosion Officer)");
  const [formDepartment, setFormDepartment] = useState("Anti Corrosion Department");
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [formCorrectiveAction, setFormCorrectiveAction] = useState("");

  // Real-time synchronization
  useEffect(() => {
    const unsubDefects = subscribeToStore<DefectRecord>("corrotech_defects", DEFAULT_DEFECTS, (cloudDefects) => {
      setDefects(cloudDefects);
    });

    const unsubAssets = subscribeToStore<Asset>("corrotech_assets", [], (cloudAssets) => {
      setAssets(cloudAssets);
    });

    return () => {
      unsubDefects();
      unsubAssets();
    };
  }, []);

  const saveDefects = (updated: DefectRecord[]) => {
    setDefects(updated);
    saveToStore("corrotech_defects", updated);
  };

  // KPI Metrics
  const metrics = useMemo(() => {
    return {
      total: defects.length,
      critical: defects.filter(d => d.severity === "Critical").length,
      major: defects.filter(d => d.severity === "Major").length,
      openOrActive: defects.filter(d => d.status !== "Resolved").length,
      resolved: defects.filter(d => d.status === "Resolved").length,
    };
  }, [defects]);

  // Filtered defects list
  const filteredDefects = useMemo(() => {
    return defects.filter((d) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        d.defectCode.toLowerCase().includes(q) ||
        (d.title && d.title.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        d.assetName.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.defectType.toLowerCase().includes(q) ||
        d.reportedBy.toLowerCase().includes(q) ||
        (d.department && d.department.toLowerCase().includes(q));

      const matchesSeverity = severityFilter === "All" || d.severity === severityFilter;
      const matchesStatus = statusFilter === "All" || d.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [defects, searchQuery, severityFilter, statusFilter]);

  // Open modal for new entry
  const handleOpenAdd = () => {
    setEditingDefect(null);
    setFormDescription("");
    const defaultAsset = assets.length > 0 ? assets[0].name : "Stacker Re-claimer # 1";
    const defaultLoc = assets.length > 0 ? assets[0].location : "Plant Area 3, Grid B-7";
    setFormAssetName(defaultAsset);
    setFormLocation(defaultLoc);
    setAssetInputMode("manual");
    setFormDefectType("Pitting Corrosion");
    setFormSeverity("Major");
    setFormStatus("Open");
    setFormReportedBy(isDefectRequester ? "Defect Requester" : "Mansoor Ahmed (Anti Corrosion Officer)");
    setFormDepartment("Anti Corrosion Department");
    setIsCustomDept(false);
    setFormCorrectiveAction("");
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (defect: DefectRecord) => {
    setEditingDefect(defect);
    setFormDescription(defect.description || defect.title || "");
    setFormAssetName(defect.assetName);
    setFormLocation(defect.location);
    setAssetInputMode("manual");
    setFormDefectType(defect.defectType);
    setFormSeverity(defect.severity);
    setFormStatus(defect.status);
    setFormReportedBy(defect.reportedBy);
    const currentDept = defect.department || "Anti Corrosion Department";
    setFormDepartment(currentDept);
    setIsCustomDept(!DEPARTMENT_OPTIONS.includes(currentDept as any));
    setFormCorrectiveAction(defect.correctiveAction || "");
    setIsModalOpen(true);
  };

  // Handle asset dropdown selection
  const handleSelectAsset = (assetName: string) => {
    setFormAssetName(assetName);
    const found = assets.find(a => a.name === assetName);
    if (found && found.location) {
      setFormLocation(found.location);
    }
  };

  // Submit create or edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim()) return;

    const trimmedDesc = formDescription.trim();
    const generatedTitle = trimmedDesc.length > 70 
      ? trimmedDesc.slice(0, 70) + "..." 
      : trimmedDesc;

    if (editingDefect) {
      const updated = defects.map(d => 
        d.id === editingDefect.id 
          ? {
              ...d,
              title: generatedTitle,
              assetName: formAssetName.trim() || "Unassigned Asset",
              location: formLocation.trim() || "Main Plant Site",
              defectType: formDefectType,
              severity: formSeverity,
              status: formStatus,
              reportedBy: formReportedBy.trim() || "Inspector",
              department: formDepartment.trim() || "Anti Corrosion Department",
              description: trimmedDesc,
              correctiveAction: formCorrectiveAction.trim()
            }
          : d
      );
      saveDefects(updated);
    } else {
      const newDefectCode = `DEF-${new Date().getFullYear()}-${String(defects.length + 1).padStart(3, "0")}`;
      const newRecord: DefectRecord = {
        id: "def-" + Date.now(),
        defectCode: newDefectCode,
        title: generatedTitle,
        assetName: formAssetName.trim() || "Unassigned Asset",
        location: formLocation.trim() || "Main Plant Site",
        defectType: formDefectType,
        severity: formSeverity,
        status: formStatus,
        reportedDate: new Date().toISOString().split("T")[0],
        reportedBy: formReportedBy.trim() || "Inspector",
        department: formDepartment.trim() || "Anti Corrosion Department",
        description: trimmedDesc,
        correctiveAction: formCorrectiveAction.trim()
      };
      saveDefects([newRecord, ...defects]);
    }

    setIsModalOpen(false);
  };

  // Cycle status
  const handleAdvanceStatus = (defect: DefectRecord) => {
    const sequence: DefectRecord["status"][] = ["Open", "Under Investigation", "Remediation Scheduled", "Resolved"];
    const currentIndex = sequence.indexOf(defect.status);
    const nextStatus = sequence[(currentIndex + 1) % sequence.length];
    
    const updated = defects.map(d => d.id === defect.id ? { ...d, status: nextStatus } : d);
    saveDefects(updated);
  };

  // Delete defect
  const confirmDelete = () => {
    if (deleteConfirmId) {
      const updated = defects.filter(d => d.id !== deleteConfirmId);
      saveDefects(updated);
      setDeleteConfirmId(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Defect Code", "Observations", "Asset Name", "Location", "Defect Type", "Severity", "Status", "Reported Date", "Reported By", "Department", "Corrective Action"];
    const rows = defects.map(d => [
      `"${d.defectCode}"`,
      `"${(d.description || d.title || "").replace(/"/g, '""')}"`,
      `"${d.assetName.replace(/"/g, '""')}"`,
      `"${d.location.replace(/"/g, '""')}"`,
      `"${d.defectType}"`,
      `"${d.severity}"`,
      `"${d.status}"`,
      `"${d.reportedDate}"`,
      `"${d.reportedBy.replace(/"/g, '""')}"`,
      `"${(d.department || "Anti Corrosion Department").replace(/"/g, '""')}"`,
      `"${(d.correctiveAction || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Defect_Log_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-6 md:p-8 bg-[#0a0d18] text-gray-200 overflow-y-auto min-h-0">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section matching CorroTech / Coatlogix style */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <ShieldAlert size={22} className="text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans flex items-center gap-2">
                  DEFECT LOG
                </h1>
                <p className="text-xs text-amber-400/90 font-mono tracking-wide">
                  Report corrosion & damage • Comprehensive integrity tracking
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportCSV}
              className="bg-gray-900 hover:bg-gray-800 text-gray-300 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer border border-white/10 hover:border-white/20 font-mono"
              title="Download CSV Report"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={handleOpenAdd}
              className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-extrabold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20 font-mono uppercase tracking-wider"
              id="btn-report-defect"
            >
              <Plus size={16} className="stroke-[3]" />
              <span>Report Defect</span>
            </button>
          </div>
        </header>

        {/* DEFECT REQUESTER AUTHORIZED WORKSPACE BANNER */}
        {isDefectRequester && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#0a0e1c] to-amber-950/40 border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
                <CheckCircle2 size={19} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black uppercase tracking-wider text-white">
                    DEFECT REQUESTER AUTHORIZED WORKSPACE
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                    ACTIVE PERMISSION
                  </span>
                </div>
                <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                  You have active authorization to submit defects, update lifecycle states, and export inspection telemetry.
                </p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-xl bg-black/40 border border-white/5 text-[10px] font-mono text-amber-400 font-bold shrink-0">
              ROLE: DEFECT REQUESTER
            </div>
          </div>
        )}

        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#101424] border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
            <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase font-mono mb-1">TOTAL LOGGED</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">{metrics.total}</span>
              <span className="text-xs text-amber-500 font-semibold font-mono">Reports</span>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-amber-500/20" />
          </div>

          <div className="bg-[#101424] border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
            <div className="text-[10px] font-bold text-red-400 tracking-wider uppercase font-mono mb-1">CRITICAL ALERTS</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-red-400 font-mono">{metrics.critical}</span>
              <span className="text-xs text-red-500 font-semibold font-mono">Immediate</span>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-red-500/40" />
          </div>

          <div className="bg-[#101424] border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
            <div className="text-[10px] font-bold text-yellow-400 tracking-wider uppercase font-mono mb-1">ACTIVE / OPEN</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-yellow-400 font-mono">{metrics.openOrActive}</span>
              <span className="text-xs text-yellow-500 font-semibold font-mono">In-Action</span>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-yellow-500/30" />
          </div>

          <div className="bg-[#101424] border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
            <div className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase font-mono mb-1">RESOLVED</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400 font-mono">{metrics.resolved}</span>
              <span className="text-xs text-emerald-500 font-semibold font-mono">Remediated</span>
            </div>
            <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500/30" />
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#101424]/80 p-4 rounded-2xl border border-white/5">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text"
              placeholder="Search by defect ID, asset, type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0d18] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 font-mono"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-400 font-bold uppercase tracking-wider font-mono mr-1 flex items-center gap-1 text-[11px]">
              <Filter size={13} /> Severity:
            </span>
            {["All", "Critical", "Major", "Moderate", "Minor"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg font-mono font-bold text-[11px] transition-all cursor-pointer ${
                  severityFilter === sev 
                    ? "bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20" 
                    : "bg-[#0a0d18] text-gray-400 hover:text-white border border-white/5 hover:border-white/20"
                }`}
              >
                {sev}
              </button>
            ))}

            <span className="text-gray-400 font-bold uppercase tracking-wider font-mono mx-1 flex items-center gap-1 text-[11px]">
              Status:
            </span>
            {["All", "Open", "Under Investigation", "Remediation Scheduled", "Resolved"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-mono font-bold text-[11px] transition-all cursor-pointer ${
                  statusFilter === st 
                    ? "bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20" 
                    : "bg-[#0a0d18] text-gray-400 hover:text-white border border-white/5 hover:border-white/20"
                }`}
              >
                {st === "Remediation Scheduled" ? "Scheduled" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Defect Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDefects.length > 0 ? (
            filteredDefects.map((defect) => {
              const isCritical = defect.severity === "Critical";
              const isMajor = defect.severity === "Major";
              const isResolved = defect.status === "Resolved";

              return (
                <div 
                  key={defect.id} 
                  className={`bg-[#101424] border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xl group relative overflow-hidden ${
                    isCritical 
                      ? "border-red-500/40 hover:border-red-500/70 bg-gradient-to-b from-[#18111e] to-[#101424]" 
                      : isMajor 
                      ? "border-amber-500/30 hover:border-amber-500/60" 
                      : "border-white/5 hover:border-white/20"
                  }`}
                >
                  {/* Top Header line with Defect Code & Severity */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          {defect.defectCode}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                          defect.severity === "Critical" 
                            ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" 
                            : defect.severity === "Major" 
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" 
                            : defect.severity === "Moderate" 
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" 
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}>
                          {defect.severity}
                        </span>
                      </div>

                      {/* Status pill with quick advance click */}
                      <button
                        onClick={() => handleAdvanceStatus(defect)}
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                          defect.status === "Resolved"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                            : defect.status === "Remediation Scheduled"
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30"
                            : defect.status === "Under Investigation"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"
                            : "bg-gray-800 text-gray-300 border-white/10 hover:border-white/20"
                        }`}
                        title="Click to cycle status"
                      >
                        {defect.status === "Resolved" && <CheckCircle2 size={11} />}
                        <span>{defect.status}</span>
                      </button>
                    </div>

                    {/* Defect Type Badge */}
                    <div className="mt-1">
                      <span className="text-[10.5px] font-mono text-gray-300 bg-white/5 px-2.5 py-0.5 rounded border border-white/5 inline-block">
                        {defect.defectType}
                      </span>
                    </div>

                    {/* Corrosion & Damage Observations (Main Title & Body) */}
                    <div className="my-2.5">
                      <h3 className="font-sans font-bold text-white text-sm tracking-tight group-hover:text-amber-400 transition-colors leading-snug">
                        {defect.description || defect.title}
                      </h3>
                    </div>

                    {/* Asset & Location Information */}
                    <div className="space-y-2 my-3 text-xs text-gray-400 border-t border-b border-white/5 py-3 font-mono">
                      <div className="flex items-center gap-2">
                        <Box size={14} className="text-amber-500 shrink-0" />
                        <span className="text-gray-300 font-bold">{defect.assetName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-500 shrink-0" />
                        <span className="text-gray-400">{defect.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-500" />
                          <span>Reported: <strong className="text-gray-300">{defect.reportedDate}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Remediation Strategy */}
                    {defect.correctiveAction && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-[11px] leading-relaxed mb-1">
                        <strong className="text-amber-400 uppercase font-mono block text-[9.5px] mb-0.5 tracking-wider">
                          Remediation Strategy:
                        </strong>
                        {defect.correctiveAction}
                      </div>
                    )}
                  </div>

                  {/* Reporter, Department and Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-white/5 text-xs">
                    <div className="flex flex-col text-[10px] font-mono text-gray-400 leading-tight truncate max-w-[240px]">
                      <span className="text-gray-300 truncate" title={defect.reportedBy}>
                        By: {defect.reportedBy}
                      </span>
                      {defect.department && (
                        <span className="text-amber-400/80 truncate text-[9.5px]" title={defect.department}>
                          Dept: {defect.department}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        onClick={() => handleOpenEdit(defect)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition active:scale-95 text-xs flex items-center gap-1 cursor-pointer"
                        title="Edit Defect"
                      >
                        <Pencil size={13} />
                        <span className="hidden sm:inline text-[10px] font-mono">Edit</span>
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(defect.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition active:scale-95 text-xs flex items-center gap-1 cursor-pointer"
                        title="Delete Defect"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="md:col-span-2 bg-[#101424] border border-dashed border-white/10 rounded-2xl p-12 text-center text-gray-500 space-y-3">
              <ShieldAlert className="mx-auto text-gray-600 mb-2" size={36} />
              <p className="text-sm font-semibold text-gray-300">No defect records found matching current criteria</p>
              <p className="text-xs text-gray-500">Log a new corrosion defect or clear search filters to inspect data.</p>
              <button 
                onClick={handleOpenAdd}
                className="mt-2 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition cursor-pointer"
              >
                <Plus size={14} />
                Report First Defect
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-[#13182b] border border-red-500/30 rounded-2xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Defect Entry?</h3>
                <p className="text-xs text-gray-400 mt-1">This corrosion damage record will be permanently removed from telemetry logs.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs cursor-pointer shadow-lg shadow-red-600/20"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Defect Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#101424] border border-white/10 rounded-2xl w-full max-w-xl p-6 relative shadow-2xl overflow-y-auto max-h-[92vh]">
              
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <ShieldAlert size={18} />
                </div>
                <h2 className="text-xl font-black text-white uppercase font-sans">
                  {editingDefect ? "Edit Defect Record" : "Report Corrosion & Damage"}
                </h2>
              </div>
              <p className="text-amber-400/90 text-xs mb-5 font-mono">
                {editingDefect ? `Updating record: ${editingDefect.defectCode}` : "Submit defect telemetry for inspection and remediation tracking"}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Corrosion & Damage Observations (Replaces Defect Title at the top) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-amber-400 uppercase font-bold tracking-wider font-mono flex items-center gap-1.5">
                      Corrosion & Damage Observations *
                    </label>
                    <span className="text-[10px] text-gray-500 font-mono">Primary Inspection Telemetry</span>
                  </div>
                  <textarea 
                    rows={3}
                    required
                    placeholder="Describe specific corrosion type, pitting depth, coating breakdown pattern, surface rust grades, ultrasonic thickness readings, damage scope..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-[#0a0d18] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 resize-none font-sans leading-relaxed"
                  />
                </div>

                {/* 2. Asset & Location Portion (with explicit Manual Input option) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-400 uppercase font-bold tracking-wider font-mono">Asset *</label>
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <button
                          type="button"
                          onClick={() => setAssetInputMode("manual")}
                          className={`px-2 py-0.5 rounded transition cursor-pointer ${
                            assetInputMode === "manual"
                              ? "bg-amber-500 text-gray-950 font-bold"
                              : "text-gray-400 hover:text-white bg-white/5"
                          }`}
                        >
                          Manual
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssetInputMode("dropdown")}
                          className={`px-2 py-0.5 rounded transition cursor-pointer ${
                            assetInputMode === "dropdown"
                              ? "bg-amber-500 text-gray-950 font-bold"
                              : "text-gray-400 hover:text-white bg-white/5"
                          }`}
                        >
                          Select List
                        </button>
                      </div>
                    </div>

                    {assetInputMode === "dropdown" && assets.length > 0 ? (
                      <select
                        value={formAssetName}
                        onChange={(e) => {
                          if (e.target.value === "__manual__") {
                            setAssetInputMode("manual");
                          } else {
                            handleSelectAsset(e.target.value);
                          }
                        }}
                        className="w-full bg-[#0a0d18] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/60 font-sans cursor-pointer"
                        required
                      >
                        <option value="">-- Select Registered Asset --</option>
                        {assets.map((a) => (
                          <option key={a.id} value={a.name}>
                            {a.name} ({a.type})
                          </option>
                        ))}
                        <option value="__manual__">✏️ Enter custom asset manually...</option>
                      </select>
                    ) : (
                      <div>
                        <input 
                          type="text"
                          required
                          list="registered-assets-list"
                          placeholder="Type asset name manually (e.g. Dam Boards, Stacker #1)"
                          value={formAssetName}
                          onChange={(e) => handleSelectAsset(e.target.value)}
                          className="w-full bg-[#0a0d18] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 font-sans"
                        />
                        <datalist id="registered-assets-list">
                          {assets.map((a) => (
                            <option key={a.id} value={a.name}>
                              {a.type} — {a.location}
                            </option>
                          ))}
                        </datalist>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-400 uppercase font-bold tracking-wider font-mono">Location *</label>
                      <span className="text-[10px] text-gray-500 font-mono">Manual Input</span>
                    </div>
                    <input 
                      type="text"
                      required
                      list="known-locations-list"
                      placeholder="Type location manually (e.g. Intake Area, Grid B-7)"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full bg-[#0a0d18] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 font-sans"
                    />
                    <datalist id="known-locations-list">
                      <option value="Intake Area" />
                      <option value="Plant Area 3, Grid B-7" />
                      <option value="Tank Farm West, Bay 2" />
                      <option value="Platform Alpha, Sector 4" />
                      <option value="Main Marine Jetty Berth #2" />
                      <option value="Boiler Unit 2, Header Structure" />
                    </datalist>
                  </div>
                </div>

                {/* 3. Defect Type, Severity Level & Operational Status (Estimated Area removed) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider font-mono">Defect Type</label>
                    <select
                      value={formDefectType}
                      onChange={(e) => setFormDefectType(e.target.value)}
                      className="w-full bg-[#0a0d18] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/60 font-sans cursor-pointer"
                    >
                      {DEFECT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider font-mono">Severity Level</label>
                    <select
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value as any)}
                      className="w-full bg-[#0a0d18] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/60 font-sans cursor-pointer"
                    >
                      <option value="Critical">Critical (Immediate Hazard)</option>
                      <option value="Major">Major (Remediation Priority)</option>
                      <option value="Moderate">Moderate (Schedule Monitoring)</option>
                      <option value="Minor">Minor (Cosmetic / Touch-up)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider font-mono">Operational Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full bg-[#0a0d18] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/60 font-sans cursor-pointer"
                    >
                      <option value="Open">Open (Pending Evaluation)</option>
                      <option value="Under Investigation">Under Investigation</option>
                      <option value="Remediation Scheduled">Remediation Scheduled</option>
                      <option value="Resolved">Resolved / Rectified</option>
                    </select>
                  </div>
                </div>

                {/* 4. Reported By & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider font-mono">Reported By</label>
                    <input 
                      type="text"
                      value={formReportedBy}
                      onChange={(e) => setFormReportedBy(e.target.value)}
                      placeholder="Inspector / Engineer Name"
                      className="w-full bg-[#0a0d18] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-400 uppercase font-bold tracking-wider font-mono">Department</label>
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !isCustomDept;
                          setIsCustomDept(nextState);
                          if (!nextState && !DEPARTMENT_OPTIONS.includes(formDepartment as any)) {
                            setFormDepartment("Anti Corrosion Department");
                          }
                        }}
                        className="text-[10px] font-mono text-amber-400/90 hover:text-amber-300 underline cursor-pointer"
                      >
                        {isCustomDept ? "← Select from List" : "+ Enter Custom"}
                      </button>
                    </div>

                    {!isCustomDept ? (
                      <select 
                        value={formDepartment}
                        onChange={(e) => {
                          if (e.target.value === "__custom__") {
                            setIsCustomDept(true);
                            setFormDepartment("");
                          } else {
                            setFormDepartment(e.target.value);
                          }
                        }}
                        className="w-full bg-[#0a0d18] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/60 font-sans cursor-pointer"
                      >
                        {DEPARTMENT_OPTIONS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                        <option value="__custom__">✏️ Other / Custom Department...</option>
                      </select>
                    ) : (
                      <div className="relative">
                        <input 
                          type="text"
                          list="department-options"
                          value={formDepartment}
                          onChange={(e) => setFormDepartment(e.target.value)}
                          placeholder="Type department name..."
                          className="w-full bg-[#0a0d18] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 font-sans"
                        />
                        <datalist id="department-options">
                          {DEPARTMENT_OPTIONS.map((dept) => (
                            <option key={dept} value={dept} />
                          ))}
                        </datalist>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Recommended Remediation Action Strategy */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 uppercase font-bold tracking-wider font-mono">Recommended Remediation Action</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Surface prep to ISO 8501-1 Sa 2.5, stripe coat welds, apply 300 microns polyamine cured epoxy..."
                    value={formCorrectiveAction}
                    onChange={(e) => setFormCorrectiveAction(e.target.value)}
                    className="w-full bg-[#0a0d18] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 resize-none font-sans leading-relaxed"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 font-mono text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold font-mono text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                  >
                    {editingDefect ? "Save Changes" : "Log Defect"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
