import React, { useState } from "react";
import { CorrosionReport } from "../types";
import { 
  ShieldAlert, 
  Settings, 
  TrendingUp, 
  CheckSquare, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Award,
  Activity,
  Printer,
  Download
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from "recharts";

interface DiagnosticDashboardProps {
  report: CorrosionReport;
  onViewOfficial: () => void;
  onBack: () => void;
}

export default function DiagnosticDashboard({ report, onViewOfficial, onBack }: DiagnosticDashboardProps) {
  const [checklist, setChecklist] = useState<Record<number, boolean>>({});

  const toggleCheck = (idx: number) => {
    setChecklist(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Compute stats for charts
  const severityCounts = report.defects.reduce((acc, curr) => {
    acc[curr.severity] = (acc[curr.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(severityCounts).map(([name, value]) => ({
    name,
    Count: value,
  }));

  const pieData = report.defects.map((def, idx) => ({
    name: def.title_en,
    value: def.severity === "CRITICAL" ? 40 : def.severity === "HIGH" ? 30 : def.severity === "MEDIUM" ? 20 : 10,
    color: def.severity === "CRITICAL" ? "#ef4444" : def.severity === "HIGH" ? "#f97316" : def.severity === "MEDIUM" ? "#eab308" : "#10b981"
  }));

  const getSystemScore = () => {
    let rating = 100;
    report.defects.forEach(def => {
      if (def.severity === "CRITICAL") rating -= 25;
      else if (def.severity === "HIGH") rating -= 15;
      else if (def.severity === "MEDIUM") rating -= 8;
      else rating -= 3;
    });
    return Math.max(10, rating);
  };

  const score = getSystemScore();

  return (
    <div className="flex-grow p-6 md:p-8 bg-gray-950 overflow-y-auto space-y-8 select-text">
      
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest font-mono">
              NACE CIP Standard Analysis
            </span>
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest font-mono">
              Bilingual (EN/ZH)
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 leading-none">
            <Activity className="text-amber-500" size={24} />
            Diagnostic Dashboard
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Structural health overview for <strong className="text-gray-200">{report.metadata.assetName}</strong> • Tag: {report.metadata.tagNo}
          </p>
        </div>

        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={onBack}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold rounded-xl transition text-xs cursor-pointer"
          >
            Modify Inputs
          </button>
          <button
            onClick={onViewOfficial}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-amber-500/15 cursor-pointer"
          >
            <Download size={14} />
            View & Download PDF Report
          </button>
        </div>
      </div>

      {/* Simulation/Resilience Warning Banner */}
      {report.isSimulation && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex gap-3 text-amber-200">
          <AlertTriangle className="text-amber-500 stroke-[2] shrink-0 mt-0.5 animate-pulse" size={20} />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-400">Resilient Simulation Fallback Active</h4>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              {report.apiMessage || "The live AI modeling pipeline has experienced transient demand. Core Inspection Engine fallback remains completely active, outputting NACE-compliant report formats."}
            </p>
          </div>
        </div>
      )}

      {/* Grid of Summary Stats Cards (Bento) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Coating Integrity Score Card */}
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Asset Health Class</span>
            <Award className="text-amber-500" size={18} />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{score}%</div>
            <div className={`text-[10px] uppercase font-mono font-bold tracking-widest mt-1.5 ${score > 80 ? "text-emerald-400" : score > 50 ? "text-amber-400" : "text-red-500"}`}>
              {score > 80 ? "Class A - Safe" : score > 50 ? "Class B - Intermittent Rusting" : "Class C - Compromised"}
            </div>
          </div>
          {/* subtle decoration circle progress */}
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/5 rounded-full border border-amber-500/5" />
        </div>

        {/* Defects Spotted Card */}
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Defects Spotted</span>
            <ShieldAlert className="text-orange-500" size={18} />
          </div>
          <div className="mt-4">
            <div className="text-4xl font-black text-white">{report.defects.length}</div>
            <p className="text-xs text-gray-400 mt-1">Active coating failure anomalies</p>
          </div>
        </div>

        {/* Priority Level Card */}
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Priority Ranking</span>
            <AlertTriangle className="text-red-500" size={18} />
          </div>
          <div className="mt-4">
            <span className="px-3 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-black uppercase tracking-widest">
              {report.metadata.priority}
            </span>
            <p className="text-xs text-gray-400 mt-2.5">Schedule repairs accordingly</p>
          </div>
        </div>

        {/* Standard Verification Cert */}
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Verification Method</span>
            <Settings className="text-teal-400" size={18} />
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-200 font-mono tracking-tight font-semibold">ISO 12944 Paint System</div>
            <p className="text-[10px] text-gray-400 leading-normal mt-1.5">
              Formulated to match C4 / C5 high durability specifications.
            </p>
          </div>
        </div>

      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Severity counts bar chart */}
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <TrendingUp size={16} className="text-amber-500" />
            Anomaly Severity Breakdown
          </h3>
          <div className="h-64 font-mono text-xs">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="name" stroke="#888888" tickLine={false} />
                  <YAxis stroke="#888888" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#171717", borderColor: "#3f3f46" }} 
                    itemStyle={{ color: "#ffffff" }}
                  />
                  <Bar dataKey="Count" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No defect data located.</div>
            )}
          </div>
        </div>

        {/* Defect impact donut chart */}
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-6 flex flex-col">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Sparkles size={16} className="text-amber-500" />
            Under-film Oxide Expansion Impact Weight
          </h3>
          <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#171717", borderColor: "#3f3f46" }} 
                    itemStyle={{ color: "#ffffff" }}
                    formatter={(value, name) => [`${value}% Relative Loss`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs">
              {pieData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-gray-300 font-medium truncate max-w-[150px]">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Action procedures list and tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Rectification Checklist (Left Column) */}
        <div className="lg:col-span-8 bg-gray-900/40 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <CheckSquare className="text-amber-500" size={18} />
              Maintenance Execution Steps Checklist
            </h3>
            <p className="text-gray-400 text-xs mt-1">Track mechanical actions required for compliance</p>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Solvent Cleaning / Salt Washdown",
                detail: "High-pressure fresh water wash @ 3000 PSI to remove soluble sea salt contaminants (verify with Bresle patch).",
                std: "ISO 8501-1"
              },
              {
                title: "Dry Abrasive Grit Blasting to Sa 2½",
                detail: "Abrasive blast defective steel sections to Near-White Metal with profile height 50-75 microns.",
                std: "NACE No. 2 / SSPC-SP 10"
              },
              {
                title: "Apply Epoxy Zinc-Rich Stripe Coat",
                detail: "Manually brush-apply zinc-rich primers on edges, welds, and crevices to guarantee target film build.",
                std: "SSPC-PA 1"
              },
              {
                title: "Apply 2nd Stage High-Build Intermediate Epoxy",
                detail: "Apply intermediate epoxy coat @ 125-150 microns to form thick moisture barrier.",
                std: "ISO 12944"
              },
              {
                title: "Apply UV-Resistant Polyurethane Face Film",
                detail: "Complete final finish coat @ 50-75 microns for weathering resilience.",
                std: "ISO 12944-5"
              },
              {
                title: "Dry Film Thickness Gauge Verification",
                detail: "Measure nominal dry thickness using calibrated electromagnetic Type-2 gauge.",
                std: "ASTM D7091 / SSPC-PA 2"
              }
            ].map((step, idx) => {
              const isChecked = !!checklist[idx];
              return (
                <div 
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`p-4 border rounded-xl flex gap-3.5 items-start cursor-pointer transition ${
                    isChecked 
                      ? "bg-amber-500/5 border-amber-500/20 text-gray-300"
                      : "bg-white/[0.01] border-white/5 hover:border-white/10 text-gray-400"
                  }`}
                >
                  <button className="mt-0.5 shrink-0">
                    <CheckCircle 
                      size={18} 
                      className={isChecked ? "text-amber-500" : "text-gray-600"} 
                    />
                  </button>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-bold leading-none ${isChecked ? "text-amber-400" : "text-white"}`}>
                        {step.title}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-gray-500 font-extrabold">
                        {step.std}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-gray-400">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Timeline Tracker (Right Column) */}
        <div className="lg:col-span-4 bg-gray-900/40 border border-white/5 rounded-2xl p-6 space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Calendar className="text-amber-500" size={18} />
              Chronometer Timeline
            </h3>
            <p className="text-gray-400 text-xs mt-1">Recommended intervention milestones</p>
          </div>

          <div className="relative border-l-2 border-white/10 pl-5 ml-2.5 space-y-6 text-xs">
            
            {/* Immediate */}
            <div className="relative">
              {/* timeline dot */}
              <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-red-500 border-4 border-gray-950 shadow shadow-red-500/40" />
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold tracking-wider font-mono">
                  IMMEDIATE (0-30 DAYS)
                </span>
                <p className="text-gray-300 font-semibold">{report.recommendedTimeline.immediate_en}</p>
                <p className="text-gray-500 text-[10px] leading-relaxed">{report.recommendedTimeline.immediate_zh}</p>
              </div>
            </div>

            {/* Short Term */}
            <div className="relative">
              <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-orange-500 border-4 border-gray-950 shadow shadow-orange-500/40" />
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-bold tracking-wider font-mono">
                  SHORT TERM (1-3 MONTHS)
                </span>
                <p className="text-gray-300 font-semibold">{report.recommendedTimeline.short_en}</p>
                <p className="text-gray-500 text-[10px] leading-relaxed">{report.recommendedTimeline.short_zh}</p>
              </div>
            </div>

            {/* Long Term */}
            <div className="relative">
              <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-4 border-gray-950 shadow shadow-amber-500/40" />
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold tracking-wider font-mono">
                  LONG TERM (6-12 MONTHS)
                </span>
                <p className="text-gray-300 font-semibold">{report.recommendedTimeline.long_en}</p>
                <p className="text-gray-500 text-[10px] leading-relaxed">{report.recommendedTimeline.long_zh}</p>
              </div>
            </div>

            {/* Next Checkup */}
            <div className="relative">
              <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-4 border-gray-950 shadow shadow-emerald-500/40" />
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold tracking-wider font-mono">
                  NEXT FORMAL RE-CHECK
                </span>
                <p className="text-gray-200 font-semibold">{report.recommendedTimeline.next_en}</p>
                <p className="text-gray-500 text-[10px] leading-relaxed">{report.recommendedTimeline.next_zh}</p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
