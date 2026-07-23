import { X } from "lucide-react";
import * as React from "react";
import { useState, useEffect } from "react";
import { Job, Asset } from "../types";

interface JobModalProps {
  type: "PM" | "Running" | "Project" | "OnDemand";
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Job) => void;
  editingJob?: Job | null;
}

export default function JobModal({ type, isOpen, onClose, onSave, editingJob }: JobModalProps) {
  if (!isOpen) return null;

  const [assets, setAssets] = useState<Asset[]>([]);

  // Form states matching form screenshots
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [status, setStatus] = useState<"Planned" | "In Progress" | "On Hold" | "Completed" | "Overdue" | "Cancelled">("Planned");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // PM specific
  const [assetName, setAssetName] = useState("");
  const [workOrderNo, setWorkOrderNo] = useState("");
  const [pmType, setPmType] = useState("Routine Inspection");
  const [frequency, setFrequency] = useState("Quarterly");
  const [technician, setTechnician] = useState("");

  // Running specific
  const [siteLocation, setSiteLocation] = useState("");
  const [projectRef, setProjectRef] = useState("");
  const [foreman, setForeman] = useState("");
  const [crewSize, setCrewSize] = useState(1);
  const [safetyRequirements, setSafetyRequirements] = useState("");

  // Project specific
  const [projectNo, setProjectNo] = useState("");
  const [contractNo, setContractNo] = useState("");
  const [client, setClient] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [phase, setPhase] = useState("Tender");
  const [budgetHours, setBudgetHours] = useState(0);

  // OnDemand specific
  const [onDemandType, setOnDemandType] = useState("Unscheduled Repair");
  const [emergencyLevel, setEmergencyLevel] = useState("High");

  // Common descriptions / scope
  const [scope, setScope] = useState("");
  const [notes, setNotes] = useState("");

  // Load assets from localStorage for dynamic picking in PM Job Form
  useEffect(() => {
    const stored = localStorage.getItem("corrotech_assets");
    if (stored) {
      try {
        setAssets(JSON.parse(stored));
      } catch (e) {
        // Fallback
      }
    }
  }, []);

  // Pre-populate if editing
  useEffect(() => {
    if (editingJob) {
      setTitle(editingJob.title || "");
      setPriority(editingJob.priority || "Medium");
      setStatus(editingJob.status || "Planned");
      setStartDate(editingJob.startDate || "");
      setEndDate(editingJob.endDate || "");
      
      setAssetName(editingJob.assetName || "");
      setWorkOrderNo(editingJob.workOrderNo || "");
      setPmType(editingJob.pmType || "Routine Inspection");
      setFrequency(editingJob.frequency || "Quarterly");
      setTechnician(editingJob.technician || "");

      setSiteLocation(editingJob.siteLocation || "");
      setProjectRef(editingJob.projectRef || "");
      setForeman(editingJob.foreman || "");
      setCrewSize(editingJob.crewSize || 1);
      
      setProjectNo(editingJob.projectNo || "");
      setContractNo(editingJob.contractNo || "");
      setClient(editingJob.client || "");
      setProjectManager(editingJob.projectManager || "");
      setPhase(editingJob.phase || "Tender");
      setBudgetHours(editingJob.budgetHours || 0);

      setOnDemandType(editingJob.onDemandType || "Unscheduled Repair");
      setEmergencyLevel(editingJob.emergencyLevel || "High");

      setScope(editingJob.scope || "");
      setNotes(editingJob.notes || "");
    } else {
      // Default dates to today
      const todayStr = new Date().toISOString().split("T")[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
      setStatus(type === "Running" ? "In Progress" : "Planned");
      setTitle("");
      setPriority("Medium");
      setAssetName("");
      setWorkOrderNo("");
      setPmType("Routine Inspection");
      setFrequency("Quarterly");
      setTechnician("");
      setSiteLocation("");
      setProjectRef("");
      setForeman("");
      setCrewSize(1);
      setProjectNo("");
      setContractNo("");
      setClient("");
      setProjectManager("");
      setPhase("Tender");
      setBudgetHours(0);
      setOnDemandType("Unscheduled Repair");
      setEmergencyLevel("High");
      setScope("");
      setNotes("");
    }
  }, [editingJob, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const savedJob: Job = {
      id: editingJob ? editingJob.id : Date.now().toString(),
      title,
      type,
      status,
      priority,
      startDate,
      endDate,
      assetName,
      workOrderNo,
      pmType,
      frequency,
      technician,
      siteLocation,
      projectRef,
      foreman,
      crewSize,
      projectNo,
      contractNo,
      client,
      projectManager,
      phase,
      budgetHours,
      onDemandType,
      emergencyLevel,
      scope,
      notes,
    };

    onSave(savedJob);
    onClose();
  };

  const pmTypes = ["Routine Inspection", "Scheduled Maintenance", "Corrective Action", "Integrity Survey", "Other"];
  const frequencies = ["One-off", "Weekly", "Monthly", "Quarterly", "Semi-Annual", "Annual"];
  
  const renderPMFields = () => (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Job Title *</label>
        <input 
          type="text" 
          required 
          placeholder="e.g. Inspect Tank T-04 anode condition"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Asset / Equipment Name & ID</label>
          <select
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="">Select asset...</option>
            {assets.map((a) => (
              <option key={a.id} value={a.name}>{a.name} ({a.condition})</option>
            ))}
            <option value="General Maintenance">General Maintenance / Other</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Work Order No.</label>
          <input 
            type="text" 
            placeholder="e.g. WO-2026-0142"
            value={workOrderNo}
            onChange={(e) => setWorkOrderNo(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">PM Type</label>
          <select
            value={pmType}
            onChange={(e) => setPmType(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            {pmTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            {frequencies.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Scheduled Date *</label>
          <input 
            type="date" 
            required 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Due Date *</label>
          <input 
            type="date" 
            required 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Assigned Technician</label>
          <input 
            type="text" 
            placeholder="e.g. J. Rahman"
            value={technician}
            onChange={(e) => setTechnician(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="Planned">Planned</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
          <option value="Overdue">Overdue</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Scope / Notes</label>
        <textarea 
          rows={3} 
          placeholder="Scope of work, access requirements, special tools needed..."
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none"
        />
      </div>
    </div>
  );

  const renderRunningFields = () => (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Job Title *</label>
        <input 
          type="text" 
          required 
          placeholder="e.g. Blast & coat Pipeline Seg A — Tank Farm East"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Asset / Equipment Name & ID</label>
          <select
            value={assetName}
            onChange={(e) => {
              const val = e.target.value;
              setAssetName(val);
              const selectedAsset = assets.find(a => a.name === val);
              if (selectedAsset && !siteLocation) {
                setSiteLocation(selectedAsset.location);
              }
            }}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="">Select asset...</option>
            {assets.map((a) => (
              <option key={a.id} value={a.name}>{a.name} ({a.condition})</option>
            ))}
            <option value="General Maintenance">General Maintenance / Other</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Site / Location</label>
          <input 
            type="text" 
            placeholder="e.g. Tank Farm East, Bay 3"
            value={siteLocation}
            onChange={(e) => setSiteLocation(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Project Reference</label>
        <input 
          type="text" 
          placeholder="e.g. PROJ-2026-007"
          value={projectRef}
          onChange={(e) => setProjectRef(e.target.value)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Start Date *</label>
          <input 
            type="date" 
            required 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">End Date *</label>
          <input 
            type="date" 
            required 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Superintendent / Foreman</label>
          <input 
            type="text" 
            placeholder="e.g. K. Petrov"
            value={foreman}
            onChange={(e) => setForeman(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Crew Size</label>
          <input 
            type="number" 
            min={1}
            value={crewSize}
            onChange={(e) => setCrewSize(parseInt(e.target.value) || 1)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Work Description / Scope</label>
        <textarea 
          rows={3} 
          placeholder="Describe the work scope, surface prep standard, coating system, DFT requirements..."
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Safety / Access Requirements</label>
        <textarea 
          rows={2} 
          placeholder="Confined space, hot work permit, PPE requirements, scaffolding..."
          value={safetyRequirements}
          onChange={(e) => setSafetyRequirements(e.target.value)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none"
        />
      </div>
    </div>
  );

  const renderProjectFields = () => (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Job / Project Title *</label>
        <input 
          type="text" 
          required 
          placeholder="e.g. SPIC Annual Maintenance Contract 2026 — Phase 2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Asset / Equipment Name & ID</label>
          <select
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="">Select asset...</option>
            {assets.map((a) => (
              <option key={a.id} value={a.name}>{a.name} ({a.condition})</option>
            ))}
            <option value="General Maintenance">General Maintenance / Other</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Client</label>
          <input 
            type="text" 
            placeholder="e.g. SPIC Refinery"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Project No.</label>
          <input 
            type="text" 
            placeholder="e.g. PROJ-2026-012"
            value={projectNo}
            onChange={(e) => setProjectNo(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Contract No.</label>
          <input 
            type="text" 
            placeholder="e.g. CTR-SPIC-2026-04"
            value={contractNo}
            onChange={(e) => setContractNo(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Project Manager</label>
        <input 
          type="text" 
          placeholder="e.g. E. Kovich"
          value={projectManager}
          onChange={(e) => setProjectManager(e.target.value)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Start Date *</label>
          <input 
            type="date" 
            required 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">End Date *</label>
          <input 
            type="date" 
            required 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Phase</label>
          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="Tender">Tender</option>
            <option value="Engineering">Engineering</option>
            <option value="Procurement">Procurement</option>
            <option value="Construction">Construction</option>
            <option value="Commissioning">Commissioning</option>
            <option value="Closeout">Closeout</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Budget Hours</label>
        <input 
          type="number" 
          value={budgetHours}
          onChange={(e) => setBudgetHours(parseInt(e.target.value) || 0)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Scope of Work</label>
        <textarea 
          rows={3} 
          placeholder="Overall project scope, deliverables, standards (SSPC, NACE, BGAS-CSWIP)..."
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Notes / Remarks</label>
        <textarea 
          rows={2} 
          placeholder="Commercial terms, milestones, client contacts..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none"
        />
      </div>
    </div>
  );

  const onDemandTypes = ["Unscheduled Repair", "Emergency Inspection", "Ad-hoc Hotspot Treatment", "Client Request", "Other"];
  const emergencyLevels = ["Low", "Medium", "High", "Critical"];

  const renderOnDemandFields = () => (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Job Title *</label>
        <input 
          type="text" 
          required 
          placeholder="e.g. Urgent repair of blistered coating on Tank T-102"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Asset / Equipment Name & ID</label>
          <select
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="">Select asset...</option>
            {assets.map((a) => (
              <option key={a.id} value={a.name}>{a.name} ({a.condition})</option>
            ))}
            <option value="General Maintenance">General Maintenance / Other</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Site / Location</label>
          <input 
            type="text" 
            placeholder="e.g. Jetty Area, Column 14"
            value={siteLocation}
            onChange={(e) => setSiteLocation(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">On-Demand Type</label>
          <select
            value={onDemandType}
            onChange={(e) => setOnDemandType(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            {onDemandTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Emergency Level</label>
          <select
            value={emergencyLevel}
            onChange={(e) => setEmergencyLevel(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            {emergencyLevels.map((el) => (
              <option key={el} value={el}>{el}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Start Date *</label>
          <input 
            type="date" 
            required 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Due Date *</label>
          <input 
            type="date" 
            required 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Technician / Responder</label>
          <input 
            type="text" 
            placeholder="e.g. J. Rahman"
            value={technician}
            onChange={(e) => setTechnician(e.target.value)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Scope / Description of Issue</label>
        <textarea 
          rows={3} 
          placeholder="Describe the defect, blister sizes, required preparation, active corrosion indicators..."
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Remarks / Action Notes</label>
        <textarea 
          rows={2} 
          placeholder="Any extra comments, scaffolding/permits needed, customer feedback..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-[#171513] border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1f1d1b] border border-gray-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-1">
          {editingJob ? "Edit " + (type === "OnDemand" ? "On Demand" : type) + " Job" : "New " + (type === "OnDemand" ? "On Demand" : type) + " Job"}
        </h2>
        <p className="text-amber-500 text-xs mb-6 font-semibold">
          {type === "PM" ? "Preventive Maintenance" : type === "Running" ? "Active Field Work" : type === "Project" ? "Project-Linked Work" : "Emergency & Ad-hoc Operations"}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {type === "PM" && renderPMFields()}
          {type === "Running" && renderRunningFields()}
          {type === "Project" && renderProjectFields()}
          {type === "OnDemand" && renderOnDemandFields()}
          
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-bold py-3 rounded-xl text-sm transition border border-gray-800"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-3 rounded-xl text-sm transition active:scale-95 shadow-lg shadow-amber-500/10"
            >
              {editingJob ? "Save Changes" : "Add " + type + " Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
