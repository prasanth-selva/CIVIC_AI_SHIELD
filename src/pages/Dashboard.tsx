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
import { Camera, AlertTriangle, Activity, Zap, Globe, ShieldAlert, LayoutGrid, Maximize2, Crosshair, Target, Brain, Shield, Terminal, Search, Network, Map, Dna, Plane, Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

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

import { TacticalIdentity, SecuritySentinel } from "../components/ui/TacticalIdentity";

export default function Dashboard() {
  const { user, token } = useAuth();
  const [isBooting, setIsBooting] = useState(true);
  const [activeView, setActiveView] = useState<"war-room" | "city" | "grid" | "replay">("war-room");
  const [selectedCam, setSelectedCam] = useState("cam-001");
  const [stats, setStats] = useState<any>(null);

  // Role-Specific Configuration
  const roleConfigs: Record<string, { color: string; shadow: string; msg: string; glow: string }> = {
    COMMANDER: { 
      color: "text-red-600", 
      shadow: "shadow-[0_0_60px_rgba(255,0,0,0.6)]", 
      glow: "rgba(255,0,0,0.1)",
      msg: "FULL_STRATEGIC_AUTHORIZATION_ACTIVE // COMMAND_NODE_LOCKED" 
    },
    STRATEGIC_OPS: { 
      color: "text-orange-500", 
      shadow: "shadow-[0_0_60px_rgba(249,115,22,0.6)]", 
      glow: "rgba(249,115,22,0.1)",
      msg: "STRATEGIC_LOGISTICS_UPLINK_STABLE // OPS_COORD_SYNCED" 
    },
    FIELD_CONTROL: { 
      color: "text-blue-500", 
      shadow: "shadow-[0_0_60px_rgba(59,130,246,0.6)]", 
      glow: "rgba(59,130,246,0.1)",
      msg: "FIELD_SENSOR_ARRAY_ONLINE // LOCAL_CONTROL_ESTABLISHED" 
    },
    ANALYST: { 
      color: "text-emerald-500", 
      shadow: "shadow-[0_0_60px_rgba(16,185,129,0.6)]", 
      glow: "rgba(16,185,129,0.1)",
      msg: "INTELLIGENCE_PATTERN_ANALYSIS_ACTIVE // FORENSIC_GHOST_MODE" 
    },
    OBSERVER: { 
      color: "text-gray-400", 
      shadow: "shadow-[0_0_60px_rgba(156,163,175,0.6)]", 
      glow: "rgba(156,163,175,0.1)",
      msg: "PASSIVE_OBSERVATION_STREAM_ACTIVE // GUEST_RECON_ONLY" 
    },
  };

  const currentConfig = roleConfigs[user?.role || "OBSERVER"];
  const accentColor = currentConfig.color.replace('text-', '');

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 4000);
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
            exit={{ opacity: 0, filter: "blur(80px)", scale: 1.2 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[5000] bg-[#020202] flex flex-col items-center justify-center space-y-20"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="scanlines opacity-30" />
              <div className="tactical-grid opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
              <motion.div 
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute inset-0"
                style={{ background: `radial-gradient(circle at 50% 50%, ${currentConfig.glow}, transparent 70%)` }}
              />
            </div>

            <div className="relative">
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                   className="w-[500px] h-[500px] border border-white/5 rounded-full"
                />
                <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                   className="absolute inset-12 border-t-2 border-white/10 rounded-full"
                />
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                   className={`absolute inset-24 border-t-4 rounded-full ${currentConfig.shadow} ${currentConfig.color.replace('text-', 'border-')}`}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <ShieldCheck size={120} className={`${currentConfig.color} animate-pulse`} />
                    </motion.div>
                    <div className="text-center space-y-1">
                      <p className={`${currentConfig.color} font-black text-xs tracking-[1.5em] uppercase`}>ACCESS_GRANTED</p>
                      <p className="text-white/20 font-mono text-[8px] uppercase tracking-widest">ENCRYPTION_LEVEL_OMEGA_SECURED</p>
                    </div>
                </div>
            </div>
            
            <div className="text-center space-y-12 max-w-4xl px-8">
                <div className="flex flex-col gap-4">
                   <h2 className="text-6xl font-black text-white uppercase tracking-[0.6em] italic leading-tight">WELCOME_TO_THE_STRATEGIC_WARFARE_GRID</h2>
                   <p className={`${currentConfig.color} font-black text-sm tracking-[0.4em] uppercase opacity-80`}>{currentConfig.msg}</p>
                </div>
                
                <div className="flex justify-center gap-6">
                    {Array.from({ length: 32 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            initial={{ height: 2, opacity: 0 }}
                            animate={{ opacity: [0.1, 1, 0.1], height: [4, 24, 4] }}
                            transition={{ repeat: Infinity, duration: 2, delay: i * 0.04 }}
                            className={`w-1 ${currentConfig.color.replace('text-', 'bg-')} ${currentConfig.shadow}`}
                        />
                    ))}
                </div>
                
                <div className="grid grid-cols-3 gap-12 pt-12 border-t border-white/5 w-full">
                   <div className="text-left space-y-2">
                      <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest">OPERATOR_ID</p>
                      <p className="text-white text-xl font-black uppercase tracking-widest">{user?.full_name}</p>
                   </div>
                   <div className="text-center space-y-2">
                      <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest">CALLSIGN</p>
                      <p className={`${currentConfig.color} text-xl font-black uppercase tracking-widest italic`}>{user?.profile.callsign}</p>
                   </div>
                   <div className="text-right space-y-2">
                      <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest">CLEARANCE_LEVEL</p>
                      <div className="flex items-center justify-end gap-3">
                         {Array.from({ length: 5 }).map((_, i) => (
                           <div key={i} className={`w-3 h-3 border ${i < (user?.profile.clearance || 0) ? `${currentConfig.color.replace('text-', 'bg-')} ${currentConfig.color.replace('text-', 'border-')}` : 'border-white/10'}`} />
                         ))}
                      </div>
                   </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-12 font-inter pb-20">
        {/* ASWIG Global Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-end">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <div className={`w-16 h-1 ${currentConfig.color.replace('text-', 'bg-')} ${currentConfig.shadow}`} />
               <p className={`${currentConfig.color} font-black text-[12px] uppercase tracking-[0.8em] italic`}>Strategic_Warfare_Intelligence_Infrastructure</p>
            </div>
            <h1 className="text-9xl font-black text-white tracking-tighter italic uppercase leading-none">ASWIG_OS</h1>
          </div>
          <div className="text-right space-y-6">
             <div className="flex items-center gap-8 justify-end">
                <div className={`px-8 py-4 ${currentConfig.color.replace('text-', 'bg-')} text-white border ${currentConfig.color.replace('text-', 'border-')} rounded-sm flex items-center gap-6 ${currentConfig.shadow}`}>
                   <Target size={24} />
                   <div className="text-left">
                      <span className="text-[14px] font-black uppercase tracking-widest italic block">{user?.profile.callsign}</span>
                      <span className="text-[8px] font-mono uppercase tracking-widest opacity-60">LINK_STATUS: STABLE_99.9%</span>
                   </div>
                </div>
                <div className="px-8 py-4 bg-black/60 border border-white/5 rounded-sm flex flex-col items-end group hover:border-red-600 transition-all cursor-pointer">
                   <div className="flex items-center gap-4">
                      <Shield size={20} className={currentConfig.color} />
                      <span className="text-[14px] font-black text-white uppercase tracking-widest italic">Clearance_Level_{user?.profile.clearance}</span>
                   </div>
                   <span className="text-[8px] font-mono uppercase tracking-widest text-gray-600 mt-1">RANK: {user?.profile.rank}</span>
                </div>
             </div>
             <p className="text-gray-600 font-mono text-[12px] uppercase tracking-[0.4em] italic">Global_Command_Node // 0X_OMEGA_SEC // SITE_OMEGA</p>
          </div>
        </motion.div>

        {/* Global Strategic Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard title="Mesh Nodes" value={stats?.network?.active_nodes || "..."} icon={<Network size={24} />} trend="up" trendValue="+14 federated" />
          <StatCard title="Cascade Risk" value={stats?.aswig_status?.strategic_intelligence?.cascade_probability || "..."} icon={<Activity size={24} />} trend="down" trendValue="low_risk" />
          <StatCard title="Swarm Units" value="24" icon={<Plane size={24} />} trend="stable" trendValue="active_swarm" />
          <StatCard title="Grid Integrity" value="99.9%" icon={<Shield size={24} />} trend="up" trendValue="optimal" />
        </motion.div>

        {/* Operational Strategic Environment */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-10">
            <div className="hud-border p-1 bg-white/5">
              <div className="corner-tl" /> <div className="corner-tr" /> <div className="corner-bl" /> <div className="corner-br" />
              <div className="bg-[#010101] border border-white/5 overflow-hidden rounded-sm min-h-[750px] flex flex-col relative">
                  {/* Viewport Control Hierarchy */}
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/80 backdrop-blur-3xl z-10">
                      <div className="flex items-center gap-12">
                          <div className="flex items-center gap-5">
                              <LayoutGrid size={24} className={currentConfig.color} />
                              <span className="text-[14px] font-black text-white uppercase tracking-[0.4em] italic">Strategic_Orchestration</span>
                          </div>
                          <div className="flex bg-white/5 rounded-sm p-1.5 border border-white/5">
                              {["war-room", "city", "grid", "replay"].map((view) => (
                                  <button 
                                      key={view}
                                      onClick={() => setActiveView(view as any)}
                                      className={`px-8 py-3 text-[12px] font-black uppercase tracking-widest transition-all ${activeView === view ? `${currentConfig.color.replace('text-', 'bg-')} text-white ${currentConfig.shadow}` : 'text-gray-500 hover:text-white'}`}
                                  >{view}</button>
                              ))}
                          </div>
                      </div>
                      <div className="flex items-center gap-8">
                          <div className="flex flex-col items-end">
                             <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Active_Strategic_Focus</p>
                             <p className={`text-[12px] font-black ${currentConfig.color} uppercase italic tracking-widest`}>{selectedCam}</p>
                          </div>
                          <button className="p-3 bg-white/5 border border-white/10 text-gray-600 hover:text-white transition-all"><Maximize2 size={20} /></button>
                      </div>
                  </div>

                  {/* ASWIG Viewport Ecosystem */}
                  <div className="flex-1 relative overflow-hidden">
                      <AnimatePresence mode="wait">
                          {activeView === 'war-room' && (
                              <motion.div key="war-room" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, filter: "blur(40px)" }} className="h-full">
                                  <StrategicWarRoom />
                              </motion.div>
                          )}
                          {activeView === 'city' && (
                              <motion.div key="city" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                  <DigitalTwinCity />
                              </motion.div>
                          )}
                          {activeView === 'grid' && (
                              <motion.div 
                                  key="grid"
                                  initial={{ opacity: 0, filter: "blur(40px)" }}
                                  animate={{ opacity: 1, filter: "blur(0px)" }}
                                  exit={{ opacity: 0 }}
                                  className="grid grid-cols-2 h-full gap-1 p-1 bg-white/5"
                              >
                                  {["cam-001", "cam-002", "cam-003", "cam-004"].map((id) => (
                                      <div 
                                          key={id} 
                                          onClick={() => { setSelectedCam(id); }}
                                          className={`relative group cursor-pointer border border-white/5 hover:border-red-600 transition-all ${selectedCam === id ? 'ring-4 ring-red-600/50' : ''}`}
                                      >
                                          <CameraFeed compact cameraId={id} />
                                          <div className={`absolute top-10 left-10 z-10 px-6 py-2 bg-black/95 text-[12px] font-black text-white uppercase tracking-[0.4em] border-l-4 ${currentConfig.color.replace('text-', 'border-')} italic`}>
                                              {id} // ASWIG_ACTIVE
                                          </div>
                                      </div>
                                  ))}
                              </motion.div>
                          )}
                          {activeView === 'replay' && (
                              <motion.div key="replay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                  <TacticalReplay cameraId={selectedCam} onClose={() => setActiveView("war-room")} />
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <SystemIntelligence />
              <div className={`glass-panel-heavy p-10 border-l-2 ${currentConfig.color.replace('text-', 'border-')} relative overflow-hidden flex flex-col justify-center items-center text-center space-y-6`}>
                  <div className="radar-sweep opacity-5" />
                  <Activity size={64} className={`${currentConfig.color} opacity-20`} />
                  <h3 className="text-xl font-black text-white uppercase tracking-[0.4em] italic">Realtime_Asymmetric_Telemetry</h3>
                  <div className="w-full h-40 flex items-end gap-1.5 px-8">
                      {Array.from({ length: 64 }).map((_, i) => (
                          <motion.div 
                              key={i}
                              animate={{ height: [15, Math.random() * 120 + 15, 15] }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.02 }}
                              className={`flex-1 ${currentConfig.color.replace('text-', 'bg-')} opacity-40 border-t ${currentConfig.color.replace('text-', 'border-')} opacity-50`}
                          />
                      ))}
                  </div>
              </div>
            </div>
          </div>

          {/* ASWIG Strategic Control Stack */}
          <div className="space-y-10">
              <motion.div variants={itemVariants}>
                  <TacticalIdentity />
              </motion.div>

              <motion.div variants={itemVariants}>
                  <SecuritySentinel />
              </motion.div>

              <motion.div variants={itemVariants} className="h-[500px]">
                  <TacticalTimeline />
              </motion.div>

              <motion.div variants={itemVariants} className="h-[400px]">
                  <AIConsciousnessLayer />
              </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
