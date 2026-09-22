/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import MinimalistHeader from "./components/MinimalistHeader";
import Dashboard from "./components/Dashboard";
import CalculatorPage from "./components/CalculatorPage";
import AIAnalysisPage from "./components/AIAnalysisPage";
import JobPlanner from "./components/JobPlanner";
import AssetsPage from "./components/AssetsPage";
import InventoryPage from "./components/InventoryPage";
import DefectLogPage from "./components/DefectLogPage";
import AntiqueLandingPage from "./components/AntiqueLandingPage";
import { Terminal, AlertCircle, ArrowLeft, ShieldAlert, Lock } from "lucide-react";

export default function App() {
  const [activePage, setActivePage] = useState<string>("Dashboard");
  const [userRole, setUserRole] = useState<"operator" | "defect_requester">(() => {
    return (localStorage.getItem("coatlogix_user_role") as "operator" | "defect_requester") || "operator";
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("coatlogix_auth") === "true";
  });

  const handleLogin = (role: "operator" | "defect_requester" = "operator") => {
    localStorage.setItem("coatlogix_auth", "true");
    localStorage.setItem("coatlogix_user_role", role);
    setUserRole(role);
    setIsAuthenticated(true);
    setActivePage("Dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("coatlogix_auth");
    localStorage.removeItem("coatlogix_user_role");
    localStorage.removeItem("coatlogix_current_user");
    setIsAuthenticated(false);
    setUserRole("operator");
    setActivePage("Dashboard");
  };

  // Render proper page view based on active tab and role permissions
  const renderContent = () => {
    const isDefectRequester = userRole === "defect_requester";

    // Enforcement: If Defect Requester attempts to navigate to any restricted module
    if (isDefectRequester && activePage !== "Defect Log" && activePage !== "Dashboard") {
      return (
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center bg-[#060913] overflow-y-auto">
          <div className="max-w-lg w-full bg-[#0d1322]/95 border-2 border-amber-500/40 backdrop-blur-md rounded-2xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <div className="w-16 h-16 bg-amber-500/15 border-2 border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Lock size={30} className="animate-pulse text-amber-400" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                <ShieldAlert size={12} />
                <span>ROLE PERMISSION LOCKED</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase font-display">
                {activePage} Access Restricted
              </h3>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed max-w-md mx-auto font-mono">
                You are currently signed in under the <strong>Defect Requester</strong> role. This engineering subsystem is locked and restricted to Authorized Operators.
              </p>
            </div>

            <div className="bg-black/50 rounded-xl p-4 text-xs font-mono text-left space-y-2 text-gray-400 border border-white/5">
              <div className="flex items-center justify-between text-amber-400 font-bold border-b border-white/5 pb-1.5">
                <span>SECURITY PROTOCOL</span>
                <span className="text-emerald-400">ENFORCED</span>
              </div>
              <p>• Active Role: <span className="text-amber-300 font-bold">Defect Requester</span></p>
              <p>• Permitted Module: <span className="text-emerald-400 font-bold">Defect Log</span></p>
              <p>• Target State: <span className="text-red-400 font-bold">{activePage} Locked</span></p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setActivePage("Defect Log")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                id="btn-goto-defect-log-locked"
              >
                <ShieldAlert size={15} className="stroke-[2.5]" />
                <span>Open Defect Log</span>
              </button>
              <button
                onClick={() => setActivePage("Dashboard")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs uppercase tracking-wider font-semibold active:scale-95 transition-all cursor-pointer font-mono"
              >
                <ArrowLeft size={15} />
                <span>Portal Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (activePage) {
      case "Dashboard":
        return <Dashboard setActivePage={setActivePage} userRole={userRole} />;
      case "Projects":
        return <JobPlanner initialTab="Project Jobs" />;
      case "In Progress Jobs":
        return <JobPlanner initialTab="In Progress Jobs" />;
      case "Calculator":
        return <CalculatorPage />;
      case "AI Analysis":
        return <AIAnalysisPage />;
      case "Job Planner":
        return <JobPlanner initialTab="PM Jobs" />;
      case "Assets":
        return <AssetsPage />;
      case "Inventory":
        return <InventoryPage />;
      case "Defect Log":
        return <DefectLogPage userRole={userRole} />;
      default:
        return (
          <div className="flex-1 p-6 md:p-8 flex items-center justify-center bg-[#060913] overflow-y-auto">
            <div className="max-w-md w-full bg-gray-900/40 border border-white/5 backdrop-blur-md rounded-2xl p-8 text-center space-y-6">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center mx-auto shadow-md">
                <AlertCircle size={24} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tight">{activePage} Module</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  This subsystem is scheduled for telemetry aggregation. Ultrasonic thickness gauges and acoustic monitoring links will stream live sensor arrays soon.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 text-xs font-mono text-left space-y-1 text-gray-400 border border-white/5">
                <div className="flex items-center gap-1.5 text-amber-500 font-semibold mb-1">
                  <Terminal size={12} />
                  <span>INTEGRATION LOG</span>
                </div>
                <p>Status: PENDING_HARDWARE_STREAMS</p>
                <p>Telemetry: API_READY_FOR_HOOKS</p>
                <p>Compliance: ISO-12944-V2</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setActivePage("Dashboard")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold max-sm:text-sm active:scale-95 transition-all cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  Back to Dashboard
                </button>
                <button
                  onClick={() => setActivePage("Calculator")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 max-sm:text-sm active:scale-95 transition-all text-sm font-medium"
                >
                  Try Calculators
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <AntiqueLandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#060913] text-white overflow-hidden font-sans">
      {/* Global Minimalist Header */}
      <MinimalistHeader 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={handleLogout}
        userRole={userRole}
      />

      {/* Main Content Pane */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {renderContent()}
      </div>
    </div>
  );
}

