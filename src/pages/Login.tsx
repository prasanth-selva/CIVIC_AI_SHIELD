import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Terminal, Activity, Eye, Fingerprint, Cpu, Globe, Zap, AlertTriangle, ChevronRight, Speaker, Mic, Target, ShieldCheck, MapPin, Radio, Wifi, LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/cinematic-auth.css";

const BOOT_LOGS = [
  "INITIALIZING CAIS_KERNEL_V6.0.1",
  "SECURE NODE HANDSHAKE: [SUCCESS]",
  "GPU TELEMETRY: 8192 TACTICAL CORES",
  "THREAT MATRIX V3 SYNCHRONIZED",
  "EDGE NETWORK ACTIVE: 512 NODES",
  "NEURAL INTERFACE CALIBRATED",
  "SENTINEL_AI SECURITY GUARDIAN: ACTIVE",
  "READY FOR MULTI-FACTOR AUTHENTICATION"
];

const AUTH_STAGES = [
  { id: 'IDENTITY', label: 'VERIFYING OPERATOR IDENTITY', icon: Target },
  { id: 'BIOMETRIC', label: 'BIOMETRIC SIGNATURE ANALYSIS', icon: Fingerprint },
  { id: 'NEURAL', label: 'NEURAL LINK VALIDATION', icon: Radio },
  { id: 'GRID', label: 'COMMAND GRID SYNCHRONIZATION', icon: Globe },
  { id: 'GRANTED', label: 'ACCESS GRANTED', icon: ShieldCheck }
];

