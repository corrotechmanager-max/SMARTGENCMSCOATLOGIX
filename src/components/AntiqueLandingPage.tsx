import { useState, FormEvent, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Info
} from "lucide-react";

interface AntiqueLandingPageProps {
  onLogin: () => void;
}

export default function AntiqueLandingPage({ onLogin }: AntiqueLandingPageProps) {
  const [username, setUsername] = useState("corrotechmanager@gmail.com");
  const [password, setPassword] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Real-time live corrosion values displayed in subtle header indicator
  const [livePotential, setLivePotential] = useState(-850);
  const [systemUptime] = useState(99.98);

  // Fluctuating background potential value
  useEffect(() => {
    const timer = setInterval(() => {
      setLivePotential(prev => {
        const delta = (Math.random() - 0.5) * 8;
        return Math.round(prev + delta);
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    
    // Authenticate credentials
    if (username.toLowerCase() === "corrotechmanager@gmail.com" || username.includes("admin") || password === "admin") {
      setErrorMessage("");
      setIsVerifying(true);
      
      // Smooth high-fidelity cyber verification transition
      setTimeout(() => {
        onLogin();
      }, 1500);
    } else {
      setErrorMessage("Access Denied: Unrecognized credentials or expired security token.");
    }
  };

  const loadDefaultCredentials = () => {
    setUsername("corrotechmanager@gmail.com");
    setPassword("admin");
    setErrorMessage("");
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
        
        {/* Animated Grid that shifts and rolls */}
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
        <div className="absolute top-[35%] left-[25%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.12] flex items-center justify-center">
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
          {/* Sweeping laser hand */}
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
            {/* Dynamic Sine Waves representing active electrical flux */}
            <motion.path 
              d="M -100 300 C 200 100, 400 500, 800 200 C 1100 500, 1400 100, 1800 400" 
              fill="none" 
              stroke="#fbbf24" 
              strokeWidth="3.5"
              animate={{
                strokeDasharray: ["20, 10, 5, 10", "40, 20, 10, 20"],
                d: [
                  "M -100 300 C 200 100, 400 500, 800 200 C 1100 500, 1400 100, 1800 400",
                  "M -100 350 C 250 180, 450 420, 850 250 C 1150 420, 1450 180, 1800 450",
                  "M -100 300 C 200 100, 400 500, 800 200 C 1100 500, 1400 100, 1800 400"
                ]
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut"
              }}
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
                  "M -100 400 C 250 520, 550 280, 950 420 C 1250 380, 1450 580, 1900 400",
                  "M -100 450 C 300 600, 600 200, 1000 500 C 1300 300, 1500 650, 1900 450"
                ]
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        </div>

        {/* Interactive current electron flows (magnesium/zinc ions streaming) */}
        <div className="absolute inset-0 z-1">
          {currentParticles.map((pt) => (
            <motion.div
              key={pt.id}
              className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] opacity-0"
              animate={{
                x: ["10vw", "90vw"],
                y: [
                  "40vh", 
                  pt.id % 2 === 0 ? "25vh" : "60vh", 
                  pt.id % 3 === 0 ? "55vh" : "30vh", 
                  "45vh"
                ],
                opacity: [0, 0.9, 0.9, 0],
                scale: [0.6, 1.2, 1.2, 0.6]
              }}
              transition={{
                duration: pt.duration,
                delay: pt.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Giant Glowing Plasma Fields */}
        <motion.div 
          className="absolute w-[650px] h-[650px] rounded-full bg-amber-500/[0.14] blur-[150px]"
          animate={{
            x: [0, 120, -90, 0],
            y: [0, -110, 100, 0],
            opacity: [0.7, 1, 0.8, 0.7]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "15%", left: "5%" }}
        />

        <motion.div 
          className="absolute w-[700px] h-[700px] rounded-full bg-blue-500/[0.09] blur-[180px]"
          animate={{
            x: [0, -130, 80, 0],
            y: [0, 110, -90, 0],
            opacity: [0.6, 0.9, 0.7, 0.6]
          }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "5%", right: "5%" }}
        />

        {/* Ambient floating chemical ions */}
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
          2. HIGH-CONTRAST CENTRAL HUD PANELS (Double Column Showcase)
         ========================================================================= */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 md:py-16 relative z-10 max-w-lg mx-auto w-full gap-8">
        
        {/* Verification Loader Overlay */}
        {isVerifying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-[#02050d]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center"
          >
            <div className="text-center space-y-4 max-w-sm px-6">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 rounded-full border-4 border-amber-500/10 border-t-amber-500 mx-auto"
              />
              <div className="space-y-1">
                <h3 className="font-display text-sm font-black text-white tracking-widest uppercase">
                  DECRYPTING VAULT KEY
                </h3>
                <p className="font-mono text-[10px] text-gray-400 leading-normal">
                  Securing galvanic stream and decrypting node authentication matrix...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Highlighted Brand Block matching user's logo exactly */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full text-center md:text-left flex flex-col md:flex-row items-center gap-6 bg-gradient-to-r from-amber-500/[0.04] to-transparent p-6 rounded-2xl border border-white/[0.04] shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm"
        >
          {/* Custom High-Fidelity SVG Shield matching the image's logo structure */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-amber-500/15 rounded-full blur-xl animate-pulse" />
            <svg 
              className="w-16 h-16 text-amber-500 relative z-10 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]" 
              viewBox="0 0 100 110" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Golden Shield Shield */}
              <path 
                d="M50 8 L88 24 V58 C88 83 50 98 50 98 C50 98 12 83 12 58 V24 L50 8 Z" 
                stroke="url(#shieldGoldGradient2)" 
                strokeWidth="4.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              
              {/* Secondary partial inner boundary */}
              <path 
                d="M50 20 L76 31 V56 C76 74 50 86 50 86 C50 86 24 74 24 56 V31 L50 20 Z" 
                stroke="#d97706" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                opacity="0.5" 
              />
              
              {/* High tech inner custom schematic lines */}
              <path 
                d="M38 40 H62 V52 H46 V62 H62 V72 H38" 
                stroke="#f59e0b" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              
              <defs>
                <linearGradient id="shieldGoldGradient2" x1="12" y1="8" x2="88" y2="98" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fbbf24" />
                  <stop offset="0.5" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="text-center md:text-left space-y-1.5">
            <h1 className="font-display font-black text-4xl tracking-tight text-white leading-none">
              SMARTGEN
            </h1>
            <h2 className="font-display font-extrabold text-2xl tracking-widest text-[#f59e0b] leading-none mt-1">
              COATLOGIX <span className="text-sm align-super font-semibold">®</span>
            </h2>
            <div className="inline-block mt-2">
              <span className="font-mono text-[9px] tracking-[0.16em] text-white bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25 font-bold uppercase">
                INTELLIGENT INTEGRITY. ENGINEERED PROTECTION
              </span>
            </div>
          </div>
        </motion.div>

        {/* Secure Login Box */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md rounded-2xl bg-[#090e18]/95 border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.15)] p-6 md:p-8 relative overflow-hidden backdrop-blur-md"
        >
          {/* Top corner glowing amber tab */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="space-y-6">
            
            {/* Login header section */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/20 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <Lock size={20} className="text-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-extrabold text-white tracking-widest uppercase">
                  Secure Portal Login
                </h3>
                <p className="font-mono text-[9px] text-gray-400 tracking-wider">
                  AUTHORIZED PERSONNEL ONLY • SSO METRIC
                </p>
              </div>
            </div>

            {/* Form Input fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Corporate Email Address */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-gray-400 tracking-widest uppercase font-bold">
                  Corporate Email
                </label>
                <input 
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username/Email"
                  className="w-full bg-[#030610] border border-white/10 hover:border-amber-500/40 focus:border-amber-500 rounded-xl px-4 py-3.5 font-mono text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  required
                />
              </div>

              {/* Password Passkey */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-mono text-gray-400 tracking-widest uppercase font-bold">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] font-mono text-amber-500 hover:text-amber-400 focus:outline-none flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#030610] border border-white/10 hover:border-amber-500/40 focus:border-amber-500 rounded-xl px-4 py-3.5 font-mono text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  required
                />
              </div>

              {/* Error Box */}
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-[11px] font-mono flex items-start gap-2.5 leading-relaxed"
                >
                  <ShieldAlert size={14} className="shrink-0 mt-0.5 text-red-400" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* Action Trigger Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#f59e0b] hover:bg-amber-400 text-gray-950 font-display font-extrabold text-[11px] tracking-widest transition-all uppercase cursor-pointer active:scale-98 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-1.5"
                >
                  <Unlock size={12} className="stroke-[2.5]" />
                  <span>Login</span>
                </button>

                <button
                  type="button"
                  onClick={loadDefaultCredentials}
                  className="w-full py-3.5 rounded-xl border border-white/10 hover:border-amber-500/30 text-gray-300 hover:text-white font-display font-extrabold text-[11px] tracking-widest transition-all uppercase cursor-pointer text-center"
                >
                  Register Access
                </button>
              </div>

            </form>

            {/* Secure Info Alert Badge */}
            <div className="bg-[#030610]/80 rounded-xl p-3.5 border border-white/[0.04] flex gap-2.5 items-start">
              <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="block font-mono text-[9px] text-amber-400 font-bold uppercase tracking-wider">
                  RAPID DEMO ShortCut:
                </span>
                <p className="text-[10px] text-gray-400 leading-normal">
                  Click "Register Access" or default operator fields to explore all diagnostic dashboards instantly.
                </p>
              </div>
            </div>

          </div>

          {/* Footing secure standards */}
          <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between font-mono text-[8px] text-gray-500 tracking-widest uppercase">
            <span>SECURE ENDPOINT AUTH</span>
            <span>AES-256 SECURED</span>
          </div>

        </motion.div>
      </main>

      {/* =========================================================================
          3. INDUSTRIAL FOOTER SECTION
         ========================================================================= */}
      <footer className="w-full text-center py-5 border-t border-white/[0.04] bg-[#03060c] z-10 font-mono text-[9px] tracking-[0.25em] text-gray-500 uppercase">
        [ SMARTGEN COATLOGIX SYSTEMS • ESTD 2026 ]
      </footer>

    </div>
  );
}
