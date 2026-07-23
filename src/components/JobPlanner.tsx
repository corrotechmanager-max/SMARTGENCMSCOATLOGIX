import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { 
  Wrench, PlayCircle, BriefcaseBusiness, CalendarDays, Plus, Pencil, Trash2, Clock, 
  MapPin, User, FileText, CheckCircle2, ChevronDown, ChevronUp, AlertTriangle, Users, Award,
  ChevronLeft, ChevronRight, Zap, X
} from "lucide-react";
import { Job } from "../types";
import JobModal from "./JobModal";
import { downloadJobWordReport, downloadJobPdfReport, downloadJobCsvReport } from "../utils/jobReport";
import { subscribeToStore, saveToStore } from "../lib/firebase";

// Initial default jobs matching realistic scenarios
const DEFAULT_JOBS: Job[] = [
  { 
    id: "job-1", 
    title: "High Pressure Washing & required paint touch up work", 
    type: "PM", 
    status: "Planned", 
    priority: "Medium",
    startDate: "2026-09-30",
    endDate: "2026-10-05",
    assetName: "Storage Tank T-102",
    workOrderNo: "WO-2026-0142",
    pmType: "Routine Inspection",
    frequency: "Quarterly",
    technician: "J. Rahman",
    scope: "Blast area and apply Jotun Primers to 150 DFT. Ensure safety clearance for hot work.",
    notes: "Requires scaffolding set up."
  },
  { 
    id: "job-2", 
    title: "Primary pipeline sacrificial anode replacement", 
    type: "PM", 
    status: "In Progress", 
    priority: "High",
    startDate: "2026-06-28",
    endDate: "2026-07-04",
    assetName: "Pipeline Section P-1",
    workOrderNo: "WO-2026-0143",
    pmType: "Preventive Repair",
    frequency: "Annual",
    technician: "K. Petrov",
    scope: "Weld 12 sacrificial anodes at specified pipe intervals. Measure and log resistance.",
    notes: "High pressure line, execute with hot-permit."
  },
  {
    id: "job-3", 
    title: "SPIC Marine Dock Corrosion Overhaul Project", 
    type: "Project", 
    status: "Planned", 
    priority: "High",
    startDate: "2026-07-15",
    endDate: "2026-12-15",
    projectNo: "PROJ-2026-012",
    contractNo: "CTR-SPIC-2026-04",
    client: "SPIC Refinery",
    projectManager: "E. Kovich",
    phase: "Engineering",
    budgetHours: 1200,
    scope: "Complete structural corrosion profiling, splash zone recoating, and structural steel repair.",
    notes: "Weekly updates required on Sunday afternoon."
  },
  {
    id: "job-4", 
    title: "Emergency repairing of blistered coating on Tank T-102 outlet valve flange", 
    type: "OnDemand", 
    status: "In Progress", 
    priority: "High",
    startDate: "2026-07-02",
    endDate: "2026-07-03",
    assetName: "Storage Tank T-102",
    siteLocation: "Tank Farm B, Row 2",
    onDemandType: "Unscheduled Repair",
    emergencyLevel: "Critical",
    technician: "M. Farhan",
    scope: "Urgent power-tool cleaning and organic zinc rich primer application on blistered areas. Spot dft reading must be logged.",
    notes: "Reported by operation team during daily walkdown."
  }
];

interface JobPlannerProps {
  initialTab?: string;
}