const RECENT_ATTEMPTS = [
  { id: 1, loc: "SITE-ALPHA (10.0.1.42)", status: "SECURE", time: "2m ago" },
  { id: 2, loc: "SITE-OMEGA (192.168.4.1)", status: "AUTHORIZED", time: "14m ago" },
  { id: 3, loc: "EDGE-NORTH (172.16.0.5)", status: "FAILED_CIPHER", time: "1h ago" },
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
  const [authStageIndex, setAuthStageIndex] = useState(-1);
  const [isScanning, setIsScanning] = useState(false);
  const [showRetina, setShowRetina] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [lockOnProgress, setLockOnProgress] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);

  // Initialize Particles
  useEffect(() => {
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 15 + 10
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
            setTimeout(() => setIsBooting(false), 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [isBooting]);

  // Auth Simulation Logic
  const runAuthSimulation = useCallback(async () => {
    for (let i = 0; i < AUTH_STAGES.length; i++) {
      setAuthStageIndex(i);
      if (i === 1) setIsScanning(true);
      if (i === 2) {
        setIsScanning(false);
        setShowVoice(true);
      }
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (i === 2) setShowVoice(false);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setLockOnProgress(0);

    const lockInterval = setInterval(() => {
      setLockOnProgress(prev => Math.min(100, prev + 1));
    }, 50);

    await runAuthSimulation();
    clearInterval(lockInterval);

    const result = await login(email.trim(), password, remember);
    if (!result.ok) {
      setError(result.error);
      setAuthStageIndex(-1);
      setSubmitting(false);
      setLockOnProgress(0);
    }
  };

  const handleBiometric = () => {
    setIsScanning(true);
    setShowRetina(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowRetina(false);
    }, 4000);
  };

  if (isBooting) {
    return (
      <div className="auth-terminal-root flex flex-col items-center justify-center font-inter">
        <div className="tactical-grid opacity-20" />
        <div className="neural-pulse-bg" />
        
        <div className="relative z-10 w-full max-w-2xl p-16 border-t border-red-600/40 bg-black/95 backdrop-blur-3xl shadow-[0_-20px_100px_rgba(255,0,0,0.1)]">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 border-2 border-red-600/40 rounded-full flex items-center justify-center animate-spin-slow">
                <Cpu className="text-red-600" size={32} />
              </div>
              <div>
                <h2 className="text-red-600 text-sm font-black tracking-[0.8em] uppercase mb-1">Grid_Kernel_V6</h2>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-mono">Initializing Neural_Matrix_Synchronization</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-red-900 text-[10px] font-black uppercase tracking-widest">Clearance_Level</p>
              <p className="text-red-600 text-xl font-black italic">LEVEL_5_OMEGA</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4">
              {BOOT_LOGS.slice(0, bootLogIndex + 1).map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 text-[10px] text-red-500/80 tracking-widest uppercase font-bold font-mono"
                >
                  <span className="text-red-900">[{i.toString().padStart(2, '0')}]</span>
                  <span>{log}</span>
                </motion.div>
              ))}
            </div>
            <div className="border-l border-red-600/10 pl-10 flex flex-col justify-end">
               <div className="mb-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-red-600">
                  <span>System_Integrity</span>
                  <span>{Math.round((bootLogIndex + 1) / BOOT_LOGS.length * 100)}%</span>
               </div>
               <div className="h-2 bg-red-950/30 w-full relative overflow-hidden rounded-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "linear" }}
                  className="absolute inset-0 bg-red-600 shadow-[0_0_15px_rgba(255,0,0,1)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-terminal-root flex items-center justify-center p-8">
      <div className="tactical-grid" />
      <div className="neural-pulse-bg" />
      <div className="cinematic-vignette" />
      <div className="scanlines" />
      
      {/* Volumetric Scan Beam */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-[30%] h-full bg-gradient-to-r from-transparent via-red-600/5 to-transparent skew-x-12"
        />
      </div>

      {/* Floating Particles */}
      <div className="floating-particles">
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="particle"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -150, 0], opacity: [0.1, 0.5, 0.1], scale: [1, 2, 1] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut" }}
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
            className="retina-overlay active flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl"
          >
            <div className="retina-circle w-[400px] h-[400px] border-red-600/40" />
            <div className="retina-circle w-[350px] h-[350px] border-red-600/20" style={{ animationDirection: 'reverse' }} />
            <div className="retina-circle w-[200px] h-[200px] border-red-600" style={{ borderStyle: 'solid' }} />
            
            <div className="mt-12 text-center space-y-2">
              <h3 className="text-red-600 font-black tracking-[1.5em] text-sm uppercase animate-pulse">BIOMETRIC_LOCK_ENGAGED</h3>
              <p className="text-gray-500 text-[10px] font-mono tracking-widest uppercase">Targeting_Retinal_Signature_Node_Alpha</p>
            </div>
            
            <div className="scanner-line h-1 w-[450px] absolute" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Auth Overlay */}
      <AnimatePresence>
        {showVoice && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-black/95"
          >
            <div className="voice-waveform flex items-end gap-1 h-32 mb-12">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: [20, Math.random() * 80 + 40, 20] }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                  className="w-1 bg-red-600 shadow-[0_0_10px_rgba(255,0,0,1)]"
                />
              ))}
            </div>
            <div className="flex items-center gap-6">
              <Mic className="text-red-600 animate-pulse" size={32} />
              <div>
                <h3 className="text-red-600 font-black tracking-[0.8em] text-lg uppercase">VOICE_AUTHORIZATION</h3>
                <p className="text-gray-500 text-xs font-mono uppercase tracking-widest italic">"AUTHORIZE_KERNEL_OVERRIDE_CLEARANCE_FIVE"</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-7xl grid grid-cols-12 gap-8 relative z-10">
        {/* Left HUD Panel: Security Sentinel */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-3 space-y-6"
        >
          <div className="tactical-glass-panel p-6 border-l-2 border-red-600">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-600/10 border border-red-600/30">
                <ShieldCheck className="text-red-600" size={18} />
              </div>
              <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em]">Sentinel_AI_Guardian</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500 mb-2">
                  <span>Trust_Score</span>
                  <span className="text-red-600">98.4%</span>
                </div>
                <div className="h-1 bg-red-950/30 w-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "98.4%" }} className="h-full bg-red-600" />
                </div>
              </div>

              <div className="h-24 relative overflow-hidden bg-black/40 border border-red-600/10">
                 <div className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-red-900/40 uppercase tracking-tighter">Behavior_Anomaly_Graph</div>
                 <svg className="absolute inset-0 w-full h-full">
                    <motion.path 
                      d="M0 50 Q 50 20 100 60 T 200 40 T 300 70" 
                      fill="none" 
                      stroke="rgba(255,0,0,0.3)" 
                      strokeWidth="1"
                      animate={{ d: ["M0 50 Q 50 20 100 60 T 200 40 T 300 70", "M0 60 Q 50 80 100 30 T 200 60 T 300 20"] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    />
                 </svg>
              </div>

              <div className="space-y-2">
                <p className="text-[8px] font-mono text-red-600/50 uppercase italic tracking-widest animate-pulse">Monitoring_Active...</p>
                <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest italic">Predictive_Infection_Risk: 0.002%</p>
              </div>
            </div>
          </div>

          <div className="tactical-glass-panel p-6">
             <h3 className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <Radio size={12} className="text-red-600" /> Site_Connectivity
             </h3>
             <div className="space-y-3">
                {['ALPHA', 'BRAVO', 'OMEGA'].map(site => (
                  <div key={site} className="flex items-center justify-between">
                    <span className="text-[8px] font-mono text-gray-400">SITE-{site}</span>
                    <div className="flex gap-1">
                       <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                       <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse delay-75" />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </motion.div>

        {/* Main Center Panel: Auth Core */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-6"
        >
          <div className="tactical-glass-panel p-16 relative">
            {/* Logo Section */}
            <div className="flex flex-col items-center text-center mb-16">
              <motion.div 
                animate={{ rotateY: [0, 360] }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className="w-24 h-24 border-2 border-red-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,0,0,0.4)] bg-red-950/30"
              >
                <Shield className="text-red-600" size={40} />
              </motion.div>
              <h1 className="text-5xl font-black italic tracking-tighter text-white mb-4">CIVIC_AI_SHIELD</h1>
              <div className="flex items-center gap-6 text-red-600 uppercase tracking-[0.6em] text-[12px] font-black">
                <span className="w-12 h-[2px] bg-red-600/30" />
                COMMANDER_CLEARANCE_REQUIRED
                <span className="w-12 h-[2px] bg-red-600/30" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600/80 flex items-center gap-2">
                    <Terminal size={12} /> Operator_Identity
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="KERNEL_ID@CAIS.MIL"
                      className="military-input w-full"
                    />
                    <Activity size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600/20" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600/80 flex items-center gap-2">
                    <LockKeyhole size={12} /> Grid_Cipher
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="military-input w-full"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600/20 hover:text-red-600"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-8 bg-red-950/10 border border-red-600/10">
                 <div className="flex items-center gap-8">
                   <div onClick={handleBiometric} className="fingerprint-scanner w-20 h-20">
                      <Fingerprint className={isScanning ? "text-red-600 animate-pulse" : "text-red-600/40"} size={48} />
                      {isScanning && <div className="scanner-line" />}
                   </div>
                   <div>
                      <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-1">Identity_Lock_Status</h4>
                      <div className="flex items-center gap-3">
                         <div className="text-2xl font-black text-white italic">{lockOnProgress}%</div>
                         <div className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Confidence_Rating</div>
                      </div>
                   </div>
                 </div>

                 <div className="text-right space-y-4">
                   <label className="flex items-center justify-end gap-3 cursor-pointer text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-600 transition-colors">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-red-600" />
                      Neural_Link_Persistence
                   </label>
                   <div className="flex items-center justify-end gap-6 text-[9px] font-black uppercase tracking-widest text-red-900">
                      <span className="flex items-center gap-2 cursor-pointer hover:text-red-600 transition-colors"><Radio size={12} /> Encryption_V9</span>
                      <span className="flex items-center gap-2 cursor-pointer hover:text-red-600 transition-colors text-red-600"><Wifi size={12} /> Secure_Uplink</span>
                   </div>
                 </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-950/60 border-l-4 border-red-600 p-6 flex items-center gap-6"
                >
                  <AlertTriangle className="text-red-600" size={24} />
                  <div>
                    <h5 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Clearance_Denied_Security_Violation</h5>
                    <p className="text-sm font-black text-white uppercase tracking-widest">{error}</p>
                  </div>
                </motion.div>
              )}

              <button
                disabled={submitting || isScanning}
                className={`btn-tactical w-full h-20 flex flex-col items-center justify-center gap-1 ${submitting ? 'bg-red-600 text-black border-none' : ''}`}
              >
                {submitting ? (
                  <>
                    <div className="flex items-center gap-4">
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                        className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full" 
                      />
                      <span className="text-lg font-black tracking-widest">{AUTH_STAGES[authStageIndex]?.label || "VALIDATING..."}</span>
                    </div>
                    <div className="text-[8px] font-mono tracking-[0.5em] opacity-60">PHASE_{authStageIndex + 1}_OF_5</div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                       <ShieldCheck size={20} />
                       <span className="text-lg font-black tracking-widest">INITIALIZE_GRID_ACCESS</span>
                    </div>
                    <div className="text-[8px] font-mono tracking-[0.5em] opacity-40">RSA_4096_ENCRYPTION_ACTIVE</div>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Right HUD Panel: Access Surveillance */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-3 space-y-6"
        >
          <div className="tactical-glass-panel p-6 border-r-2 border-red-600">
             <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <MapPin size={18} /> Access_Surveillance
             </h3>
             <div className="space-y-6">
                {RECENT_ATTEMPTS.map(attempt => (
                  <div key={attempt.id} className="relative pl-4 border-l border-white/5">
                    <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">{attempt.loc}</p>
                    <div className="flex items-center justify-between">
                       <span className={`text-[8px] font-mono tracking-widest ${attempt.status.includes('FAILED') ? 'text-red-600' : 'text-gray-500'}`}>{attempt.status}</span>
                       <span className="text-[8px] font-mono text-gray-700">{attempt.time}</span>
                    </div>
                    {attempt.status.includes('SECURE') && (
                      <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                    )}
                  </div>
                ))}
             </div>
          </div>

          <div className="tactical-glass-panel p-8 flex flex-col items-center text-center">
             <div className="relative mb-6">
                <div className="w-16 h-16 border border-red-600/20 rounded-lg transform rotate-45 flex items-center justify-center">
                   <Lock className="text-red-600 -rotate-45" size={24} />
                </div>
                <div className="absolute inset-0 bg-red-600/5 blur-xl rounded-full" />
             </div>
             <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Grid_Status_Lock</p>
             <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest leading-relaxed">
                All_Terminal_Input_Encrypted_Under_Strategic_Directive_74B
             </p>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding Overlay */}
      <div className="fixed bottom-12 left-12 right-12 flex items-end justify-between pointer-events-none opacity-40">
         <div className="flex flex-col gap-4">
            <div className="flex gap-12 font-mono uppercase text-[10px] tracking-widest">
               <div className="space-y-1">
                  <p className="text-gray-600">NEURAL_SYNC</p>
                  <p className="text-red-600 font-bold">STABLE_99.9%</p>
               </div>
               <div className="space-y-1">
                  <p className="text-gray-600">GRID_NODES</p>
                  <p className="text-red-600 font-bold">512_ACTV</p>
               </div>
            </div>
            <div className="h-[1px] w-64 bg-gradient-to-r from-red-600 to-transparent" />
         </div>
         
         <div className="flex flex-col items-end gap-2 text-right">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.8em]">ASWIG_STRATEGIC_OS</p>
            <p className="text-red-900 text-[8px] font-mono uppercase tracking-[0.3em]">Build_ID: CAIS_6.0.1_STABLE_GRID</p>
         </div>
      </div>
    </div>
  );
}
