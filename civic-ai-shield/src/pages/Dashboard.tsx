import { motion, AnimatePresence } from "framer-motion";
import { StatCard } from "../components/ui/StatCard";
import { CameraFeed } from "../components/ui/CameraFeed";
import { SystemIntelligence } from "../components/ui/SystemIntelligence";
import { SubjectCard } from "../components/ui/SubjectCard";
import { TacticalReplay } from "../components/ui/TacticalReplay";
import { Strategic3DMap } from "../components/ui/Strategic3DMap";
import { AICommanderConsole } from "../components/ui/AICommanderConsole";
import { TacticalTimeline } from "../components/ui/TacticalTimeline";
import { Camera, AlertTriangle, Activity, Zap, ShieldCheck, LayoutGrid, Maximize2, Crosshair, Target, Brain, Shield, Terminal, Search, Globe, Network, Map } from "lucide-react";
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

export default function Dashboard() {
  const { token } = useAuth();
  const [isBooting, setIsBooting] = useState(true);
  const [activeView, setActiveView] = useState<"grid" | "3d" | "fabric" | "replay">("grid");
  const [selectedCam, setSelectedCam] = useState("cam-001");
  const [stats, setStats] = useState({
    total_cameras: "847",
    active_streams: "124",
    alerts_today: "37",
    system_health: "98.7%",
    trends: {
        cameras: "up",
        streams: "stable",
        alerts: "down",
        health: "up"
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      <AnimatePresence>
        {isBooting && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(40px)" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[2000] bg-[#020202] flex flex-col items-center justify-center space-y-12"
          >
            <div className="relative">
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                   className="w-48 h-48 border border-red-600/20 rounded-full"
                />
                <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                   className="absolute inset-4 border-t-2 border-red-600 rounded-full shadow-[0_0_30px_rgba(255,0,0,0.4)]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Shield size={48} className="text-red-600 animate-pulse" />
                </div>
            </div>
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-black text-white uppercase tracking-[1em] italic">Civic_Sentient_OS</h2>
                <div className="flex justify-center gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2], height: [4, 8, 4] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                            className="w-6 bg-red-600"
                        />
                    ))}
                </div>
                <p className="text-[10px] font-mono text-gray-700 uppercase tracking-widest mt-6">SYNCHRONIZING_GLOBAL_SURVEILLANCE_FABRIC // VERSION_4.2.0_AUTONOMOUS</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-10 font-inter pb-20">
        {/* Tactical Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-end">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-12 h-0.5 bg-red-600 shadow-[0_0_15px_rgba(255,0,0,0.6)]" />
               <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.6em] italic">Autonomous_Sentient_Defense_Fabric</p>
            </div>
            <h1 className="text-8xl font-black text-white tracking-tighter italic uppercase leading-none">Sentient_Shield</h1>
          </div>
          <div className="text-right space-y-4">
             <div className="flex items-center gap-6 justify-end">
                <div className="px-6 py-2 bg-red-600 text-white border border-red-400 rounded-sm flex items-center gap-3 shadow-[0_0_20px_rgba(255,0,0,0.4)] animate-pulse">
                   <Brain size={16} />
                   <span className="text-[11px] font-black uppercase tracking-widest italic">SENTIENT_OVERRIDE: ACTIVE</span>
                </div>
                <div className="px-6 py-2 bg-black/40 border border-white/5 rounded-sm flex items-center gap-3 group hover:border-red-600 transition-all cursor-pointer">
                   <Network size={16} className="text-red-600" />
                   <span className="text-[11px] font-black text-white uppercase tracking-widest italic">Mesh_Federation: Stable</span>
                </div>
             </div>
             <p className="text-gray-600 font-mono text-[10px] uppercase tracking-widest italic">Global_Strategic_Grid // MESH_NODE_0XFA21 // SITE_ALPHA</p>
          </div>
        </motion.div>

        {/* Distributed Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Regional Nodes" value={stats.total_cameras} icon={<Globe size={20} />} trend={stats.trends.cameras as any} trendValue="+12 active" />
          <StatCard title="Swarm Threads" value={stats.active_streams} icon={<Network size={20} />} trend={stats.trends.streams as any} trendValue="99.2% sync" />
          <StatCard title="Threat Cascades" value={stats.alerts_today} icon={<AlertTriangle size={20} />} trend={stats.trends.alerts as any} trendValue="-23% risk" />
          <StatCard title="Mesh Integrity" value={stats.system_health} icon={<Activity size={20} />} trend={stats.trends.health as any} trendValue="Nominal" />
        </motion.div>

        {/* Global Operational Environment */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="hud-border p-0.5">
              <div className="corner-tl" /> <div className="corner-tr" /> <div className="corner-bl" /> <div className="corner-br" />
              <div className="bg-[#020202] border border-white/5 overflow-hidden rounded-sm min-h-[700px] flex flex-col relative">
                  {/* Viewport Control Bar */}
                  <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/60 backdrop-blur-2xl">
                      <div className="flex items-center gap-10">
                          <div className="flex items-center gap-4">
                              <LayoutGrid size={18} className="text-red-600" />
                              <span className="text-[12px] font-black text-white uppercase tracking-[0.3em] italic">Orchestration_Viewport</span>
                          </div>
                          <div className="flex bg-white/5 rounded-sm p-1 border border-white/5">
                              {["grid", "3d", "fabric", "replay"].map((view) => (
                                  <button 
                                      key={view}
                                      onClick={() => setActiveView(view as any)}
                                      className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${activeView === view ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(255,0,0,0.5)]' : 'text-gray-500 hover:text-white'}`}
                                  >{view}</button>
                              ))}
                          </div>
                      </div>
                      <div className="flex items-center gap-6">
                          <div className="flex flex-col items-end mr-4">
                             <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Selected_Mesh_Node</p>
                             <p className="text-[10px] font-black text-red-600 uppercase italic">{selectedCam}</p>
                          </div>
                          <button className="p-2 bg-white/5 border border-white/5 text-gray-500 hover:text-white transition-colors"><Maximize2 size={18} /></button>
                      </div>
                  </div>

                  {/* Sentient Operational Viewport */}
                  <div className="flex-1 relative overflow-hidden">
                      <AnimatePresence mode="wait">
                          {activeView === 'grid' && (
                              <motion.div 
                                  key="grid"
                                  initial={{ opacity: 0, filter: "blur(20px)" }}
                                  animate={{ opacity: 1, filter: "blur(0px)" }}
                                  exit={{ opacity: 0, scale: 1.05 }}
                                  className="grid grid-cols-2 h-full gap-1 p-1 bg-white/5"
                              >
                                  {["cam-001", "cam-002", "cam-003", "cam-004"].map((id) => (
                                      <div 
                                          key={id} 
                                          onClick={() => { setSelectedCam(id); }}
                                          className={`relative group cursor-pointer border border-white/5 hover:border-red-600/50 transition-all ${selectedCam === id ? 'ring-2 ring-red-600' : ''}`}
                                      >
                                          <CameraFeed compact cameraId={id} />
                                          <div className="absolute top-8 left-8 z-10 px-4 py-1.5 bg-black/90 text-[11px] font-black text-white uppercase tracking-[0.2em] border-l-2 border-red-600 italic">
                                              {id} // MESH_ACTIVE
                                          </div>
                                      </div>
                                  ))}
                              </motion.div>
                          )}
                          {activeView === '3d' && (
                              <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                  <Strategic3DMap />
                              </motion.div>
                          )}
                          {activeView === 'fabric' && (
                              <motion.div key="fabric" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full bg-black/80 flex items-center justify-center p-12">
                                  <div className="text-center space-y-8">
                                      <Globe size={120} className="text-red-600/20 mx-auto animate-pulse" />
                                      <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Global_Surveillance_Fabric_Core</h3>
                                      <div className="grid grid-cols-3 gap-8 max-w-4xl">
                                          {["SITE_ALPHA", "SITE_BRAVO", "EDGE_NORTH"].map(site => (
                                              <div key={site} className="p-8 glass-panel-heavy border-red-600/20 relative overflow-hidden group hover:border-red-600 transition-all">
                                                  <div className="radar-sweep opacity-5" />
                                                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">{site}</p>
                                                  <div className="space-y-4">
                                                      <div className="flex justify-between text-[9px] font-bold text-gray-500"><span>NODES_ACTIVE</span><span className="text-white">12</span></div>
                                                      <div className="flex justify-between text-[9px] font-bold text-gray-500"><span>THREAT_INDEX</span><span className="text-red-500">0.04</span></div>
                                                      <div className="flex justify-between text-[9px] font-bold text-gray-500"><span>MESH_SYNC</span><span className="text-green-500">100%</span></div>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </motion.div>
                          )}
                          {activeView === 'replay' && (
                              <motion.div key="replay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                  <TacticalReplay cameraId={selectedCam} onClose={() => setActiveView("grid")} />
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SystemIntelligence />
              <div className="glass-panel-heavy p-8 border-l-2 border-red-950 flex flex-col justify-center items-center text-center space-y-4">
                  <Activity size={48} className="text-red-600/20" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Realtime_Neural_Telemetry</h3>
                  <div className="w-full h-32 flex items-end gap-1 px-4">
                      {Array.from({ length: 40 }).map((_, i) => (
                          <motion.div 
                              key={i}
                              animate={{ height: [10, Math.random() * 80 + 10, 10] }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.05 }}
                              className="flex-1 bg-red-600/30"
                          />
                      ))}
                  </div>
              </div>
            </div>
          </div>

          {/* Sentient Control Stack */}
          <div className="space-y-6">
              <motion.div variants={itemVariants} className="h-[550px]">
                  <AICommanderConsole />
              </motion.div>

              <motion.div variants={itemVariants} className="h-[450px]">
                  <TacticalTimeline />
              </motion.div>

              <motion.div
                  variants={itemVariants}
                  className="glass-panel-heavy p-8 border-l-2 border-red-600 relative overflow-hidden"
              >
                  <div className="radar-sweep opacity-5" />
                  <div className="flex items-center gap-4 mb-8">
                      <Target size={20} className="text-red-600" />
                      <h3 className="text-[12px] font-black text-white uppercase tracking-widest italic">Autonomous_Target_Priority</h3>
                  </div>
                  
                  <div className="space-y-4">
                      <SubjectCard id="S-9921-ALPHA" label="CRITICAL_ANOMALY" confidence={0.98} lastSeen="MESH_SEC_A" threatScore={96} status="alert" />
                  </div>
              </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
