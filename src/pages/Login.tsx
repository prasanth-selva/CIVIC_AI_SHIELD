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
  { id: 1, loc: "SITE-ALPHA (10.0.1.42)", status: "SECURE", time: "2m ago", coords: "34.05, -118.24" },
  { id: 2, loc: "SITE-OMEGA (192.168.4.1)", status: "AUTHORIZED", time: "14m ago", coords: "40.71, -74.00" },
  { id: 3, loc: "EDGE-NORTH (172.16.0.5)", status: "FAILED_CIPHER", time: "1h ago", coords: "51.50, -0.12" },
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
  const [intrusionAlerts, setIntrusionAlerts] = useState<string[]>([]);

  // Initialize Particles & Alerts
  useEffect(() => {
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 15 + 10
    }));
    setParticles(newParticles);

    const alertInterval = setInterval(() => {
      const site = ['ALPHA', 'OMEGA', 'NODE-7'][Math.floor(Math.random() * 3)];
      const type = ['ACCESS_SYNC', 'HEARTBEAT_STABLE', 'NODE_FEDERATED'][Math.floor(Math.random() * 3)];
      setIntrusionAlerts(prev => [ `${site} // ${type} // ${new Date().toLocaleTimeString()}`, ...prev.slice(0, 4) ]);
    }, 4000);

    return () => clearInterval(alertInterval);
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
      await new Promise(resolve => setTimeout(resolve, 1400));
      if (i === 2) setShowVoice(false);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setLockOnProgress(0);

    const lockInterval = setInterval(() => {
      setLockOnProgress(prev => Math.min(100, prev + (Math.random() > 0.5 ? 1 : 2)));
    }, 100);

    await runAuthSimulation();
    clearInterval(lockInterval);
    setLockOnProgress(100);

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
          <div className="tactical-glass-panel p-6 border-l-2 border-red-600 relative overflow-hidden">
            <div className="radar-sweep opacity-5" />
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-600/10 border border-red-600/30">
                <ShieldCheck className="text-red-600" size={18} />
              </div>
              <div>
                <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em]">Sentinel_AI_Guardian</h3>
                <p className="text-[7px] font-mono text-gray-700 uppercase tracking-widest mt-1">SENTINEL_MONITORING_ACTIVE</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500 mb-2">
                  <span>Trust_Score_Confidence</span>
                  <span className="text-emerald-500">98.4%</span>
                </div>
                <div className="h-1 bg-white/5 w-full overflow-hidden rounded-full">
                  <motion.div initial={{ width: 0 }} animate={{ width: "98.4%" }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </div>

              <div className="h-24 relative overflow-hidden bg-black/40 border border-white/5 rounded-sm">
                 <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                    <Brain size={32} className="text-red-900" />
                    <p className="text-[6px] font-mono text-red-900 uppercase tracking-tighter mt-2">Behavior_Neural_Analysis</p>
                 </div>
                 <svg className="absolute inset-0 w-full h-full">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <motion.path 
                        key={i}
                        d={`M0 ${40 + i*10} Q 50 ${20 + i*5} 100 ${60 - i*5} T 200 ${40 + i*10} T 300 ${70 - i*5}`} 
                        fill="none" 
                        stroke={`rgba(255,0,0,${0.1 + i*0.1})`} 
                        strokeWidth="1"
                        animate={{ d: [
                          `M0 ${40 + i*10} Q 50 ${20 + i*5} 100 ${60 - i*5} T 200 ${40 + i*10} T 300 ${70 - i*5}`,
                          `M0 ${60 - i*5} Q 50 ${80 - i*10} 100 ${30 + i*5} T 200 ${60 - i*5} T 300 ${20 + i*10}`
                        ]}}
                        transition={{ repeat: Infinity, duration: 3 + i, ease: "linear" }}
                      />
                    ))}
                 </svg>
              </div>

              <div className="space-y-2">
                <p className="text-[8px] font-mono text-red-600/50 uppercase italic tracking-widest animate-pulse">Monitoring_Operator_Input...</p>
                <div className="flex items-center gap-4">
                   <div className="flex-1 space-y-1">
                      <p className="text-[6px] font-black text-gray-700 uppercase">Suspicious_Interaction_Probability</p>
                      <div className="h-0.5 bg-white/5 w-full">
                         <motion.div animate={{ width: "2%" }} className="h-full bg-emerald-500" />
                      </div>
                   </div>
                   <span className="text-[8px] font-mono text-emerald-500">LOW</span>
                </div>
              </div>
            </div>
          </div>

          <div className="tactical-glass-panel p-6 border-l-2 border-red-900/40">
             <h3 className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <Terminal size={12} className="text-red-600" /> Intrusion_Telemetry
             </h3>
             <div className="space-y-2 overflow-hidden h-32 flex flex-col-reverse">
                <AnimatePresence>
                  {intrusionAlerts.map((alert, i) => (
                    <motion.div 
                      key={alert}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1 - i * 0.2, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[7px] font-mono text-red-600/60 uppercase tracking-tighter whitespace-nowrap"
                    >
                      {alert}
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>
          </div>
        </motion.div>

        {/* Main Center Panel: Auth Core */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-6"
        >
          <div className="tactical-glass-panel p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none" />
            
            {/* Logo Section */}
            <div className="flex flex-col items-center text-center mb-16 relative">
              <motion.div 
                animate={{ rotateY: [0, 360] }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="w-28 h-28 border-2 border-red-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(255,0,0,0.5)] bg-red-950/20 group cursor-help"
              >
                <Shield className="text-red-600" size={48} />
                <div className="absolute inset-0 border-4 border-dashed border-red-600/20 rounded-full animate-spin-slow" />
              </motion.div>
              <h1 className="text-6xl font-black italic tracking-tighter text-white mb-4">CIVIC_AI_SHIELD</h1>
              <div className="flex items-center gap-8 text-red-600 uppercase tracking-[0.8em] text-[12px] font-black">
                <span className="w-16 h-[1px] bg-red-600/40 shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
                COMMANDER_CLEARANCE_REQUIRED
                <span className="w-16 h-[1px] bg-red-600/40 shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10 relative">
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600/80 flex items-center gap-3">
                    <User size={14} /> Operator_Identity
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="KERNEL_ID@CAIS.MIL"
                      className="military-input w-full"
                    />
                    <motion.div 
                      animate={{ opacity: email ? [0.2, 0.5, 0.2] : 0 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 font-mono text-[8px]"
                    >
                      {email && "0x" + Math.random().toString(16).slice(2, 6).toUpperCase()}
                    </motion.div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600/80 flex items-center gap-3">
                    <LockKeyhole size={14} /> Grid_Cipher
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600/40 hover:text-red-600 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-10 bg-red-950/10 border border-red-600/10 relative">
                 <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-600" />
                 <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-600" />
                 
                 <div className="flex items-center gap-10">
                   <div onClick={handleBiometric} className="fingerprint-scanner w-24 h-24 border-red-600/20 hover:border-red-600 transition-all">
                      <Fingerprint className={isScanning ? "text-red-600 animate-pulse" : "text-red-600/30"} size={56} />
                      {isScanning && <div className="scanner-line h-[4px]" />}
                   </div>
                   <div>
                      <h4 className="text-[11px] font-black text-red-600 uppercase tracking-[0.4em] mb-2 italic">Neural_Identity_Lock</h4>
                      <div className="flex items-center gap-4">
                         <div className="text-4xl font-black text-white italic tracking-tighter">{lockOnProgress}%</div>
                         <div className="space-y-1">
                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Confidence_Rating</p>
                            <div className="flex gap-0.5">
                               {Array.from({ length: 10 }).map((_, i) => (
                                 <div key={i} className={`w-1.5 h-1 ${i < lockOnProgress / 10 ? 'bg-red-600' : 'bg-white/5'}`} />
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                 </div>

                 <div className="text-right space-y-5">
                    <label className="flex items-center justify-end gap-4 cursor-pointer text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-600 transition-colors">
                       <span className="opacity-60 italic">Persistent_Neural_Link</span>
                       <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 accent-red-600 border-red-600 bg-black" />
                    </label>
                    <div className="flex flex-col items-end gap-2 text-[9px] font-black uppercase tracking-widest">
                       <span className="flex items-center gap-3 text-red-900/60 hover:text-red-600 transition-colors cursor-help"><Radio size={12} /> Encrypted_Access_Key: 0x9F...A2</span>
                       <span className="flex items-center gap-3 text-emerald-600/80"><Wifi size={12} className="animate-pulse" /> Secure_Mesh_Uplink_Active</span>
                    </div>
                 </div>
              </div>

              <div className="relative group">
                <button
                  disabled={submitting || isScanning}
                  className={`btn-tactical w-full h-24 flex flex-col items-center justify-center gap-1 transition-all ${submitting ? 'bg-red-600 text-black border-none scale-[0.98]' : 'hover:scale-[1.01]'}`}
                >
                  {submitting ? (
                    <>
                      <div className="flex items-center gap-6">
                        <motion.div 
                          animate={{ rotate: 360 }} 
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                          className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full" 
                        />
                        <span className="text-xl font-black tracking-[0.2em]">{AUTH_STAGES[authStageIndex]?.label || "STABILIZING_KERNEL..."}</span>
                      </div>
                      <div className="text-[10px] font-mono tracking-[0.6em] opacity-60">AUTHORIZATION_PHASE_{authStageIndex + 1}_OF_5</div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-6">
                         <ShieldCheck size={28} />
                         <span className="text-2xl font-black tracking-[0.3em] italic">INITIALIZE_GRID_ACCESS</span>
                      </div>
                      <div className="text-[10px] font-mono tracking-[0.8em] opacity-40">NATIONAL_DEFENSE_PROTOCOL_ALPHA_7</div>
                    </>
                  )}
                </button>
                <div className="absolute -inset-1 bg-red-600/20 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-sm pointer-events-none" />
              </div>
            </form>
          </div>
        </motion.div>

        {/* Right HUD Panel: Access Surveillance */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-3 space-y-6"
        >
          <div className="tactical-glass-panel p-6 border-r-2 border-red-600 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
             </div>
             <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <MapPin size={18} /> Global_Access_Grid
             </h3>
             
             {/* Mini Map/Geolocation Simulation */}
             <div className="h-40 bg-black/60 border border-white/5 relative mb-8 overflow-hidden rounded-sm">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#ff0000,transparent_70%)]" />
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-5 border border-red-600/20" />
                {RECENT_ATTEMPTS.map(attempt => (
                   <motion.div 
                      key={attempt.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.5, 1] }}
                      transition={{ delay: attempt.id * 0.5, repeat: Infinity, repeatDelay: 5 }}
                      className="absolute w-2 h-2 bg-red-600 rounded-full shadow-[0_0_10px_rgba(255,0,0,1)]"
                      style={{ 
                        left: `${(parseFloat(attempt.coords.split(',')[1]) + 180) / 360 * 100}%`, 
                        top: `${(90 - parseFloat(attempt.coords.split(',')[0])) / 180 * 100}%` 
                      }}
                   >
                      <div className="absolute inset-0 bg-red-600 rounded-full animate-ping" />
                   </motion.div>
                ))}
                <div className="absolute bottom-2 left-2 text-[6px] font-mono text-gray-600 uppercase tracking-widest">Live_Geospatial_Surveillance</div>
             </div>

             <div className="space-y-6">
                {RECENT_ATTEMPTS.map(attempt => (
                  <div key={attempt.id} className="relative pl-4 border-l border-white/5 hover:border-red-600 transition-colors cursor-crosshair group">
                    <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1 group-hover:text-red-600 transition-colors">{attempt.loc}</p>
                    <div className="flex items-center justify-between">
                       <span className={`text-[8px] font-mono tracking-widest ${attempt.status.includes('FAILED') ? 'text-red-600' : 'text-gray-500'}`}>{attempt.status}</span>
                       <span className="text-[8px] font-mono text-gray-700">{attempt.time}</span>
                    </div>
                    <div className="text-[7px] font-mono text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">COORDS: {attempt.coords}</div>
                  </div>
                ))}
             </div>
          </div>

          <div className="tactical-glass-panel p-10 flex flex-col items-center text-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative mb-8">
                <div className="w-20 h-20 border border-red-600/20 rounded-lg transform rotate-45 flex items-center justify-center transition-all group-hover:border-red-600 group-hover:shadow-[0_0_30px_rgba(255,0,0,0.3)]">
                   <Lock className="text-red-600 -rotate-45" size={32} />
                </div>
                <div className="absolute inset-0 bg-red-600/10 blur-2xl rounded-full opacity-20" />
             </div>
             <p className="text-[12px] font-black text-red-600 uppercase tracking-widest mb-3 italic">Terminal_Lock_Active</p>
             <p className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.2em] leading-relaxed italic px-4">
                All_Inbound_Requests_Subject_To_Manual_Commander_Review
             </p>
             <div className="mt-6 flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                   <div key={i} className="w-8 h-1 bg-red-950/40 rounded-full overflow-hidden">
                      <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }} className="h-full bg-red-600" />
                   </div>
                ))}
             </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding Overlay */}
      <div className="fixed bottom-12 left-12 right-12 flex items-end justify-between pointer-events-none">
         <div className="flex flex-col gap-6">
            <div className="flex gap-16 font-mono uppercase text-[10px] tracking-widest">
               <div className="space-y-2">
                  <p className="text-gray-700 font-black">Neural_Sync_Core</p>
                  <p className="text-red-600 font-bold flex items-center gap-3">
                     <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                     STABLE_99.998%
                  </p>
               </div>
               <div className="space-y-2 border-l border-white/5 pl-16">
                  <p className="text-gray-700 font-black">Grid_Connectivity</p>
                  <p className="text-red-600 font-bold flex items-center gap-3 text-lg italic tracking-tighter">
                     512_ACTV_NODES
                  </p>
               </div>
               <div className="space-y-2 border-l border-white/5 pl-16">
                  <p className="text-gray-700 font-black">Secure_Protocol</p>
                  <p className="text-emerald-500 font-bold flex items-center gap-3">
                     <Wifi size={14} />
                     AES_256_GCM
                  </p>
               </div>
            </div>
            <div className="h-[2px] w-[500px] bg-gradient-to-r from-red-600/60 via-red-600/10 to-transparent" />
         </div>
         
         <div className="flex flex-col items-end gap-3 text-right">
            <div className="flex items-center gap-4 text-red-600 font-black text-xs tracking-[0.4em] italic mb-2">
               <Shield size={16} />
               CLASSIFIED_GOVERNMENT_INFRASTRUCTURE
            </div>
            <p className="text-gray-600 text-[11px] font-black uppercase tracking-[1em]">ASWIG_STRATEGIC_OS</p>
            <p className="text-red-950 text-[9px] font-mono uppercase tracking-[0.4em] opacity-40">Build_ID: CAIS_6.0.1_STABLE_GRID_ALPHA_NODE</p>
         </div>
      </div>
    </div>
  );
}
