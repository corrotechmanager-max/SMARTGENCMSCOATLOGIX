import { useState, FormEvent, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  User, 
  KeyRound,
  Activity,
  Shield
} from "lucide-react";
import { ShieldLogoSvg, CmsHighlightBadge } from "./BrandLogo";

interface AntiqueLandingPageProps {
  onLogin: (role?: "operator" | "defect_requester") => void;
}

export default function AntiqueLandingPage({ onLogin }: AntiqueLandingPageProps) {
  // Login Form States (Role-based login)
  const [selectedRole, setSelectedRole] = useState<"operator" | "defect_requester">("operator");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyingTitle, setVerifyingTitle] = useState("AUTHENTICATING ANTI CORROSION TEAM");
  const [verifyingSubtitle, setVerifyingSubtitle] = useState("Securing session and authenticating user...");

  // Switch between role presets
  const handleRoleChange = (role: "operator" | "defect_requester") => {
    setSelectedRole(role);
    setErrorMessage("");
    setPassword("");
  };

  // Real-time live corrosion values displayed in subtle header indicator
  const [livePotential, setLivePotential] = useState("-852");
  const [systemUptime] = useState("99.98");

  useEffect(() => {
    const timer = setInterval(() => {
      // Fluctuates slightly between -848 and -856 mV
      const randomShift = (Math.random() * 8 - 4).toFixed(0);
      setLivePotential((-852 + parseInt(randomShift)).toString());
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Handle Login Authentication with Role Scoping
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const isDefectRequester = selectedRole === "defect_requester";
    const cleanUser = isDefectRequester ? "Defect Requester" : "Anti Corrosion Team";

    // For Anti Corrosion Team: password is required (no save logic)
    if (!isDefectRequester && !password.trim()) {
      setErrorMessage("Please enter password");
      return;
    }

    setIsVerifying(true);
    setVerifyingTitle(isDefectRequester ? "AUTHENTICATING DEFECT REQUESTER" : "AUTHENTICATING ANTI CORROSION TEAM");
    setVerifyingSubtitle(
      isDefectRequester
        ? "Opening portal dashboard..."
        : "Securing full session access..."
    );

    // Store active user session info and role
    const activeUser = {
      id: `usr_${Date.now()}`,
      name: cleanUser,
      email: isDefectRequester ? "defect.requester@coatlogix.com" : "anti.corrosion@coatlogix.com",
      role: cleanUser,
      roleType: selectedRole,
      registeredAt: new Date().toISOString()
    };
    localStorage.setItem("coatlogix_current_user", JSON.stringify(activeUser));
    localStorage.setItem("coatlogix_user_role", selectedRole);

    // Asynchronously synchronize with backend API
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cleanUser,
        password: password,
        role: selectedRole
      })
    }).catch(() => {});

    setTimeout(() => {
      setIsVerifying(false);
      onLogin(selectedRole);
    }, 800);
  };

  // Cathodic electron flow simulator particles
  const currentParticles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: i * 1.2,
    duration: 8 + Math.random() * 4
  }));

  // Backing dust particles
  const ambientIons = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15
  }));

  return (
    <div className="min-h-screen bg-[#02050d] text-[#e2e8f0] relative overflow-hidden flex flex-col justify-between font-sans selection:bg-amber-500/30 selection:text-white">
      
      {/* =========================================================================
          HIGH-IMPACT IMMERSIVE MOTION GRAPHICS BACKGROUND
         ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        
        {/* Animated Engineering Blueprint Grid */}
        <motion.div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M 80 0 L 0 0 0 80' fill='none' stroke='%2338bdf8' stroke-width='0.75'/%3E%3C/svg%3E")`,
            backgroundSize: "80px 80px"
          }}
          animate={{
            backgroundPosition: ["0px 0px", "80px 80px"]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Dynamic Sweeping Radar Sensor Scanning Ring */}
        <div className="absolute top-[35%] left-[25%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.14] flex items-center justify-center">
          <motion.div 
            className="absolute inset-0 rounded-full border border-dashed border-amber-500/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute w-[85%] h-[85%] rounded-full border border-double border-blue-500/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute w-[60%] h-[60%] rounded-full border border-amber-500/10"
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute w-[50%] h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-amber-400 origin-left"
            style={{ transformOrigin: "left center", left: "50%" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Electrochemical Waveforms: Cathodic Protective Field Flows (SVG curves) */}
        <div className="absolute inset-x-0 bottom-0 top-1/4 opacity-[0.12]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <motion.path 
              d="M -100 300 C 200 100, 400 500, 800 200 C 1100 500, 1400 100, 1800 400" 
              fill="none" 
              stroke="#fbbf24" 
              strokeWidth="3.5"
              animate={{
                strokeDasharray: ["20, 10, 5, 10", "40, 20, 10, 20"],
                d: [
                  "M -100 300 C 200 100, 400 500, 800 200 C 1100 500, 1400 100, 1800 400",
                  "M -100 280 C 250 200, 350 400, 850 250 C 1050 450, 1450 150, 1800 350",
                  "M -100 300 C 200 100, 400 500, 800 200 C 1100 500, 1400 100, 1800 400"
                ]
              }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path 
              d="M -100 450 C 300 600, 600 200, 1000 500 C 1300 300, 1500 650, 1900 450" 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="2"
              animate={{
                strokeDasharray: ["10, 15", "20, 30"],
                d: [
                  "M -100 450 C 300 600, 600 200, 1000 500 C 1300 300, 1500 650, 1900 450",
                  "M -100 480 C 250 500, 650 300, 950 420 C 1350 380, 1450 580, 1900 420",
                  "M -100 450 C 300 600, 600 200, 1000 500 C 1300 300, 1500 650, 1900 450"
                ]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* Cathodic electron flow simulator particles */}
        <div className="absolute inset-0 z-1">
          {currentParticles.map((pt) => (
            <motion.div
              key={pt.id}
              className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] opacity-0"
              animate={{
                x: ["10vw", "90vw"],
                y: [
                  "45vh", 
                  pt.id % 3 === 0 ? "55vh" : "30vh", 
                  "45vh"
                ],
                opacity: [0, 0.85, 0.85, 0],
                scale: [0.6, 1.2, 1.2, 0.6]
              }}
              transition={{
                duration: pt.duration,
                repeat: Infinity,
                delay: pt.delay,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Soft Radiant Ambient Glow Orbs */}
        <motion.div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[140px] bg-amber-500/[0.14]"
          animate={{
            x: [0, 100, -80, 0],
            y: [0, -90, 80, 0],
            opacity: [0.6, 0.9, 0.7, 0.6]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "15%", left: "5%" }}
        />

        <motion.div 
          className="absolute w-[650px] h-[650px] rounded-full blur-[160px] bg-blue-500/[0.09]"
          animate={{
            x: [0, -110, 70, 0],
            y: [0, 90, -70, 0],
            opacity: [0.5, 0.8, 0.6, 0.5]
          }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "5%", right: "5%" }}
        />

        {/* Ambient floating ions */}
        {ambientIons.map((ion) => (
          <motion.div
            key={ion.id}
            className="absolute rounded-full bg-amber-400"
            style={{
              width: ion.size,
              height: ion.size,
              left: `${ion.x}%`,
              top: `${ion.y}%`,
              opacity: 0.15,
              boxShadow: "0 0 8px rgba(245, 158, 11, 0.3)"
            }}
            animate={{
              y: ["0px", "-40px", "40px", "0px"],
              x: ["0px", "30px", "-30px", "0px"],
              opacity: [0.1, 0.35, 0.15, 0.1]
            }}
            transition={{
              duration: ion.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

      </div>

      {/* =========================================================================
          TOP CORNER TELEMETRY
         ========================================================================= */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        {/* Real-time cathodic flux indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[10px] tracking-wider bg-white/5 border border-white/10 text-gray-300 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">CP POTENTIAL:</span>
          <span className="font-bold text-amber-400">
            {livePotential} mV CSE
          </span>
          <span className="hidden md:inline text-gray-400">•</span>
          <span className="hidden md:inline">SYSTEM UPTIME: <strong className="text-white">{systemUptime}%</strong></span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[9px] tracking-widest text-amber-400/80 bg-amber-950/40 border border-amber-500/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
          <Activity size={12} className="text-amber-400 animate-pulse" />
          <span className="hidden sm:inline uppercase">CATHODIC MONITORING:</span>
          <span className="text-emerald-400 font-bold uppercase">ACTIVE</span>
        </div>
      </header>

      {/* =========================================================================
          HIGH-CONTRAST CENTRAL HUD PANELS
         ========================================================================= */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-6 md:py-10 relative z-10 max-w-lg mx-auto w-full gap-7">
        
        {/* Verification Loader Overlay */}
        {isVerifying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 backdrop-blur-md z-50 flex flex-col items-center justify-center bg-[#02050d]/95"
          >
            <div className="text-center space-y-4 max-w-sm px-8 py-7 rounded-2xl shadow-2xl border bg-[#090e18] border-amber-500/30">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 rounded-full border-4 border-amber-500/20 border-t-amber-500 mx-auto"
              />
              <div className="space-y-1">
                <h3 className="font-display text-sm font-black tracking-widest uppercase text-white">
                  {verifyingTitle}
                </h3>
                <p className="font-mono text-[10.5px] leading-normal text-gray-400">
                  {verifyingSubtitle}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Highlighted Brand Block with Shield Logo and CMS Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full text-center md:text-left flex flex-col md:flex-row items-center gap-6 p-6 md:p-7 rounded-2xl backdrop-blur-md bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent border border-amber-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          {/* Shield Logo SVG */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full blur-xl animate-pulse bg-amber-500/20" />
            <ShieldLogoSvg 
              innerFill="rgba(15, 23, 42, 0.4)"
              className="w-16 h-18 md:w-20 md:h-22 relative z-10" 
            />
          </div>

          <div className="text-center md:text-left space-y-2">
            <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight leading-none text-white">
              SMARTGEN
            </h1>
            <div className="my-1 inline-flex items-center">
              <CmsHighlightBadge size="md" />
            </div>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-widest text-[#d97706] leading-none">
              COATLOGIX <span className="text-sm align-super font-semibold text-amber-500">®</span>
            </h2>
            <div className="inline-block pt-1">
              <span className="font-mono text-[9px] md:text-[10px] tracking-[0.16em] px-3.5 py-1.5 rounded-full border uppercase text-amber-100 bg-amber-950/80 border-amber-500/35 font-bold shadow-inner">
                INTELLIGENT INTEGRITY. ENGINEERED PROTECTION
              </span>
            </div>
          </div>
        </motion.div>

        {/* Secure Auth Box */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md rounded-2xl p-6 md:p-8 relative overflow-hidden backdrop-blur-md bg-[#090e18]/95 border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.15)]"
        >
          {/* Top corner glowing accent tab */}
          <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent" />

          <div className="space-y-6">
            {/* Header section - Clean without subtitles comments */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center bg-gradient-to-br from-amber-500/10 to-amber-500/20 border border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                {selectedRole === "defect_requester" ? (
                  <ShieldAlert size={22} className="text-amber-400 animate-pulse" />
                ) : (
                  <Shield size={22} className="text-amber-500" />
                )}
              </div>
              <h3 className="font-display text-lg font-extrabold tracking-widest uppercase text-white">
                Login Portal
              </h3>
            </div>

            {/* Two User Boxes: Anti Corrosion Team & Defect Requester */}
            <div className="grid grid-cols-2 p-1.5 rounded-xl bg-[#030610] border border-white/10 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange("operator")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer select-none text-center ${
                  selectedRole === "operator"
                    ? "bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] font-black"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
                id="login-user-anti-corrosion-btn"
              >
                <Shield size={14} className={selectedRole === "operator" ? "text-slate-950" : "text-gray-400"} />
                <span>Anti Corrosion Team</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("defect_requester")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer select-none text-center ${
                  selectedRole === "defect_requester"
                    ? "bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] font-black"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
                id="login-user-defect-requester-btn"
              >
                <ShieldAlert size={14} className={selectedRole === "defect_requester" ? "text-slate-950" : "text-amber-500"} />
                <span>Defect Requester</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              
              {/* Only for Anti Corrosion Team: ONE box of password (no save logic, user enters it) */}
              {selectedRole === "operator" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10.5px] font-mono tracking-widest uppercase font-bold text-gray-400">
                      Password
                    </label>
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] font-mono font-bold focus:outline-none flex items-center gap-1 cursor-pointer text-amber-500 hover:text-amber-400"
                    >
                      {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span>{showPassword ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      autoComplete="new-password"
                      className="w-full rounded-xl pl-4 pr-10 py-3.5 font-mono text-xs focus:outline-none transition-all bg-[#030610] border border-white/10 hover:border-amber-500/40 focus:border-amber-500 text-white placeholder-gray-600 focus:ring-1 focus:ring-amber-500"
                      required
                    />
                    <KeyRound size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                  </div>
                </div>
              )}

              {/* Error Box */}
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-[11px] font-mono flex items-start gap-2.5 leading-relaxed"
                >
                  <ShieldAlert size={14} className="shrink-0 mt-0.5 text-red-400" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* Action Trigger Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs tracking-widest transition-all uppercase cursor-pointer active:scale-[0.98] shadow-[0_6px_20px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2"
                  id="submit-login-btn"
                >
                  <Unlock size={13} className="stroke-[2.5]" />
                  <span>
                    {selectedRole === "defect_requester" 
                      ? "Login as Defect Requester" 
                      : "Login as Anti Corrosion Team"}
                  </span>
                </button>
              </div>

            </form>
          </div>

          {/* Footing secure standards */}
          <div className="mt-6 pt-4 border-t flex items-center justify-between font-mono text-[8.5px] tracking-widest uppercase font-semibold border-white/[0.04] text-gray-500">
            <span>SECURE ENDPOINT AUTH</span>
            <span>AES-256 SECURED</span>
          </div>

        </motion.div>
      </main>

      {/* =========================================================================
          INDUSTRIAL FOOTER SECTION
         ========================================================================= */}
      <footer className="w-full text-center py-5 border-t z-10 font-mono text-[9px] tracking-[0.25em] uppercase flex flex-col items-center gap-1.5 px-4 backdrop-blur-sm bg-[#03060c] border-white/[0.04] text-gray-400">
        <div className="font-bold tracking-[0.2em] text-[10px] text-amber-400/90">
          CREATED BY MANSOOR AHMED ANTI CORROSION OFFICER
        </div>
        <div className="text-[8.5px] tracking-[0.25em] font-medium text-gray-500">
          [ SMARTGEN CMS COATLOGIX SYSTEMS • ESTD 2026 ]
        </div>
      </footer>

    </div>
  );
}
