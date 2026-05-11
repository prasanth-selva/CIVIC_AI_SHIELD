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

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 3000);
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
            exit={{ opacity: 0, filter: "blur(60px)", scale: 1.1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[5000] bg-[#020202] flex flex-col items-center justify-center space-y-16"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="scanlines opacity-20" />
              <div className="tactical-grid opacity-10" />
            </div>

            <div className="relative">
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                   className="w-80 h-80 border border-red-600/10 rounded-full"
                />
                <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                   className="absolute inset-10 border-t-2 border-red-600 rounded-full shadow-[0_0_60px_rgba(255,0,0,0.6)]"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <ShieldCheck size={80} className="text-red-600 animate-pulse" />
                    <p className="text-red-600 font-black text-xs tracking-[1em] uppercase">ACCESS_GRANTED</p>
                </div>
            </div>
            
            <div className="text-center space-y-8">
                <div className="flex flex-col gap-2">
                   <h2 className="text-5xl font-black text-white uppercase tracking-[0.8em] italic">WELCOME_TO_THE_STRATEGIC_WARFARE_GRID</h2>
                   <p className="text-red-600/60 font-black text-sm tracking-[0.5em] uppercase">COMMANDER_CLEARANCE_STABILIZED // SYNCING_MESH_NODES</p>
                </div>
                
                <div className="flex justify-center gap-4">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            initial={{ height: 2 }}
                            animate={{ opacity: [0.1, 1, 0.1], height: [4, 16, 4] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.05 }}
                            className="w-6 bg-red-600 shadow-[0_0_15px_rgba(255,0,0,0.8)]"
                        />
                    ))}
                </div>
                
                <div className="flex items-center justify-center gap-12 pt-8 border-t border-white/5">
                   <div className="text-left">
                      <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest">IDENTIFIED_OPERATOR</p>
                      <p className="text-white text-lg font-black uppercase tracking-widest">{user?.full_name}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest">CLEARANCE_LEVEL</p>
                      <p className="text-red-600 text-lg font-black uppercase tracking-widest italic">{user?.role}</p>
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
               <div className="w-16 h-1 bg-red-600 shadow-[0_0_20px_rgba(255,0,0,0.8)]" />
               <p className="text-red-600 font-black text-[12px] uppercase tracking-[0.8em] italic">Strategic_Warfare_Intelligence_Infrastructure</p>
            </div>
            <h1 className="text-9xl font-black text-white tracking-tighter italic uppercase leading-none">ASWIG_OS</h1>
          </div>
          <div className="text-right space-y-6">
             <div className="flex items-center gap-8 justify-end">
                <div className="px-8 py-3 bg-red-600 text-white border border-red-400 rounded-sm flex items-center gap-4 shadow-[0_0_30px_rgba(255,0,0,0.6)]">
                   <Target size={20} />
                   <span className="text-[14px] font-black uppercase tracking-widest italic">{user?.profile.callsign} // ONLINE</span>
                </div>
                <div className="px-8 py-3 bg-black/60 border border-white/5 rounded-sm flex items-center gap-4 group hover:border-red-600 transition-all cursor-pointer">
                   <Shield size={20} className="text-red-600" />
                   <span className="text-[14px] font-black text-white uppercase tracking-widest italic">Clearance_Level_{user?.profile.clearance}</span>
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
                              <LayoutGrid size={24} className="text-red-600" />
                              <span className="text-[14px] font-black text-white uppercase tracking-[0.4em] italic">Strategic_Orchestration</span>
                          </div>
                          <div className="flex bg-white/5 rounded-sm p-1.5 border border-white/5">
                              {["war-room", "city", "grid", "replay"].map((view) => (
                                  <button 
                                      key={view}
                                      onClick={() => setActiveView(view as any)}
                                      className={`px-8 py-3 text-[12px] font-black uppercase tracking-widest transition-all ${activeView === view ? 'bg-red-600 text-white shadow-[0_0_25px_rgba(255,0,0,0.6)]' : 'text-gray-500 hover:text-white'}`}
                                  >{view}</button>
                              ))}
                          </div>
                      </div>
                      <div className="flex items-center gap-8">
                          <div className="flex flex-col items-end">
                             <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Active_Strategic_Focus</p>
                             <p className="text-[12px] font-black text-red-600 uppercase italic tracking-widest">{selectedCam}</p>
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
                                          <div className="absolute top-10 left-10 z-10 px-6 py-2 bg-black/95 text-[12px] font-black text-white uppercase tracking-[0.4em] border-l-4 border-red-600 italic">
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
              <div className="glass-panel-heavy p-10 border-l-2 border-red-950 relative overflow-hidden flex flex-col justify-center items-center text-center space-y-6">
                  <div className="radar-sweep opacity-5" />
                  <Activity size={64} className="text-red-600/20" />
                  <h3 className="text-xl font-black text-white uppercase tracking-[0.4em] italic">Realtime_Asymmetric_Telemetry</h3>
                  <div className="w-full h-40 flex items-end gap-1.5 px-8">
                      {Array.from({ length: 64 }).map((_, i) => (
                          <motion.div 
                              key={i}
                              animate={{ height: [15, Math.random() * 120 + 15, 15] }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.02 }}
                              className="flex-1 bg-red-600/40 border-t border-red-500/50"
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
