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
import { Camera, AlertTriangle, Activity, Zap, Globe, ShieldAlert, LayoutGrid, Maximize2, Crosshair, Target, Brain, Shield, Terminal, Search, Network, Map, Dna, Plane, Cpu, ShieldCheck, Wifi, History, TrendingUp, ChevronRight, MessageSquare, AlertCircle, Trash2, Edit3, Save, Play, Square, Pause, SkipBack, SkipForward, Volume2, Settings, User, Bell, LogOut, Lock, Unlock, Eye, EyeOff, Key, Fingerprint, Mic, Smartphone, Info, HelpCircle, MoreHorizontal, ExternalLink, RefreshCw, Layers, Hash, Thermometer, Database, Server, Clock, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";
import { TacticalIdentity, SecuritySentinel } from "../components/ui/TacticalIdentity";

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
  const [activeView, setActiveView] = useState<"war-room" | "city" | "mesh" | "brain" | "swarm" | "forensics" | "infra">("war-room");
  const [selectedCam, setSelectedCam] = useState("cam-001");
  const [stats, setStats] = useState<any>(null);

  // Role-Specific Configuration
  const roleConfigs: Record<string, { color: string; shadow: string; msg: string; glow: string }> = {
    COMMANDER: { 
      color: "text-red-600", 
      shadow: "shadow-[0_0_60px_rgba(255,0,0,0.6)]", 
      glow: "rgba(255,0,0,0.1)",
      msg: "FULL_STRATEGIC_AUTHORIZATION_ACTIVE // GLOBAL_BATTLEFIELD_INTELLIGENCE_LOCKED" 
    },
    STRATEGIC_OPS: { 
      color: "text-orange-500", 
      shadow: "shadow-[0_0_60px_rgba(249,115,22,0.6)]", 
      glow: "rgba(249,115,22,0.1)",
      msg: "STRATEGIC_LOGISTICS_MESH_STABLE // SWARM_COORDINATION_SYNCED" 
    },
    FIELD_CONTROL: { 
      color: "text-blue-500", 
      shadow: "shadow-[0_0_60px_rgba(59,130,246,0.6)]", 
      glow: "rgba(59,130,246,0.1)",
      msg: "BATTLESPACE_DIGITAL_TWIN_ONLINE // FIELD_UNIT_ORCHESTRATION" 
    },
    ANALYST: { 
      color: "text-emerald-500", 
      shadow: "shadow-[0_0_60px_rgba(16,185,129,0.6)]", 
      glow: "rgba(16,185,129,0.1)",
      msg: "STRATEGIC_FORENSIC_PATTERN_GHOST_MODE // INTELLIGENCE_CHAIN_SECURE" 
    },
    OBSERVER: { 
      color: "text-gray-400", 
      shadow: "shadow-[0_0_60px_rgba(156,163,175,0.6)]", 
      glow: "rgba(156,163,175,0.1)",
      msg: "PASSIVE_INTELLIGENCE_RECON_ACTIVE // GUEST_ACCESS_ONLY" 
    },
  };

  const currentConfig = roleConfigs[user?.role || "OBSERVER"];
  const accentColor = currentConfig.color.replace('text-', '');

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 4500);
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
            exit={{ opacity: 0, filter: "blur(100px)", scale: 1.1 }}
            transition={{ duration: 2.5, ease: "circOut" }}
            className="fixed inset-0 z-[5000] bg-[#020202] flex flex-col items-center justify-center space-y-20 overflow-hidden"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="scanlines opacity-40" />
              <div className="tactical-grid opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
              <motion.div 
                animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 6 }}
                className="absolute inset-0"
                style={{ background: `radial-gradient(circle at 50% 50%, ${currentConfig.glow}, transparent 70%)` }}
              />
            </div>

            <div className="relative">
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                   className="w-[600px] h-[600px] border border-white/5 rounded-full"
                />
                <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                   className="absolute inset-16 border-t border-white/10 rounded-full"
                />
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                   className={`absolute inset-32 border-t-2 rounded-full ${currentConfig.shadow} ${currentConfig.color.replace('text-', 'border-')}`}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
                    >
                      <ShieldCheck size={140} className={`${currentConfig.color} animate-pulse shadow-[0_0_80px_rgba(255,0,0,0.4)]`} />
                    </motion.div>
                    <div className="text-center space-y-2">
                      <p className={`${currentConfig.color} font-black text-sm tracking-[2em] uppercase leading-none`}>AUTONOMOUS_BATTLEFIELD_ACTIVE</p>
                      <p className="text-white/20 font-mono text-[9px] uppercase tracking-widest italic">NEURAL_SYNC_SUCCESS // OMEGA_ENCRYPTION_STABLE</p>
                    </div>
                </div>
            </div>
            
            <div className="text-center space-y-16 max-w-6xl px-12 relative z-10">
                <div className="flex flex-col gap-6">
                   <h2 className="text-7xl font-black text-white uppercase tracking-[0.8em] italic leading-tight">INITIALIZING_GLOBAL_INTELLIGENCE_MESH</h2>
                   <p className={`${currentConfig.color} font-black text-lg tracking-[0.6em] uppercase opacity-90 italic`}>{currentConfig.msg}</p>
                </div>
                
                <div className="flex justify-center gap-3 h-12 items-end">
                    {Array.from({ length: 64 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            initial={{ height: 2, opacity: 0 }}
                            animate={{ opacity: [0.1, 1, 0.1], height: [4, 48, 4] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.02 }}
                            className={`w-1.5 ${currentConfig.color.replace('text-', 'bg-')} ${currentConfig.shadow}`}
                        />
                    ))}
                </div>
                
                <div className="grid grid-cols-3 gap-16 pt-16 border-t border-white/10 w-full">
                   <div className="text-left space-y-3">
                      <p className="text-gray-700 text-[11px] font-black uppercase tracking-widest">OPERATOR_ACCESS</p>
                      <p className="text-white text-2xl font-black uppercase tracking-widest italic">{user?.full_name}</p>
                   </div>
                   <div className="text-center space-y-3">
                      <p className="text-gray-700 text-[11px] font-black uppercase tracking-widest">OPERATIONAL_CALLSIGN</p>
                      <p className={`${currentConfig.color} text-2xl font-black uppercase tracking-widest italic animate-pulse`}>{user?.profile.callsign}</p>
                   </div>
                   <div className="text-right space-y-3">
                      <p className="text-gray-700 text-[11px] font-black uppercase tracking-widest">CLEARANCE_LEVEL</p>
                      <div className="flex items-center justify-end gap-4">
                         {Array.from({ length: 5 }).map((_, i) => (
                           <div key={i} className={`w-4 h-4 border ${i < (user?.profile.clearance || 0) ? `${currentConfig.color.replace('text-', 'bg-')} ${currentConfig.color.replace('text-', 'border-')}` : 'border-white/10'}`} />
                         ))}
                      </div>
                   </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-16 font-inter pb-20 pt-10">
        {/* ASWIG Global Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-end px-4">
          <div className="space-y-6">
            <div className="flex items-center gap-6">
               <div className={`w-24 h-1.5 ${currentConfig.color.replace('text-', 'bg-')} ${currentConfig.shadow}`} />
               <p className={`${currentConfig.color} font-black text-[14px] uppercase tracking-[1em] italic`}>Autonomous_Battlefield_Intelligence_Grid</p>
            </div>
            <h1 className="text-[12rem] font-black text-white tracking-tighter italic uppercase leading-none selection:bg-red-600">CIVIC_AI</h1>
          </div>
          <div className="text-right space-y-8 pb-4">
             <div className="flex items-center gap-10 justify-end">
                <div className={`px-10 py-6 ${currentConfig.color.replace('text-', 'bg-')} text-white border-2 ${currentConfig.color.replace('text-', 'border-')} rounded-sm flex items-center gap-8 ${currentConfig.shadow} transform hover:scale-105 transition-transform cursor-crosshair`}>
                   <Target size={32} />
                   <div className="text-left">
                      <span className="text-[18px] font-black uppercase tracking-widest italic block">{user?.profile.callsign}</span>
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-80">NEURAL_LINK: ACTIVE_99.999%</span>
                   </div>
                </div>
                <div className="px-10 py-6 bg-black/80 border border-white/10 rounded-sm flex flex-col items-end group hover:border-red-600 transition-all cursor-help relative overflow-hidden">
                   <div className="radar-sweep opacity-5" />
                   <div className="flex items-center gap-6 relative z-10">
                      <Shield size={28} className={currentConfig.color} />
                      <span className="text-[18px] font-black text-white uppercase tracking-widest italic">CL_{user?.profile.clearance}_OMEGA</span>
                   </div>
                   <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-gray-600 mt-2 relative z-10">RANK: {user?.profile.rank}</span>
                </div>
             </div>
             <p className="text-gray-700 font-mono text-[14px] uppercase tracking-[0.6em] italic">GLOBAL_DEFENSE_MESH // 0X_SEC_ALPHA // NODE_OMEGA</p>
          </div>
        </motion.div>

        {/* Global Strategic Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 px-4">
          <StatCard title="Intelligence Nodes" value="512/512" icon={<Network size={28} />} trend="up" trendValue="+14 federated" />
          <StatCard title="Conflict Escalation" value="LOW_THRES" icon={<Activity size={28} />} trend="down" trendValue="0.002% prob" />
          <StatCard title="Autonomous Swarms" value="24_ACTIVE" icon={<Plane size={28} />} trend="stable" trendValue="monitoring" />
          <StatCard title="Grid Connectivity" value="100.0%" icon={<Wifi size={28} />} trend="up" trendValue="optimal_sync" />
        </motion.div>

        {/* Operational Strategic Environment */}
        <motion.div variants={itemVariants} className="px-4">
          <div className="tactical-glass-panel p-2 bg-white/5 border-none">
            <div className="bg-[#020202] border border-white/5 overflow-hidden rounded-sm min-h-[900px] flex flex-col relative">
                {/* Viewport Control Hierarchy */}
                <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/90 backdrop-blur-3xl z-20 sticky top-0">
                    <div className="flex items-center gap-16">
                        <div className="flex items-center gap-6">
                            <LayoutGrid size={28} className={currentConfig.color} />
                            <div className="flex flex-col">
                               <span className="text-[16px] font-black text-white uppercase tracking-[0.5em] italic">Battlespace_Orchestration</span>
                               <span className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">Mission_Directive: ALPHA_SHIELD_ACTIVE</span>
                            </div>
                        </div>
                        <div className="flex bg-white/5 rounded-sm p-2 border border-white/5 gap-1">
                            {[
                              { id: "war-room", icon: Target, label: "WAR_ROOM" },
                              { id: "mesh", icon: Globe, label: "GLOBAL_MESH" },
                              { id: "city", icon: Map, label: "DIGITAL_TWIN" },
                              { id: "brain", icon: Brain, label: "SAWI_AI" },
                              { id: "swarm", icon: Plane, label: "SWARM_CTRL" },
                              { id: "forensics", icon: History, label: "FORENSICS" },
                              { id: "infra", icon: Cpu, label: "INFRA_HEAL" }
                            ].map((view) => (
                                <button 
                                    key={view.id}
                                    onClick={() => setActiveView(view.id as any)}
                                    className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeView === view.id ? `${currentConfig.color.replace('text-', 'bg-')} text-white ${currentConfig.shadow}` : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
                                >
                                    <view.icon size={14} />
                                    {view.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-12">
                        <div className="flex flex-col items-end">
                           <p className="text-[11px] font-black text-gray-700 uppercase tracking-widest">Active_Intelligence_Focus</p>
                           <p className={`text-[14px] font-black ${currentConfig.color} uppercase italic tracking-[0.4em]`}>{activeView.toUpperCase()}</p>
                        </div>
                        <button className="p-4 bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-all group">
                           <Maximize2 size={24} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* ASWIG Viewport Ecosystem */}
                <div className="flex-1 relative overflow-hidden bg-black/40">
                    <AnimatePresence mode="wait">
                        {activeView === 'war-room' && (
                            <motion.div key="war-room" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, filter: "blur(40px)" }} className="h-full">
                                <StrategicWarRoom />
                            </motion.div>
                        )}
                        {activeView === 'mesh' && (
                            <motion.div key="mesh" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full p-8">
                                <GlobalDefenseMesh />
                            </motion.div>
                        )}
                        {activeView === 'city' && (
                            <motion.div key="city" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                <DigitalTwinCity />
                            </motion.div>
                        )}
                        {activeView === 'brain' && (
                            <motion.div key="brain" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full">
                                <AIBattlefieldBrain />
                            </motion.div>
                        )}
                        {activeView === 'swarm' && (
                            <motion.div key="swarm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-8">
                                <SwarmSurveillance />
                            </motion.div>
                        )}
                        {activeView === 'forensics' && (
                            <motion.div key="forensics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="h-full p-8">
                                <ForensicEngine />
                            </motion.div>
                        )}
                        {activeView === 'infra' && (
                            <motion.div key="infra" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-8">
                                <InfrastructureMonitor />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
          </div>
        </motion.div>

        {/* Global Operational Stack */}
        <motion.div variants={itemVariants} className="grid grid-cols-12 gap-10 px-4">
           <div className="col-span-8 space-y-10">
              <div className="grid grid-cols-2 gap-10">
                 <SystemIntelligence />
                 <div className={`tactical-glass-panel p-10 border-l-4 ${currentConfig.color.replace('text-', 'border-')} relative overflow-hidden flex flex-col justify-center items-center text-center space-y-8 group cursor-wait`}>
                    <div className="radar-sweep opacity-10" />
                    <Activity size={80} className={`${currentConfig.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
                    <h3 className="text-2xl font-black text-white uppercase tracking-[0.5em] italic leading-tight">Neural_Activity_Waveform</h3>
                    <div className="w-full h-48 flex items-end gap-2 px-10">
                       {Array.from({ length: 48 }).map((_, i) => (
                          <motion.div 
                              key={i}
                              animate={{ height: [20, Math.random() * 160 + 20, 20] }}
                              transition={{ repeat: Infinity, duration: 1, delay: i * 0.02 }}
                              className={`flex-1 ${currentConfig.color.replace('text-', 'bg-')} opacity-30 group-hover:opacity-60 transition-opacity`}
                          />
                       ))}
                    </div>
                 </div>
              </div>
              <div className="h-[600px] tactical-glass-panel overflow-hidden">
                 <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-[12px] font-black text-red-600 uppercase tracking-[0.4em] italic">Tactical_Incident_Timeline</h3>
                    <div className="flex gap-4">
                       <div className="px-3 py-1 bg-white/5 border border-white/10 text-[8px] font-mono text-gray-500 uppercase tracking-widest">LIVE_STREAM</div>
                       <div className="px-3 py-1 bg-red-600/10 border border-red-600/30 text-[8px] font-mono text-red-600 uppercase tracking-widest">SYNC_OMEGA</div>
                    </div>
                 </div>
                 <TacticalTimeline />
              </div>
           </div>

           <div className="col-span-4 space-y-10">
              <TacticalIdentity />
              <SecuritySentinel />
              <div className="h-[400px]">
                 <AIConsciousnessLayer />
              </div>
              <div className="tactical-glass-panel p-8 flex flex-col items-center text-center group cursor-help">
                 <div className="w-20 h-20 border-4 border-red-950 rounded-lg flex items-center justify-center mb-6 transform group-hover:rotate-45 transition-transform duration-700">
                    <Terminal className="text-red-600 group-hover:-rotate-45 transition-transform duration-700" size={40} />
                 </div>
                 <p className="text-[14px] font-black text-red-600 uppercase tracking-[0.4em] mb-3">Kernel_Auth_Active</p>
                 <p className="text-[9px] font-mono text-gray-600 uppercase tracking-[0.2em] leading-relaxed italic px-6">
                    All_Tactical_Instructions_Subject_To_SAWI_Protocol_X9. Strategic_Command_Infrastructure_Stabilized.
                 </p>
              </div>
           </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