export default function JobPlanner({ initialTab }: JobPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState(initialTab || "PM Jobs");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [modalType, setModalType] = useState<"PM" | "Running" | "Project" | "OnDemand" | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  const [reportPriority, setReportPriority] = useState("All");
  const [reportStatus, setReportStatus] = useState("All");
  const [exportMessage, setExportMessage] = useState("");

  // For Calendar View
  const [navDate, setNavDate] = useState(() => new Date(2026, 6, 2)); // July 2, 2026
  const [selectedDateStr, setSelectedDateStr] = useState("2026-07-02");

  const monthNames = useMemo(() => [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ], []);

  const handlePrevMonth = () => {
    setNavDate(prev => {
      const y = prev.getFullYear();
      const m = prev.getMonth();
      return m === 0 ? new Date(y - 1, 11, 1) : new Date(y, m - 1, 1);
    });
  };

  const handleNextMonth = () => {
    setNavDate(prev => {
      const y = prev.getFullYear();
      const m = prev.getMonth();
      return m === 11 ? new Date(y + 1, 0, 1) : new Date(y, m + 1, 1);
    });
  };

  const handleResetToToday = () => {
    setNavDate(new Date(2026, 6, 2));
    setSelectedDateStr("2026-07-02");
  };

  const calendarDays = useMemo(() => {
    const year = navDate.getFullYear();
    const month = navDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; dateObj: Date }[] = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      days.push({
        dateStr: dStr,
        dayNum,
        isCurrentMonth: false,
        dateObj: new Date(prevYear, prevMonth, dayNum)
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        dateStr: dStr,
        dayNum: i,
        isCurrentMonth: true,
        dateObj: new Date(year, month, i)
      });
    }

    // Next month padding to fill standard 35 or 42 grid cells
    const remainingSlots = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        dateStr: dStr,
        dayNum: i,
        isCurrentMonth: false,
        dateObj: new Date(nextYear, nextMonth, i)
      });
    }

    while (days.length < 35) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const nextDayNum = days.length - (startDayOfWeek + totalDays) + 1;
      const dStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(nextDayNum).padStart(2, "0")}`;
      days.push({
        dateStr: dStr,
        dayNum: nextDayNum,
        isCurrentMonth: false,
        dateObj: new Date(nextYear, nextMonth, nextDayNum)
      });
    }

    return days;
  }, [navDate]);

  const getJobsForDate = (dateStr: string) => {
    return jobs.filter(job => {
      return dateStr >= job.startDate && dateStr <= job.endDate;
    });
  };

  const calendarSelectedJobs = useMemo(() => {
    return getJobsForDate(selectedDateStr);
  }, [jobs, selectedDateStr]);

  // Live Cloud Sync via Firebase Firestore
  useEffect(() => {
    const unsubscribe = subscribeToStore<Job>("corrotech_jobs", DEFAULT_JOBS, (cloudJobs) => {
      // Filter out unwanted items
      const filtered = cloudJobs.filter((j) => {
        const isTargetTitle = j.title && (
          j.title.toLowerCase().includes("maintenance bldg") ||
          j.title.toLowerCase().includes("entrance steel structure")
        );
        const isTargetLocation = j.siteLocation && j.siteLocation.toLowerCase().includes("maintenance building");
        return !(isTargetTitle && isTargetLocation);
      });
      setJobs(filtered);
    });

    return () => unsubscribe();
  }, []);

  // Save helper syncing to LocalStorage and Cloud Firestore
  const saveJobs = (updatedJobs: Job[]) => {
    setJobs(updatedJobs);
    saveToStore("corrotech_jobs", updatedJobs);
  };

  const stats = useMemo(() => {
    const statuses = ["Planned", "In Progress", "On Hold", "Completed", "Overdue", "Cancelled"];
    const targetJobs = initialTab === "Project Jobs" 
      ? jobs.filter(j => j.type === "Project") 
      : jobs;
    return statuses.map(status => ({
      name: status,
      count: targetJobs.filter(j => j.status === status).length,
      color: status === "Planned" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
             status === "In Progress" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
             status === "On Hold" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
             status === "Completed" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
             status === "Overdue" ? "bg-red-500/20 text-red-400 border border-red-500/30" : 
             "bg-gray-800 text-gray-400 border border-gray-700"
    }));
  }, [jobs, initialTab]);

  const tabs = [
    { name: "PM Jobs", icon: Wrench, type: "PM" },
    { name: "Project Jobs", icon: BriefcaseBusiness, type: "Project" },
    { name: "On Demand Jobs", icon: Zap, type: "OnDemand" },
    { name: "Calendar", icon: CalendarDays, type: "All" },
  ];

  const handleSaveJob = (savedJob: Job) => {
    const exists = jobs.some(j => j.id === savedJob.id);
    let updated;
    if (exists) {
      updated = jobs.map(j => j.id === savedJob.id ? savedJob : j);
    } else {
      updated = [...jobs, savedJob];
    }
    saveJobs(updated);
    setEditingJob(null);
    setModalType(null);
  };

  const handleDeleteJob = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteJob = () => {
    if (deleteConfirmId) {
      const updated = jobs.filter(j => j.id !== deleteConfirmId);
      saveJobs(updated);
      setDeleteConfirmId(null);
    }
  };

  const handleEditJobClick = (job: Job) => {
    setEditingJob(job);
    setModalType(job.type);
  };

  const toggleExpand = (id: string) => {
    setExpandedJobs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderJobCard = (job: Job) => {
    const isExpanded = !!expandedJobs[job.id];
    return (
      <section 
        key={job.id} 
        className="bg-[#1f1d1b] border border-gray-800/80 hover:border-gray-750 p-5 rounded-2xl flex flex-col transition-all duration-300 shadow-xl"
      >
        {/* Summary/Main Row */}
        <div className="flex items-start gap-4">
          {/* Bullet type indicator */}
          <div className={`mt-2 w-2.5 h-2.5 rounded-full ${
            job.type === "PM" ? "bg-blue-500" : 
            job.type === "Running" ? "bg-amber-500" : 
            job.type === "Project" ? "bg-purple-500" :
            "bg-red-500"
          } shrink-0`} />
          
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpand(job.id)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                  job.type === "PM" ? "bg-blue-500/10 text-blue-400" : 
                  job.type === "Running" ? "bg-amber-500/10 text-amber-400" : 
                  job.type === "Project" ? "bg-purple-500/10 text-purple-400" :
                  "bg-red-500/10 text-red-400"
                }`}>
                  {job.type === "OnDemand" ? "On Demand" : job.type} Job
                </span>
                <span className="text-xs text-gray-500 font-semibold">•</span>
                <span className="text-xs text-gray-400 font-mono">{job.startDate} to {job.endDate}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  job.status === "Planned" ? "bg-blue-500/10 text-blue-400" :
                  job.status === "In Progress" ? "bg-amber-500/10 text-amber-400" :
                  job.status === "On Hold" ? "bg-yellow-500/10 text-yellow-400" :
                  job.status === "Completed" ? "bg-green-500/10 text-green-400" :
                  job.status === "Overdue" ? "bg-red-500/10 text-red-400" :
                  "bg-gray-800 text-gray-400"
                }`}>
                  {job.status}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  job.priority === "High" ? "bg-red-500/10 text-red-400" :
                  job.priority === "Medium" ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-blue-500/10 text-blue-400"
                }`}>
                  {job.priority} Priority
                </span>
              </div>
            </div>

            <h3 className="text-white font-bold text-base hover:text-amber-400 transition-colors tracking-tight">
              {job.title}
            </h3>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
            <button 
              onClick={() => handleEditJobClick(job)}
              className="p-1.5 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition active:scale-95 cursor-pointer"
              title="Edit Job"
            >
              <Pencil size={15} />
            </button>
            <button 
              onClick={() => handleDeleteJob(job.id)}
              className="p-1.5 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10 transition active:scale-95 cursor-pointer"
              title="Delete Job"
            >
              <Trash2 size={15} />
            </button>
            <button 
              onClick={() => toggleExpand(job.id)}
              className="p-1.5 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition active:scale-95 cursor-pointer"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Expanded Parameter Details Row */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-800/60 text-xs text-gray-400 space-y-4 bg-gray-950/20 p-4 rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {job.type === "PM" && (
                <>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Asset Targeted</span>
                    <p className="text-white font-semibold mt-0.5">{job.assetName || "Unassigned"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Work Order No</span>
                    <p className="text-white font-mono mt-0.5">{job.workOrderNo || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">PM Sub-Type</span>
                    <p className="text-white font-semibold mt-0.5">{job.pmType} ({job.frequency})</p>
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Technician Assigned</span>
                    <div className="flex items-center gap-1.5 text-white font-semibold mt-0.5">
                      <User size={14} className="text-amber-500" />
                      <span>{job.technician || "Unassigned"}</span>
                    </div>
                  </div>
                </>
              )}

              {job.type === "Running" && (
                <>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Asset Targeted</span>
                    <p className="text-white font-semibold mt-0.5">{job.assetName || "General Maintenance"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Site / Location</span>
                    <div className="flex items-center gap-1 text-white font-semibold mt-0.5">
                      <MapPin size={14} className="text-amber-500" />
                      <span>{job.siteLocation || "Unassigned"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Project Ref</span>
                    <p className="text-white font-mono mt-0.5">{job.projectRef || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Foreman & Crew Size</span>
                    <div className="flex items-center gap-1.5 text-white font-semibold mt-0.5">
                      <Users size={14} className="text-amber-500" />
                      <span>{job.foreman || "N/A"} ({job.crewSize} crew)</span>
                    </div>
                  </div>
                </>
              )}

              {job.type === "Project" && (
                <>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Asset Targeted</span>
                    <p className="text-white font-semibold mt-0.5">{job.assetName || "General Maintenance"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Client / Org</span>
                    <p className="text-white font-semibold mt-0.5">{job.client || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Project / Contract Code</span>
                    <p className="text-white font-mono mt-0.5">{job.projectNo || "N/A"} / {job.contractNo || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">PM & Project Phase</span>
                    <div className="flex items-center gap-1.5 text-white font-semibold mt-0.5">
                      <Award size={14} className="text-amber-500" />
                      <span>{job.projectManager || "N/A"} ({job.phase})</span>
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-4 mt-2 border-t border-gray-850 pt-2 flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Budgeted Man Hours</span>
                    <p className="text-amber-400 font-bold text-sm bg-amber-500/10 px-2.5 py-0.5 rounded-full">{job.budgetHours} hours</p>
                  </div>
                </>
              )}

              {job.type === "OnDemand" && (
                <>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Asset Targeted</span>
                    <p className="text-white font-semibold mt-0.5">{job.assetName || "General Maintenance"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Site / Location</span>
                    <div className="flex items-center gap-1 text-white font-semibold mt-0.5">
                      <MapPin size={14} className="text-amber-500" />
                      <span>{job.siteLocation || "Unassigned"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">On-Demand Type</span>
                    <p className="text-white font-semibold mt-0.5">{job.onDemandType || "Unscheduled Repair"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Responder & Priority</span>
                    <div className="flex items-center gap-1.5 text-white font-semibold mt-0.5">
                      <User size={14} className="text-amber-500" />
                      <span>{job.technician || "Unassigned"} ({job.emergencyLevel || "High"} emergency)</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {job.scope && (
              <div className="pt-2 border-t border-gray-800/40">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 flex items-center gap-1">
                  <FileText size={12} className="text-amber-500" /> Job Scope & Safety parameters
                </span>
                <p className="text-gray-300 mt-1 leading-relaxed text-xs">
                  {job.scope}
                </p>
              </div>
            )}

            {job.notes && (
              <div className="pt-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Remarks & Notes</span>
                <p className="text-gray-400 mt-0.5 italic text-xs">
                  "{job.notes}"
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    );
  };

  const filteredJobs = useMemo(() => {
    if (initialTab === "In Progress Jobs") {
      return jobs.filter(j => j.status === "In Progress");
    }
    if (initialTab === "Project Jobs") {
      return jobs.filter(j => j.type === "Project");
    }
    if (activeTab === "Calendar") {
      return jobs;
    }
    if (activeTab === "On Demand Jobs") {
      return jobs.filter(j => j.type === "OnDemand");
    }
    if (activeTab === "PM Jobs") {
      return jobs.filter(j => j.type === "PM");
    }
    if (activeTab === "Project Jobs") {
      return jobs.filter(j => j.type === "Project");
    }
    return jobs;
  }, [jobs, activeTab, initialTab]);

  return (
    <div className="flex-1 p-6 md:p-8 bg-[#171513] text-gray-200 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {initialTab === "In Progress Jobs" ? (
                <PlayCircle className="text-amber-500 animate-pulse" />
              ) : (
                <CalendarDays className="text-amber-500" />
              )}
              {initialTab === "In Progress Jobs" 
                ? "Active In-Progress Jobs" 
                : initialTab === "Project Jobs" 
                ? "Project Jobs Overview" 
                : "Job Planner"}
            </h1>
            <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20">
              {initialTab === "In Progress Jobs" 
                ? jobs.filter(j => j.status === "In Progress").length 
                : initialTab === "Project Jobs" 
                ? jobs.filter(j => j.type === "Project").length 
                : jobs.length} active
            </span>
          </div>
          {initialTab !== "In Progress Jobs" && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowReportModal(true)}
                className="bg-[#242220] hover:bg-[#2d2a28] border border-gray-800 hover:border-amber-500/35 text-amber-400 hover:text-amber-300 font-bold py-2.5 px-4 rounded-xl text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-md"
                id="comprehensive-report-btn"
              >
                <FileText size={16} />
                <span>Comprehensive Report</span>
              </button>

              <button 
                onClick={() => {
                  setEditingJob(null);
                  setModalType(
                    initialTab === "Project Jobs" ? "Project" :
                    activeTab === "PM Jobs" ? "PM" : 
                    activeTab === "Project Jobs" ? "Project" : 
                    activeTab === "On Demand Jobs" ? "OnDemand" : 
                    "PM"
                  );
                }}
                className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2.5 px-5 rounded-xl text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <Plus size={16} /> New {
                  initialTab === "Project Jobs" ? "Project" :
                  activeTab === "PM Jobs" ? "PM" : 
                  activeTab === "Project Jobs" ? "Project" : 
                  activeTab === "On Demand Jobs" ? "On Demand" : 
                  "Job"
                }
              </button>
            </div>
          )}
        </header>

        {modalType && (
          <JobModal 
            type={modalType} 
            isOpen={!!modalType} 
            editingJob={editingJob}
            onClose={() => {
              setModalType(null);
              setEditingJob(null);
            }} 
            onSave={handleSaveJob}
          />
        )}

        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blurring effect */}
            <div 
              className="fixed inset-0 bg-black/85 backdrop-blur-md" 
              onClick={() => setShowReportModal(false)} 
            />
            
            {/* Modal Body */}
            <div className="relative w-full max-w-5xl bg-[#141210] border border-gray-800 rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden text-gray-300">
              
              {/* Modal Header */}
              <header className="p-6 border-b border-gray-800 bg-[#1a1816] flex flex-col gap-4 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                      <FileText size={22} className="text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        Intelligent Integrity & Coating Job Audit Report
                      </h2>
                      <p className="text-xs text-amber-500 font-mono tracking-wider mt-0.5 uppercase">
                        Comprehensive Industrial Job Directory & Operational Audit
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => {
                        setExportMessage("Compiling and generating PDF format report...");
                        try {
                          downloadJobPdfReport(jobs);
                          setExportMessage("SUCCESS: Comprehensive Job Audit Report successfully compiled and downloaded as PDF!");
                          setTimeout(() => setExportMessage(""), 5000);
                        } catch (e: any) {
                          setExportMessage(`ERROR: Failed to generate PDF report - ${e.message || e}`);
                        }
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
                    >
                      <span>Export PDF</span>
                    </button>
                    <button
                      onClick={async () => {
                        setExportMessage("Compiling and generating DOCX format report...");
                        try {
                          await downloadJobWordReport(jobs);
                          setExportMessage("SUCCESS: Comprehensive Job Audit Report successfully compiled and downloaded as Word DOCX!");
                          setTimeout(() => setExportMessage(""), 5000);
                        } catch (e: any) {
                          setExportMessage(`ERROR: Failed to generate DOCX report - ${e.message || e}`);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer shadow-lg shadow-blue-500/10 flex items-center gap-1.5"
                    >
                      <span>Export DOCX</span>
                    </button>
                    <button
                      onClick={() => {
                        setExportMessage("Compiling and generating CSV format spreadsheet...");
                        try {
                          downloadJobCsvReport(jobs);
                          setExportMessage("SUCCESS: Comprehensive Job Audit Report successfully compiled and downloaded as CSV Spreadsheet!");
                          setTimeout(() => setExportMessage(""), 5000);
                        } catch (e: any) {
                          setExportMessage(`ERROR: Failed to generate CSV report - ${e.message || e}`);
                        }
                      }}
                      className="px-4 py-2 bg-[#2d2a28] hover:bg-[#3d3a38] border border-gray-700 hover:border-gray-650 text-amber-400 text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl border border-gray-800 transition active:scale-95 cursor-pointer ml-1"
                      title="Close Report"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Simulated Export Action feedback messages */}
                {exportMessage && (
                  <div className={`p-3 rounded-xl text-xs font-semibold ${
                    exportMessage.startsWith("SUCCESS") 
                      ? "bg-green-950/20 border border-green-500/25 text-green-400" 
                      : exportMessage.startsWith("ERROR")
                      ? "bg-red-950/20 border border-red-500/25 text-red-400"
                      : "bg-amber-950/20 border border-amber-500/25 text-amber-400 animate-pulse"
                  }`}>
                    {exportMessage}
                  </div>
                )}

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                      Search Text
                    </label>
                    <input
                      type="text"
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      placeholder="Title, asset, technician name, work order..."
                      className="bg-[#0f0e0d] border border-gray-800 focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                      Priority Level
                    </label>
                    <select
                      value={reportPriority}
                      onChange={(e) => setReportPriority(e.target.value)}
                      className="bg-[#0f0e0d] border border-gray-800 focus:border-amber-500/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer transition-all"
                    >
                      <option value="All">All Priorities</option>
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                      Execution Status
                    </label>
                    <select
                      value={reportStatus}
                      onChange={(e) => setReportStatus(e.target.value)}
                      className="bg-[#0f0e0d] border border-gray-800 focus:border-amber-500/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer transition-all"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </header>

              {/* Scrollable Report Data Grid */}
              <div className="p-6 overflow-y-auto space-y-8 flex-1 bg-[#11100e]">
                
                {/* Aggregate Summary Block */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-950/40 border border-gray-800/60">
                  <div className="text-center p-2">
                    <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">PM Maintenance</span>
                    <p className="text-2xl font-black text-blue-400 mt-1">
                      {jobs.filter(j => j.type === "PM").length}
                    </p>
                  </div>
                  <div className="text-center p-2 border-l border-gray-800/80">
                    <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Major Projects</span>
                    <p className="text-2xl font-black text-purple-400 mt-1">
                      {jobs.filter(j => j.type === "Project").length}
                    </p>
                  </div>
                  <div className="text-center p-2 border-l border-gray-800/80">
                    <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">On-Demand Emergency</span>
                    <p className="text-2xl font-black text-red-400 mt-1">
                      {jobs.filter(j => j.type === "OnDemand").length}
                    </p>
                  </div>
                  <div className="text-center p-2 border-l border-gray-800/80">
                    <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Running Routine</span>
                    <p className="text-2xl font-black text-amber-400 mt-1">
                      {jobs.filter(j => j.type === "Running").length}
                    </p>
                  </div>
                </div>

                {/* SEGREGATION 1: Preventive Maintenance Jobs */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-800/80">
                    <Wrench size={16} className="text-blue-400" />
                    <h3 className="text-sm font-bold uppercase text-blue-400 tracking-wider font-mono">
                      I. Preventive Maintenance (PM) Core Jobs
                    </h3>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-bold ml-auto font-mono">
                      {jobs.filter(j => j.type === "PM").length} Total
                    </span>
                  </div>

                  <div className="space-y-3">
                    {jobs.filter(j => j.type === "PM").filter(j => {
                      const matchesSearch = !reportSearch || [j.title, j.assetName, j.technician, j.workOrderNo].some(val => val?.toLowerCase().includes(reportSearch.toLowerCase()));
                      const matchesPriority = reportPriority === "All" || j.priority === reportPriority;
                      const matchesStatus = reportStatus === "All" || j.status === reportStatus;
                      return matchesSearch && matchesPriority && matchesStatus;
                    }).length > 0 ? (
                      jobs.filter(j => j.type === "PM").filter(j => {
                        const matchesSearch = !reportSearch || [j.title, j.assetName, j.technician, j.workOrderNo].some(val => val?.toLowerCase().includes(reportSearch.toLowerCase()));
                        const matchesPriority = reportPriority === "All" || j.priority === reportPriority;
                        const matchesStatus = reportStatus === "All" || j.status === reportStatus;
                        return matchesSearch && matchesPriority && matchesStatus;
                      }).map((job) => (
                        <div key={job.id} className="p-4 rounded-xl bg-gray-950/20 border border-gray-900/60 flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {job.workOrderNo || "WO-N/A"}
                              </span>
                              <span className="text-xs text-gray-500 font-semibold">•</span>
                              <span className="text-xs text-gray-400 font-mono">{job.startDate} to {job.endDate}</span>
                            </div>
                            <h4 className="text-white font-bold text-sm">{job.title}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4 text-xs text-gray-400">
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">Target Asset:</span> <span className="text-gray-300 font-semibold">{job.assetName || "Unassigned"}</span></div>
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">PM Type / Freq:</span> <span className="text-gray-300">{job.pmType} ({job.frequency})</span></div>
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">Technician:</span> <span className="text-gray-300">{job.technician || "Unassigned"}</span></div>
                            </div>
                            {job.scope && (
                              <p className="text-[11px] text-gray-500 bg-[#161513] p-2.5 rounded-lg border border-gray-900 leading-relaxed mt-1">
                                <strong className="text-gray-400 font-mono uppercase tracking-wider text-[9px] block mb-0.5">Job Scope Parameters:</strong>
                                {job.scope}
                              </p>
                            )}
                            {job.notes && (
                              <p className="text-[11px] text-gray-500 italic mt-1 pl-1">
                                Remarks: "{job.notes}"
                              </p>
                            )}
                          </div>
                          <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center shrink-0 gap-2">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              job.status === "Planned" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                              job.status === "In Progress" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              job.status === "On Hold" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                              job.status === "Completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                              "bg-gray-800 text-gray-400 border border-gray-700"
                            }`}>
                              {job.status}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              job.priority === "High" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              job.priority === "Medium" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                              "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {job.priority} Priority
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-600 italic font-mono pl-2">No Preventive Maintenance jobs matching current filters.</p>
                    )}
                  </div>
                </section>

                {/* SEGREGATION 2: Major Project Phases */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-800/80">
                    <BriefcaseBusiness size={16} className="text-purple-400" />
                    <h3 className="text-sm font-bold uppercase text-purple-400 tracking-wider font-mono">
                      II. Major Integrity Projects & Capital Works
                    </h3>
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-bold ml-auto font-mono">
                      {jobs.filter(j => j.type === "Project").length} Total
                    </span>
                  </div>

                  <div className="space-y-3">
                    {jobs.filter(j => j.type === "Project").filter(j => {
                      const matchesSearch = !reportSearch || [j.title, j.assetName, j.client, j.projectNo, j.contractNo, j.projectManager].some(val => val?.toLowerCase().includes(reportSearch.toLowerCase()));
                      const matchesPriority = reportPriority === "All" || j.priority === reportPriority;
                      const matchesStatus = reportStatus === "All" || j.status === reportStatus;
                      return matchesSearch && matchesPriority && matchesStatus;
                    }).length > 0 ? (
                      jobs.filter(j => j.type === "Project").filter(j => {
                        const matchesSearch = !reportSearch || [j.title, j.assetName, j.client, j.projectNo, j.contractNo, j.projectManager].some(val => val?.toLowerCase().includes(reportSearch.toLowerCase()));
                        const matchesPriority = reportPriority === "All" || j.priority === reportPriority;
                        const matchesStatus = reportStatus === "All" || j.status === reportStatus;
                        return matchesSearch && matchesPriority && matchesStatus;
                      }).map((job) => (
                        <div key={job.id} className="p-4 rounded-xl bg-gray-950/20 border border-gray-900/60 flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                {job.projectNo || "PROJ-N/A"} / {job.contractNo || "CTR-N/A"}
                              </span>
                              <span className="text-xs text-gray-500 font-semibold">•</span>
                              <span className="text-xs text-gray-400 font-mono">{job.startDate} to {job.endDate}</span>
                            </div>
                            <h4 className="text-white font-bold text-sm">{job.title}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-1.5 gap-x-4 text-xs text-gray-400">
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">Client / Org:</span> <span className="text-gray-300 font-semibold">{job.client || "Unspecified"}</span></div>
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">Project Manager:</span> <span className="text-gray-300">{job.projectManager || "Unspecified"}</span></div>
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">Current Phase:</span> <span className="text-amber-500 font-semibold">{job.phase || "Unspecified"}</span></div>
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">Budgeted Hours:</span> <span className="text-amber-500 font-bold">{job.budgetHours || 0} Man-Hrs</span></div>
                            </div>
                            {job.scope && (
                              <p className="text-[11px] text-gray-500 bg-[#161513] p-2.5 rounded-lg border border-gray-900 leading-relaxed mt-1">
                                <strong className="text-gray-400 font-mono uppercase tracking-wider text-[9px] block mb-0.5">Project Scope Parameters:</strong>
                                {job.scope}
                              </p>
                            )}
                            {job.notes && (
                              <p className="text-[11px] text-gray-500 italic mt-1 pl-1">
                                Remarks: "{job.notes}"
                              </p>
                            )}
                          </div>
                          <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center shrink-0 gap-2">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              job.status === "Planned" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                              job.status === "In Progress" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              job.status === "On Hold" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                              job.status === "Completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                              "bg-gray-800 text-gray-400 border border-gray-700"
                            }`}>
                              {job.status}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              job.priority === "High" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              job.priority === "Medium" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                              "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {job.priority} Priority
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-600 italic font-mono pl-2">No Major Project jobs matching current filters.</p>
                    )}
                  </div>
                </section>

                {/* SEGREGATION 3: On-Demand Urgent Corrective Repairs */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-800/80">
                    <Zap size={16} className="text-red-400" />
                    <h3 className="text-sm font-bold uppercase text-red-400 tracking-wider font-mono">
                      III. On-Demand & Urgent Corrective Repairs
                    </h3>
                    <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full font-bold ml-auto font-mono">
                      {jobs.filter(j => j.type === "OnDemand").length} Total
                    </span>
                  </div>

                  <div className="space-y-3">
                    {jobs.filter(j => j.type === "OnDemand").filter(j => {
                      const matchesSearch = !reportSearch || [j.title, j.assetName, j.siteLocation, j.onDemandType, j.technician].some(val => val?.toLowerCase().includes(reportSearch.toLowerCase()));
                      const matchesPriority = reportPriority === "All" || j.priority === reportPriority;
                      const matchesStatus = reportStatus === "All" || j.status === reportStatus;
                      return matchesSearch && matchesPriority && matchesStatus;
                    }).length > 0 ? (
                      jobs.filter(j => j.type === "OnDemand").filter(j => {
                        const matchesSearch = !reportSearch || [j.title, j.assetName, j.siteLocation, j.onDemandType, j.technician].some(val => val?.toLowerCase().includes(reportSearch.toLowerCase()));
                        const matchesPriority = reportPriority === "All" || j.priority === reportPriority;
                        const matchesStatus = reportStatus === "All" || j.status === reportStatus;
                        return matchesSearch && matchesPriority && matchesStatus;
                      }).map((job) => (
                        <div key={job.id} className="p-4 rounded-xl bg-gray-950/20 border border-gray-900/60 flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
                                {job.emergencyLevel || "High"} Emergency
                              </span>
                              <span className="text-xs text-gray-500 font-semibold">•</span>
                              <span className="text-xs text-gray-400 font-mono">{job.startDate} to {job.endDate}</span>
                            </div>
                            <h4 className="text-white font-bold text-sm">{job.title}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-1.5 gap-x-4 text-xs text-gray-400">
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">Target Asset:</span> <span className="text-gray-300 font-semibold">{job.assetName || "Unassigned"}</span></div>
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">Site Location:</span> <span className="text-gray-300">{job.siteLocation || "Unassigned"}</span></div>
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">Repair Type:</span> <span className="text-gray-300">{job.onDemandType || "N/A"}</span></div>
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">Responder Tech:</span> <span className="text-gray-300">{job.technician || "Unassigned"}</span></div>
                            </div>
                            {job.scope && (
                              <p className="text-[11px] text-gray-500 bg-[#161513] p-2.5 rounded-lg border border-gray-900 leading-relaxed mt-1">
                                <strong className="text-gray-400 font-mono uppercase tracking-wider text-[9px] block mb-0.5">Urgent Scope Parameters:</strong>
                                {job.scope}
                              </p>
                            )}
                            {job.notes && (
                              <p className="text-[11px] text-gray-500 italic mt-1 pl-1">
                                Remarks: "{job.notes}"
                              </p>
                            )}
                          </div>
                          <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center shrink-0 gap-2">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              job.status === "Planned" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                              job.status === "In Progress" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              job.status === "On Hold" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                              job.status === "Completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                              "bg-gray-800 text-gray-400 border border-gray-700"
                            }`}>
                              {job.status}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              job.priority === "High" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              job.priority === "Medium" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                              "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {job.priority} Priority
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-600 italic font-mono pl-2">No On-Demand emergency jobs matching current filters.</p>
                    )}
                  </div>
                </section>

                {/* SEGREGATION 4: Routine Running Maintenance Tasks */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-800/80">
                    <Clock size={16} className="text-amber-400" />
                    <h3 className="text-sm font-bold uppercase text-amber-400 tracking-wider font-mono">
                      IV. Routine Running Maintenance Tasks
                    </h3>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold ml-auto font-mono">
                      {jobs.filter(j => j.type === "Running").length} Total
                    </span>
                  </div>

                  <div className="space-y-3">
                    {jobs.filter(j => j.type === "Running").filter(j => {
                      const matchesSearch = !reportSearch || [j.title, j.assetName, j.siteLocation, j.foreman].some(val => val?.toLowerCase().includes(reportSearch.toLowerCase()));
                      const matchesPriority = reportPriority === "All" || j.priority === reportPriority;
                      const matchesStatus = reportStatus === "All" || j.status === reportStatus;
                      return matchesSearch && matchesPriority && matchesStatus;
                    }).length > 0 ? (
                      jobs.filter(j => j.type === "Running").filter(j => {
                        const matchesSearch = !reportSearch || [j.title, j.assetName, j.siteLocation, j.foreman].some(val => val?.toLowerCase().includes(reportSearch.toLowerCase()));
                        const matchesPriority = reportPriority === "All" || j.priority === reportPriority;
                        const matchesStatus = reportStatus === "All" || j.status === reportStatus;
                        return matchesSearch && matchesPriority && matchesStatus;
                      }).map((job) => (
                        <div key={job.id} className="p-4 rounded-xl bg-gray-950/20 border border-gray-900/60 flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                RUNNING TASK
                              </span>
                              <span className="text-xs text-gray-500 font-semibold">•</span>
                              <span className="text-xs text-gray-400 font-mono">{job.startDate} to {job.endDate}</span>
                            </div>
                            <h4 className="text-white font-bold text-sm">{job.title}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-1.5 gap-x-4 text-xs text-gray-400">
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">Target Asset:</span> <span className="text-gray-300 font-semibold">{job.assetName || "General"}</span></div>
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">Site Location:</span> <span className="text-gray-300">{job.siteLocation || "General"}</span></div>
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">Project Ref:</span> <span className="text-gray-300">{job.projectRef || "N/A"}</span></div>
                              <div><span className="text-gray-600 font-mono uppercase tracking-wider text-[10px] font-bold">Crew/Foreman:</span> <span className="text-gray-300">{job.foreman || "Unassigned"} ({job.crewSize || 0} crew)</span></div>
                            </div>
                            {job.scope && (
                              <p className="text-[11px] text-gray-500 bg-[#161513] p-2.5 rounded-lg border border-gray-900 leading-relaxed mt-1">
                                <strong className="text-gray-400 font-mono uppercase tracking-wider text-[9px] block mb-0.5">Running Work Scope:</strong>
                                {job.scope}
                              </p>
                            )}
                            {job.notes && (
                              <p className="text-[11px] text-gray-500 italic mt-1 pl-1">
                                Remarks: "{job.notes}"
                              </p>
                            )}
                          </div>
                          <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center shrink-0 gap-2">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              job.status === "Planned" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                              job.status === "In Progress" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              job.status === "On Hold" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                              job.status === "Completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                              "bg-gray-800 text-gray-400 border border-gray-700"
                            }`}>
                              {job.status}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              job.priority === "High" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              job.priority === "Medium" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                              "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {job.priority} Priority
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-600 italic font-mono pl-2">No Routine Running maintenance jobs matching current filters.</p>
                    )}
                  </div>
                </section>

              </div>

              {/* Modal Footer */}
              <footer className="p-4 border-t border-gray-800 bg-[#161412] flex items-center justify-between text-[10px] text-gray-500 font-mono uppercase tracking-widest shrink-0">
                <span>SmartGen CoatLogix Integrity Matrix</span>
                <span>Report Generated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </footer>

            </div>
          </div>
        )}

        {/* Tabs */}
        {initialTab !== "Project Jobs" && initialTab !== "In Progress Jobs" && (
          <nav className="flex gap-8 border-b border-gray-800 pb-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 pb-3 border-b-2 font-bold text-sm transition shrink-0 ${
                  activeTab === tab.name 
                    ? "border-amber-500 text-amber-500 font-bold" 
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.name ? "bg-amber-500/20 text-amber-400" : "bg-gray-800 text-gray-400"
                }`}>
                  {tab.name === "Calendar" 
                    ? jobs.length 
                    : jobs.filter(j => j.type === tab.type).length}
                </span>
              </button>
            ))}
          </nav>
        )}

        {/* Status Dashboard Overview */}
        {initialTab !== "In Progress Jobs" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-[#1f1d1b] border border-gray-800/80 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.name}</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-black text-white">{stat.count}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${stat.color}`}>
                    Live
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List Item container or Calendar */}
        {activeTab === "Calendar" && initialTab !== "In Progress Jobs" ? (
          <div className="space-y-6">
            {/* Calendar Widget Card */}
            <div className="bg-[#1f1d1b] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Calendar Control Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                    <CalendarDays size={20} />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      {monthNames[navDate.getMonth()]} {navDate.getFullYear()}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Click a cell to show jobs for that specific day.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 border border-gray-850 rounded-lg transition"
                    title="Previous Month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleResetToToday}
                    className="px-3 py-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 rounded-lg transition"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 border border-gray-850 rounded-lg transition"
                    title="Next Month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Legends */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs border-t border-gray-800/60 pt-4 text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>PM Maintenance Jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>On Demand / Emergency Jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Major Project Phases</span>
                </div>
                <div className="ml-auto text-[10px] text-gray-500 font-mono">
                  Today's Simulation: 2026-07-02
                </div>
              </div>

              {/* Grid week names header */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Grid cells */}
              <div className="grid grid-cols-7 gap-1.5 md:gap-2.5">
                {calendarDays.map((cell, idx) => {
                  const cellJobs = getJobsForDate(cell.dateStr);
                  const isSelected = cell.dateStr === selectedDateStr;
                  const isToday = cell.dateStr === "2026-07-02";

                  return (
                    <div
                      key={`${cell.dateStr}-${idx}`}
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      className={`min-h-[85px] md:min-h-[105px] p-2 rounded-xl flex flex-col justify-between transition cursor-pointer select-none border ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/5"
                          : isToday
                          ? "bg-amber-500/5 border-amber-500/40 hover:border-gray-700"
                          : "bg-gray-900/40 border-gray-800/80 hover:border-gray-750"
                      }`}
                    >
                      {/* Cell header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold font-mono ${
                            cell.isCurrentMonth
                              ? isToday
                                ? "text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded"
                                : isSelected
                                ? "text-amber-400"
                                : "text-gray-300"
                              : "text-gray-600"
                          }`}
                        >
                          {cell.dayNum}
                        </span>
                        {isToday && (
                          <span className="hidden sm:inline-block text-[8px] bg-amber-500/20 text-amber-400 font-extrabold px-1 rounded uppercase tracking-wider font-mono">
                            Today
                          </span>
                        )}
                      </div>

                      {/* Job Pills inside Cell */}
                      <div className="mt-1 space-y-1 flex-1 overflow-hidden flex flex-col justify-end">
                        {cellJobs.slice(0, 3).map(job => (
                          <div
                            key={job.id}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate border text-left ${
                              job.type === "PM"
                                ? "bg-blue-950/40 border-blue-900/40 text-blue-400"
                                : job.type === "Running"
                                ? "bg-amber-950/40 border-amber-900/40 text-amber-400"
                                : job.type === "Project"
                                ? "bg-purple-950/40 border-purple-900/40 text-purple-400"
                                : "bg-red-950/40 border-red-900/40 text-red-400"
                            }`}
                            title={job.title}
                          >
                            {job.title}
                          </div>
                        ))}
                        {cellJobs.length > 3 && (
                          <div className="text-[8px] font-bold text-gray-500 text-right px-1 font-mono">
                            +{cellJobs.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Jobs Drawer below the calendar */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                    <Clock size={16} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Jobs on {new Date(selectedDateStr + "T00:00:00").toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Showing all scheduled maintenance, inspection or site operations active on this date.
                    </p>
                  </div>
                </div>

                {/* Direct quick adds */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingJob({
                        id: `job-pm-${Date.now()}`,
                        title: "",
                        type: "PM",
                        status: "Planned",
                        priority: "Medium",
                        startDate: selectedDateStr,
                        endDate: selectedDateStr,
                        assetName: "",
                        workOrderNo: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                        pmType: "Routine Inspection",
                        frequency: "Monthly",
                        technician: "",
                        scope: "",
                        notes: ""
                      });
                      setModalType("PM");
                    }}
                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg transition border border-blue-500/20 cursor-pointer"
                  >
                    + Add PM Job
                  </button>
                  <button
                    onClick={() => {
                      setEditingJob({
                        id: `job-ondemand-${Date.now()}`,
                        title: "",
                        type: "OnDemand",
                        status: "Planned",
                        priority: "High",
                        startDate: selectedDateStr,
                        endDate: selectedDateStr,
                        assetName: "",
                        siteLocation: "",
                        onDemandType: "Unscheduled Repair",
                        emergencyLevel: "High",
                        technician: "",
                        scope: "",
                        notes: ""
                      });
                      setModalType("OnDemand");
                    }}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg transition border border-red-500/20 cursor-pointer"
                  >
                    + Add On Demand Job
                  </button>
                  <button
                    onClick={() => {
                      setEditingJob({
                        id: `job-proj-${Date.now()}`,
                        title: "",
                        type: "Project",
                        status: "Planned",
                        priority: "High",
                        startDate: selectedDateStr,
                        endDate: selectedDateStr,
                        projectNo: `PROJ-2026-${Math.floor(100 + Math.random() * 900)}`,
                        contractNo: `CTR-2026-${Math.floor(10 + Math.random() * 90)}`,
                        client: "",
                        projectManager: "",
                        phase: "Engineering",
                        budgetHours: 200,
                        scope: "",
                        notes: ""
                      });
                      setModalType("Project");
                    }}
                    className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold rounded-lg transition border border-purple-500/20 cursor-pointer"
                  >
                    + Add Project Job
                  </button>
                  {/* OnDemand Jobs button removed and separated */}
                </div>
              </div>

              {/* Render jobs for the selected date */}
              <div className="space-y-4">
                {calendarSelectedJobs.length > 0 ? (
                  calendarSelectedJobs.map((job) => renderJobCard(job))
                ) : (
                  <div className="bg-[#1f1d1b]/60 border border-dashed border-gray-800 rounded-2xl p-12 text-center text-gray-500">
                    <CalendarDays className="mx-auto text-gray-700 mb-3" size={32} />
                    <p className="text-sm font-semibold">No active jobs scheduled on this date.</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Choose another date in the calendar, or click one of the buttons above to create a job for this day.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Standard Tabs (PM, Running, Project) */
          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => renderJobCard(job))
            ) : (
              <div className="bg-[#1f1d1b] border border-dashed border-gray-800 rounded-2xl p-12 text-center text-gray-500">
                <PlayCircle className="mx-auto text-amber-500/30 mb-3 animate-pulse" size={36} />
                <p className="text-sm font-semibold">No jobs are currently in progress.</p>
                <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto">
                  To set a job in progress, open the general Job Planner, select a scheduled PM, Project, or On-Demand job, and update its status to "In Progress".
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-sm bg-[#1a1c23] border border-gray-800 rounded-2xl p-6 shadow-2xl z-10 flex flex-col gap-4 text-gray-300">
            <h3 className="text-lg font-bold text-white tracking-tight">Delete Job?</h3>
            <p className="text-xs text-gray-400">
              Are you sure you want to delete this job planner entry? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteJob}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
