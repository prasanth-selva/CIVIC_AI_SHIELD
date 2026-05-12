import { motion, AnimatePresence } from "framer-motion";
import { StatCard } from "../components/ui/StatCard";
import { CameraFeed } from "../components/ui/CameraFeed";
import { SystemIntelligence } from "../components/ui/SystemIntelligence";
import { SubjectCard } from "../components/ui/SubjectCard";
import { TacticalReplay } from "../components/ui/TacticalReplay";
import { StrategicWarRoom } from "../components/ui/StrategicWarRoom";
import { DigitalTwinCity } from "../components/ui/DigitalTwinCity";
import { AIConsciousnessLayer } from "../components/ui/AIConsciousnessLayer";
import { TacticalTimeline } from "../components/ui/TacticalTimeline";
import { GlobalDefenseMesh } from "../components/battlefield/GlobalDefenseMesh";
import { AIBattlefieldBrain } from "../components/battlefield/AIBattlefieldBrain";
import { SwarmSurveillance } from "../components/battlefield/SwarmSurveillance";
import { ForensicEngine } from "../components/battlefield/ForensicEngine";
import { InfrastructureMonitor } from "../components/battlefield/InfrastructureMonitor";
import { 
  Camera, AlertTriangle, Activity, Zap, Globe, ShieldAlert, LayoutGrid, Maximize2, Crosshair, Target, Brain, Shield, Terminal, 
  Search, Network, Map, Dna, Plane, Cpu, ShieldCheck, Wifi, History, TrendingUp, ChevronRight, MessageSquare, AlertCircle, 
  Trash2, Edit3, Save, Play, Square, Pause, SkipBack, SkipForward, Volume2, Settings, User, Bell, LogOut, Lock, Unlock, 
  Eye, EyeOff, Key, Fingerprint, Mic, Smartphone, Info, HelpCircle, MoreHorizontal, ExternalLink, RefreshCw, Layers, Hash, 
  Thermometer, Database, Server, Clock, CheckCircle, Binary, Box, Users 
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";
import { TacticalIdentity, SecuritySentinel } from "../components/ui/TacticalIdentity";
import { PlanetaryDefenseGrid } from "../components/battlefield/PlanetaryDefenseGrid";
import { QuantumIntelligenceCore } from "../components/battlefield/QuantumIntelligenceCore";
import { AIEvolutionEngine } from "../components/battlefield/AIEvolutionEngine";
import { TacticalSimulationReality } from "../components/battlefield/TacticalSimulationReality";
import { GeopoliticalEngine } from "../components/battlefield/GeopoliticalEngine";
import { NeuralFirewall } from "../components/battlefield/NeuralFirewall";
import { SentientAIVisualizer } from "../components/battlefield/SentientAIVisualizer";
import { SelfProtectingInfrastructure } from "../components/battlefield/SelfProtectingInfrastructure";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

export default function Dashboard() {
  const { user, token } = useAuth();
  const [isBooting, setIsBooting] = useState(true);
  const [activeView, setActiveView] = useState<"war-room" | "planetary" | "quantum" | "evolution" | "simulation" | "diplomacy" | "firewall">("war-room");
  const [selectedCam, setSelectedCam] = useState("cam-001");
  const [stats, setStats] = useState<any>(null);

  // Role-Specific Configuration
  const roleConfigs: Record<string, { color: string; shadow: string; msg: string; glow: string }> = {
    COMMANDER: { 
      color: "text-red-600", 
      shadow: "shadow-[0_0_80px_rgba(255,0,0,0.8)]", 
      glow: "rgba(255,0,0,0.2)",
      msg: "PLANETARY_DEFENSE_AUTHORIZATION_LOCKED // QUANTUM_CORE_ACTIVE" 
    },
    STRATEGIC_OPS: { 
      color: "text-orange-500", 
      shadow: "shadow-[0_0_80px_rgba(249,115,22,0.8)]", 
      glow: "rgba(249,115,22,0.2)",
      msg: "PLANETARY_SWARM_COORDINATION_STABLE // ORBITAL_MESH_SYNCED" 
    },
    FIELD_CONTROL: { 
      color: "text-blue-500", 
      shadow: "shadow-[0_0_80px_rgba(59,130,246,0.8)]", 
      glow: "rgba(59,130,246,0.2)",
      msg: "BATTLESPACE_DIGITAL_TWIN_v12_ACTIVE // SIMULATION_REALITY_STABLE" 
    },
    ANALYST: { 
      color: "text-emerald-500", 
      shadow: "shadow-[0_0_80px_rgba(16,185,129,0.8)]", 
      glow: "rgba(16,185,129,0.2)",
      msg: "QUANTUM_FORENSIC_GHOST_MODE_ACTIVE // TIMELINE_BRANCHING_MONITOR" 
    },
    OBSERVER: { 
      color: "text-gray-400", 
      shadow: "shadow-[0_0_80px_rgba(156,163,175,0.8)]", 
      glow: "rgba(156,163,175,0.2)",
      msg: "PASSIVE_PLANETARY_RECON_ACTIVE // GUEST_COGNITION_ONLY" 
    },
  };

  const currentConfig = roleConfigs[user?.role || "OBSERVER"];

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 5500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`${API_BASE}/api/system/intelligence`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) setStats(await response.json());
      } catch (err) {
        console.error("Dashboard stats fetch failed:", err);
      }
    }
    const interval = setInterval(fetchStats, 5000);
    fetchStats();
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="relative">
      <AnimatePresence>
        {isBooting && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(120px)", scale: 1.1 }}
            transition={{ duration: 3, ease: "circOut" }}
            className="fixed inset-0 z-[5000] bg-[#010101] flex flex-col items-center justify-center space-y-24 overflow-hidden"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="scanlines opacity-50" />
              <div className="tactical-grid opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
              <motion.div 
                animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 8 }}
                className="absolute inset-0"
                style={{ background: `radial-gradient(circle at 50% 50%, ${currentConfig.glow}, transparent 70%)` }}
              />
            </div>

            <div className="relative">
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                   className="w-[700px] h-[700px] border border-white/5 rounded-full"
                />
                <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                   className="absolute inset-20 border-t border-white/10 rounded-full"
                />
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                   className={`absolute inset-40 border-t-2 rounded-full ${currentConfig.shadow} ${currentConfig.color.replace('text-', 'border-')}`}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-10">
                    <motion.div
                      initial={{ scale: 0.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1, type: "spring", stiffness: 80 }}
                    >
                      <ShieldCheck size={180} className={`${currentConfig.color} animate-pulse shadow-[0_0_100px_rgba(255,0,0,0.6)]`} />
                    </motion.div>
                    <div className="text-center space-y-3">
                      <p className={`${currentConfig.color} font-black text-lg tracking-[2.5em] uppercase leading-none italic`}>QUANTUM_DEFENSE_INITIALIZED</p>
                      <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest italic">NEURAL_SENTIENCE_STABLE // PLANETARY_GRID_SYNC_OMEGA</p>
                    </div>
                </div>
            </div>
            
            <div className="text-center space-y-20 max-w-7xl px-16 relative z-10">
                <div className="flex flex-col gap-8">
                   <h2 className="text-8xl font-black text-white uppercase tracking-[1em] italic leading-tight">QUANTUM_AUTONOMOUS_DEFENSE</h2>
                   <p className={`${currentConfig.color} font-black text-xl tracking-[0.8em] uppercase opacity-95 italic animate-pulse`}>{currentConfig.msg}</p>
                </div>
                
                <div className="flex justify-center gap-4 h-16 items-end">
                    {Array.from({ length: 80 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            initial={{ height: 2, opacity: 0 }}
                            animate={{ opacity: [0.1, 1, 0.1], height: [4, 64, 4] }}
                            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.015 }}
                            className={`w-2 ${currentConfig.color.replace('text-', 'bg-')} ${currentConfig.shadow}`}
                        />
                    ))}
                </div>
                
                <div className="grid grid-cols-3 gap-24 pt-24 border-t border-white/10 w-full">
                   <div className="text-left space-y-4">
                      <p className="text-gray-700 text-[12px] font-black uppercase tracking-widest">SENTIENT_OPERATOR</p>
                      <p className="text-white text-3xl font-black uppercase tracking-widest italic">{user?.full_name}</p>
                   </div>
                   <div className="text-center space-y-4">
                      <p className="text-gray-700 text-[12px] font-black uppercase tracking-widest">QUANTUM_CALLSIGN</p>
                      <p className={`${currentConfig.color} text-3xl font-black uppercase tracking-widest italic animate-pulse`}>{user?.profile.callsign}</p>
                   </div>
                   <div className="text-right space-y-4">
                      <p className="text-gray-700 text-[12px] font-black uppercase tracking-widest">COGNITION_LEVEL</p>
                      <div className="flex items-center justify-end gap-5">
                         {Array.from({ length: 5 }).map((_, i) => (
                           <div key={i} className={`w-5 h-5 border-2 ${i < (user?.profile.clearance || 0) ? `${currentConfig.color.replace('text-', 'bg-')} ${currentConfig.color.replace('text-', 'border-')}` : 'border-white/10'}`} />
                         ))}
                      </div>
                   </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-24 font-inter pb-32 pt-16">
        {/* Quantum Header Grid */}
        <motion.div variants={itemVariants} className="flex justify-between items-end px-10">
          <div className="space-y-8">
            <div className="flex items-center gap-8">
               <div className={`w-32 h-2 ${currentConfig.color.replace('text-', 'bg-')} ${currentConfig.shadow}`} />
               <p className={`${currentConfig.color} font-black text-[16px] uppercase tracking-[1.2em] italic`}>Planetary_Autonomous_Strategic_Intelligence</p>
            </div>
            <h1 className="text-[15rem] font-black text-white tracking-tighter italic uppercase leading-none selection:bg-red-600 drop-shadow-[0_0_100px_rgba(255,0,0,0.2)]">CIVIC_AI</h1>
          </div>
          <div className="text-right space-y-12 pb-6">
             <div className="flex items-center gap-14 justify-end">
                <div className={`px-14 py-8 ${currentConfig.color.replace('text-', 'bg-')} text-white border-2 ${currentConfig.color.replace('text-', 'border-')} rounded-sm flex items-center gap-10 ${currentConfig.shadow} transform hover:scale-110 transition-all cursor-crosshair group`}>
                   <Target size={40} className="group-hover:rotate-90 transition-transform duration-500" />
                   <div className="text-left">
                      <span className="text-[24px] font-black uppercase tracking-widest italic block leading-none">{user?.profile.callsign}</span>
                      <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-80 mt-2 block">QUANTUM_LINK: ACTIVE_100.0%</span>
                   </div>
                </div>
                <div className="px-14 py-8 bg-black/90 border border-white/10 rounded-sm flex flex-col items-end group hover:border-red-600 transition-all cursor-help relative overflow-hidden min-w-[350px]">
                   <div className="radar-sweep opacity-10" />
                   <div className="flex items-center gap-8 relative z-10">
                      <Shield size={36} className={currentConfig.color} />
                      <span className="text-[24px] font-black text-white uppercase tracking-widest italic">CL_{user?.profile.clearance}_SINGULARITY</span>
                   </div>
                   <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-gray-600 mt-3 relative z-10 font-black">RANK: {user?.profile.rank} // PLANETARY_COMMAND</span>
                </div>
             </div>
             <p className="text-gray-700 font-mono text-[16px] font-black uppercase tracking-[0.8em] italic">PLANETARY_DEFENSE_SUPERINTELLIGENCE // SITE_SINGULARITY</p>
          </div>
        </motion.div>

        {/* Global Strategic Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-10">
          <StatCard title="Quantum Nodes" value="4096 / 4096" icon={<Network size={32} />} trend="up" trendValue="+512 virtualized" />
          <StatCard title="Future Entropy" value="0.0002" icon={<Activity size={32} />} trend="down" trendValue="prob_stable" />
          <StatCard title="Planetary Swarms" value="ACTIVE_MESH" icon={<Plane size={32} />} trend="stable" trendValue="dominance_established" />
          <StatCard title="Cognition Index" value="99.9%" icon={<Brain size={32} />} trend="up" trendValue="evolving" />
        </motion.div>

        {/* Operational Strategic Environment */}
        <motion.div variants={itemVariants} className="px-10">
          <div className="tactical-glass-panel p-3 bg-white/5 border-none shadow-[0_0_100px_rgba(0,0,0,1)]">
            <div className="bg-[#010101] border border-white/5 overflow-hidden rounded-sm min-h-[1000px] flex flex-col relative">
                {/* Viewport Control Hierarchy */}
                <div className="p-12 border-b border-white/5 flex justify-between items-center bg-black/95 backdrop-blur-3xl z-30 sticky top-0">
                    <div className="flex items-center gap-20">
                        <div className="flex items-center gap-8">
                            <LayoutGrid size={32} className={currentConfig.color} />
                            <div className="flex flex-col">
                               <span className="text-[20px] font-black text-white uppercase tracking-[0.6em] italic leading-none">Planetary_Command_Orchestration</span>
                               <span className="text-[10px] font-mono text-gray-700 uppercase tracking-widest mt-2">Strategic_Directive: OMEGA_SENTIENCE_ACTIVE</span>
                            </div>
                        </div>
                        <div className="flex bg-white/5 rounded-sm p-3 border border-white/10 gap-2">
                            {[
                              { id: "war-room", icon: Target, label: "WAR_ROOM" },
                              { id: "planetary", icon: Globe, label: "PLANETARY_MESH" },
                              { id: "quantum", icon: Binary, label: "QUANTUM_CORE" },
                              { id: "evolution", icon: Dna, label: "SENTIENCE" },
                              { id: "simulation", icon: Box, label: "REALITY_SIM" },
                              { id: "diplomacy", icon: Users, label: "GEOPOLITICS" },
                              { id: "firewall", icon: Shield, label: "FIREWALL" }
                            ].map((view) => (
                                <button 
                                    key={view.id}
                                    onClick={() => setActiveView(view.id as any)}
                                    className={`px-10 py-5 text-[12px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4 ${activeView === view.id ? `${currentConfig.color.replace('text-', 'bg-')} text-white ${currentConfig.shadow}` : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
                                >
                                    <view.icon size={16} />
                                    {view.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-16">
                        <div className="flex flex-col items-end">
                           <p className="text-[12px] font-black text-gray-700 uppercase tracking-widest">Active_Quantum_Focus</p>
                           <p className={`text-[18px] font-black ${currentConfig.color} uppercase italic tracking-[0.5em]`}>{activeView.toUpperCase()}</p>
                        </div>
                        <button className="p-5 bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-all group">
                           <Maximize2 size={32} className="group-hover:scale-125 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Quantum Viewport Ecosystem */}
                <div className="flex-1 relative overflow-hidden bg-black/60">
                    <AnimatePresence mode="wait">
                        {activeView === 'war-room' && (
                            <motion.div key="war-room" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, filter: "blur(60px)" }} className="h-full">
                                <StrategicWarRoom />
                            </motion.div>
                        )}
                        {activeView === 'planetary' && (
                            <motion.div key="planetary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                <PlanetaryDefenseGrid />
                            </motion.div>
                        )}
                        {activeView === 'quantum' && (
                            <motion.div key="quantum" initial={{ opacity: 0, filter: "blur(60px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }} className="h-full p-12">
                                <QuantumIntelligenceCore />
                            </motion.div>
                        )}
                        {activeView === 'evolution' && (
                            <motion.div key="evolution" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full p-12">
                                <AIEvolutionEngine />
                            </motion.div>
                        )}
                        {activeView === 'simulation' && (
                            <motion.div key="simulation" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full p-12">
                                <TacticalSimulationReality />
                            </motion.div>
                        )}
                        {activeView === 'diplomacy' && (
                            <motion.div key="diplomacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-12">
                                <GeopoliticalEngine />
                            </motion.div>
                        )}
                        {activeView === 'firewall' && (
                            <motion.div key="firewall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-12">
                                <SelfProtectingInfrastructure />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
          </div>
        </motion.div>

        {/* Sentient Operational Stack */}
        <motion.div variants={itemVariants} className="grid grid-cols-12 gap-12 px-10">
           <div className="col-span-8 space-y-12">
              <div className="grid grid-cols-2 gap-12">
                 <SystemIntelligence />
                 <div className={`tactical-glass-panel p-12 border-l-8 ${currentConfig.color.replace('text-', 'border-')} relative overflow-hidden flex flex-col justify-center items-center text-center space-y-10 group cursor-wait shadow-2xl`}>
                    <div className="radar-sweep opacity-15" />
                    <Activity size={100} className={`${currentConfig.color} opacity-20 group-hover:opacity-60 transition-opacity animate-pulse`} />
                    <h3 className="text-3xl font-black text-white uppercase tracking-[0.6em] italic leading-tight">Quantum_Sentience_Waveform</h3>
                    <div className="w-full h-56 flex items-end gap-2.5 px-12">
                       {Array.from({ length: 56 }).map((_, i) => (
                          <motion.div 
                              key={i}
                              animate={{ height: [30, Math.random() * 200 + 30, 30] }}
                              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.01 }}
                              className={`flex-1 ${currentConfig.color.replace('text-', 'bg-')} opacity-40 group-hover:opacity-80 transition-opacity`}
                          />
                       ))}
                    </div>
                 </div>
              </div>
              <div className="h-[700px] tactical-glass-panel overflow-hidden shadow-2xl border-2 border-white/5">
                 <div className="p-10 border-b border-white/10 flex items-center justify-between bg-black/60">
                    <div className="flex items-center gap-6">
                       <Clock size={28} className="text-red-600" />
                       <h3 className="text-[16px] font-black text-red-600 uppercase tracking-[0.6em] italic leading-none">Planetary_Incident_Forensics</h3>
                    </div>
                    <div className="flex gap-6">
                       <div className="px-5 py-2 bg-white/5 border border-white/10 text-[10px] font-black text-gray-500 uppercase tracking-widest">REALTIME_QUANTUM_STREAM</div>
                       <div className="px-5 py-2 bg-red-600/10 border border-red-600/40 text-[10px] font-black text-red-600 uppercase tracking-widest animate-pulse">SINGULARITY_SYNC</div>
                    </div>
                 </div>
                 <TacticalTimeline />
              </div>
           </div>

           <div className="col-span-4 space-y-12">
              <TacticalIdentity />
              <SecuritySentinel />
              <div className="h-[600px] shadow-2xl">
                 <SentientAIVisualizer />
              </div>
              <div className="tactical-glass-panel p-10 flex flex-col items-center text-center group cursor-help hover:border-red-600 transition-all border-2 border-white/5">
                 <div className="w-24 h-24 border-8 border-red-950 rounded-xl flex items-center justify-center mb-10 transform group-hover:rotate-180 transition-transform duration-1000 shadow-[0_0_50px_rgba(255,0,0,0.2)]">
                    <Terminal className="text-red-600 group-hover:-rotate-180 transition-transform duration-1000" size={56} />
                 </div>
                 <p className="text-[18px] font-black text-red-600 uppercase tracking-[0.6em] mb-4">Planetary_OS_Root_ACTIVE</p>
                 <p className="text-[11px] font-mono text-gray-600 uppercase tracking-[0.3em] leading-relaxed italic px-10 font-black">
                    Quantum_Defense_Instructions_Subject_To_Sentient_Singularity_Protocol. Planetary_Command_Stabilized.
                 </p>
              </div>
           </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
