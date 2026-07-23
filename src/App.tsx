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
import AntiqueLandingPage from "./components/AntiqueLandingPage";
import { Terminal, AlertCircle, ArrowLeft } from "lucide-react";

export default function App() {
  const [activePage, setActivePage] = useState<string>("Dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("coatlogix_auth") === "true";
  });

  const handleLogin = () => {
    localStorage.setItem("coatlogix_auth", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("coatlogix_auth");
    setIsAuthenticated(false);
    setActivePage("Dashboard");
  };

  // Render proper page view based on active tab
  const renderContent = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard setActivePage={setActivePage} />;
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
      {/* Global Minimalist Header replacing old NAVIGATION bar and mobile headers */}
      <MinimalistHeader activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} />

      {/* Main Content Pane */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {renderContent()}
      </div>
    </div>
  );
}

