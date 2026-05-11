import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Terminal, Activity, Eye, Fingerprint, Cpu, Globe, Zap, AlertTriangle, ChevronRight, Speaker } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/cinematic-auth.css";

const BOOT_LOGS = [
  "INITIALIZING CAIS_KERNEL_V5.0.4",
  "SECURE NODE HANDSHAKE: SUCCESS",
  "GPU TELEMETRY: 4096 CORES ONLINE",
  "THREAT MATRIX SYNCHRONIZED",
  "EDGE NETWORK ACTIVE: 142 NODES",
  "NEURAL INTERFACE CALIBRATED",
  "READY FOR AUTHENTICATION"
];

const AUTH_STEPS = [
  "VERIFYING USER IDENTITY",
  "ACCESSING COMMAND GRID",
  "ENCRYPTING SESSION KEY",
  "AUTHORIZATION CONFIRMED"
];

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Experience States
  const [isBooting, setIsBooting] = useState(true);
  const [bootLogIndex, setBootLogIndex] = useState(0);
  const [authStepIndex, setAuthStepIndex] = useState(-1);
  const [isScanning, setIsScanning] = useState(false);
  const [showRetina, setShowRetina] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);

  // Initialize Particles
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10
    }));
    setParticles(newParticles);
  }, []);

  // Boot Sequence Logic
  useEffect(() => {
    if (isBooting) {
      const interval = setInterval(() => {
        setBootLogIndex(prev => {
          if (prev >= BOOT_LOGS.length - 1) {
            clearInterval(interval);
            setTimeout(() => setIsBooting(false), 800);
            return prev;
          }
          return prev + 1;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isBooting]);

  // Auth Simulation Logic
  const runAuthSimulation = useCallback(async () => {
    for (let i = 0; i < AUTH_STEPS.length; i++) {
      setAuthStepIndex(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    await runAuthSimulation();

    const result = await login(email.trim(), password, remember);
    if (!result.ok) {
      setError(result.error);
      setAuthStepIndex(-1);
      setSubmitting(false);
    } else {
      // Transition to dashboard will be handled by App.tsx redirect
    }
  };

  const handleBiometric = () => {
    setIsScanning(true);
    setShowRetina(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowRetina(false);
    }, 3000);
  };

  if (isBooting) {
    return (
      <div className="auth-terminal-root flex flex-col items-center justify-center font-mono">
        <div className="tactical-grid" />
        <div className="neural-pulse-bg" />
        
        <div className="relative z-10 w-full max-w-lg p-12 border border-red-600/20 bg-black/80 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-8">
            <Zap className="text-red-600 animate-pulse" size={24} />
            <h2 className="text-red-600 text-xs font-black tracking-[0.5em] uppercase">System_Initial_Boot</h2>
          </div>
          
          <div className="space-y-3">
            {BOOT_LOGS.slice(0, bootLogIndex + 1).map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-[10px] text-red-500/80 tracking-widest uppercase font-bold"
              >
                <ChevronRight size={10} className="text-red-900" />
                <span>{log}</span>
                {i === bootLogIndex && (
                  <motion.div 
                    animate={{ opacity: [0, 1, 0] }} 
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="w-1.5 h-3 bg-red-600"
                  />
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-12 h-1 bg-red-950/30 w-full relative overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "linear" }}
              className="absolute inset-0 bg-red-600 shadow-[0_0_10px_rgba(255,0,0,0.8)]"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-terminal-root flex items-center justify-center p-6">
      <div className="tactical-grid" />
      <div className="neural-pulse-bg" />
      <div className="cinematic-vignette" />
      <div className="scanlines" />
      
      {/* Floating Particles */}
      <div className="floating-particles">
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="particle"
            style={{ 
              left: `${p.x}%`, 
              top: `${p.y}%`, 
              width: p.size, 
              height: p.size 
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Retina Scan Overlay */}
      <AnimatePresence>
        {showRetina && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="retina-overlay active flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="retina-circle" />
            <div className="retina-circle" style={{ width: 280, animationDirection: 'reverse', opacity: 0.5 }} />
            <div className="absolute text-red-500 font-black tracking-[1em] text-xs mt-40 animate-pulse">SCANNING_BIO_METRICS</div>
            <div className="scanner-line h-1 w-[300px] absolute" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="tactical-glass-panel p-12 relative">
          {/* HUD Corner Decor */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-600/40" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-600/40" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-600/40" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-600/40" />

          {/* Logo Section */}
          <div className="flex flex-col items-center text-center mb-12">
            <motion.div 
              animate={{ rotateY: [0, 360] }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="w-20 h-20 border-2 border-red-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,0,0,0.3)] bg-red-950/20"
            >
              <Shield className="text-red-600" size={32} />
            </motion.div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white mb-2">CIVIC_AI_SHIELD</h1>
            <div className="flex items-center gap-4 text-red-600/60 uppercase tracking-[0.4em] text-[10px] font-bold">
              <span className="w-8 h-[1px] bg-red-600/30" />
              AUTHORIZED PERSONNEL ONLY
              <span className="w-8 h-[1px] bg-red-600/30" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600/80 ml-1 flex items-center gap-2">
                  <Terminal size={10} /> Operator_ID
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="OPERATOR@CIVIC.AI"
                    className="military-input w-full"
                  />
                  <Activity size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600/20 group-focus-within:text-red-600 transition-colors" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600/80 ml-1 flex items-center gap-2">
                  <Lock size={10} /> Access_Cipher
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="military-input w-full"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600/20 hover:text-red-600 transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
               <div className="flex items-center gap-6">
                 <div onClick={handleBiometric} className="fingerprint-scanner">
                    <Fingerprint className={isScanning ? "text-red-600 animate-pulse" : "text-red-600/30"} size={32} />
                    {isScanning && <div className="scanner-line" />}
                 </div>
                 <div className="hidden sm:block">
                    <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Secondary_Auth</p>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Bio_Metric_Link</p>
                 </div>
               </div>

               <div className="flex flex-col items-end gap-2">
                 <label className="flex items-center gap-2 cursor-pointer text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-red-600 transition-colors">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-red-600" />
                    Maintain_Active_Sync
                 </label>
                 <span className="text-[9px] font-black uppercase tracking-widest text-red-900 hover:text-red-600 cursor-pointer transition-colors flex items-center gap-2">
                    <AlertTriangle size={10} /> Emergency_Protocol
                 </span>
               </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-950/40 border border-red-600/30 p-4 flex items-center gap-4"
              >
                <AlertTriangle className="text-red-600" size={16} />
                <div>
                  <p className="text-[8px] font-mono text-red-600/50 uppercase tracking-widest">Authentication_Failure</p>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>
                </div>
              </motion.div>
            )}

            <button
              disabled={submitting || isScanning}
              className={`btn-tactical w-full h-16 flex items-center justify-center gap-4 ${submitting ? 'bg-red-600 text-black' : ''}`}
            >
              {submitting ? (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full" />
                    <span className="text-sm">{AUTH_STEPS[authStepIndex] || "INITIALIZING..."}</span>
                  </div>
                  <div className="w-full h-1 bg-black/20 mt-2 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3 }} className="h-full bg-black" />
                  </div>
                </div>
              ) : (
                <>
                  <Globe size={18} />
                  <span className="text-sm">Initialize Access</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Hardware Stats */}
        <div className="mt-8 flex items-center justify-between opacity-40">
           <div className="flex gap-8">
             <div className="space-y-1">
                <p className="text-[8px] font-mono uppercase tracking-widest text-gray-500">Neural_Load</p>
                <p className="node-counter text-[12px]">4.2%</p>
             </div>
             <div className="space-y-1">
                <p className="text-[8px] font-mono uppercase tracking-widest text-gray-500">Mesh_Nodes</p>
                <p className="node-counter text-[12px]">142_ACTV</p>
             </div>
             <div className="space-y-1">
                <p className="text-[8px] font-mono uppercase tracking-widest text-gray-500">Security</p>
                <p className="node-counter text-[12px] text-red-600">LEVEL_5</p>
             </div>
           </div>

           <div className="flex items-center gap-4">
              <Speaker className="text-red-600" size={14} />
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-400">Atmospheric_Audio_OFF</div>
           </div>
        </div>

        {/* Fake Terminal Logs Bottom */}
        <div className="mt-6 terminal-logs h-12 overflow-hidden opacity-30">
           <p className="animate-pulse">{">"} UPLINK_STABLE // SYNC_LATENCY_12ms // X_OMEGA_SEC_01</p>
           <p className="delay-75">{">"} TRACE_DETECTION_PASSIVE // NO_INTRUSION_DETECTED</p>
           <p className="delay-150">{">"} CAIS_V5_READY_FOR_COMMAND_INPUT</p>
        </div>
      </motion.div>
    </div>
  );
}
