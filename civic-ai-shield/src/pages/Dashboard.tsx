import { motion, AnimatePresence } from "framer-motion";
import { StatCard } from "../components/ui/StatCard";
import { CameraFeed } from "../components/ui/CameraFeed";
import { SeverityBadge } from "../components/ui/SeverityBadge";
import { AIConfidenceChart } from "../components/ui/AIConfidenceChart";
import { TacticalReplay } from "../components/ui/TacticalReplay";
import { SystemIntelligence } from "../components/ui/SystemIntelligence";
import { SubjectCard } from "../components/ui/SubjectCard";
import { TacticalCommandMap } from "../components/ui/TacticalCommandMap";
import { IntelligenceEscalationPanel } from "../components/ui/IntelligenceEscalationPanel";
import { TacticalTimeline } from "../components/ui/TacticalTimeline";
import { Camera, AlertTriangle, Activity, Zap, ShieldCheck, LayoutGrid, Maximize2, Crosshair, Target, Brain, Shield, Terminal, Search } from "lucide-react";
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
  const [activeView, setActiveView] = useState<"grid" | "map" | "focus" | "replay">("grid");
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
    const timer = setTimeout(() => setIsBooting(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      <AnimatePresence>
        {isBooting && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[1000] bg-[#020202] flex flex-col items-center justify-center space-y-8"
          >
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
               className="w-24 h-24 border-t-2 border-red-600 rounded-full"
            />
            <div className="text-center space-y-2">
                <h2 className="text-xl font-black text-white uppercase tracking-[0.6em] italic">Initializing_Tactical_OS</h2>
                <div className="flex justify-center gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            className="w-4 h-1 bg-red-600"
                        />
                    ))}
                </div>
                <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest mt-4">AUTH_TOKEN: VERIFIED // K8S_SYNC: 100% // NEURAL_NET: READY</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-10 font-inter pb-20">
        {/* Tactical Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-end">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-0.5 bg-red-600 shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
               <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.6em] italic">Strategic_Command_Infrastructure</p>
            </div>
            <h1 className="text-7xl font-black text-white tracking-tighter italic uppercase leading-none">Civic_Shield_v4.2</h1>
          </div>
          <div className="text-right space-y-4">
             <div className="flex items-center gap-4 justify-end">
                <div className="px-5 py-2 bg-red-950/20 border border-red-600/30 rounded-sm flex items-center gap-3">
                   <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                   <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Autonomous_Mode: ACTIVE</span>
                </div>
                <div className="px-5 py-2 bg-black/40 border border-white/5 rounded-sm flex items-center gap-3 group hover:border-red-600 transition-all cursor-pointer">
                   <ShieldCheck size={14} className="text-green-500" />
                   <span className="text-[10px] font-black text-green-500 uppercase tracking-widest italic">Secure_Uplink</span>
                </div>
             </div>
             <div className="flex flex-col items-end">
                <p className="text-gray-600 font-mono text-[10px] uppercase tracking-widest">Global_Strategic_Grid // NODE_0XFA21</p>
                <p className="text-[8px] font-black text-red-600/40 uppercase tracking-[0.4em] italic mt-1">Projection: MIL-STD-810G</p>
             </div>
          </div>
        </motion.div>

        {/* Top Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Strategic Nodes" value={stats.total_cameras} icon={<Camera size={20} />} trend={stats.trends.cameras as any} trendValue="+12 active" />
          <StatCard title="Neural Threads" value={stats.active_streams} icon={<Zap size={20} />} trend={stats.trends.streams as any} trendValue="98.7% sync" />
          <StatCard title="Active Threats" value={stats.alerts_today} icon={<AlertTriangle size={20} />} trend={stats.trends.alerts as any} trendValue="-23% risk" />
          <StatCard title="System Integrity" value={stats.system_health} icon={<Activity size={20} />} trend={stats.trends.health as any} trendValue="Nominal" />
        </motion.div>

        {/* Main Operational Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="hud-border p-0.5">
              <div className="corner-tl" /> <div className="corner-tr" /> <div className="corner-bl" /> <div className="corner-br" />
              <div className="bg-[#020202] border border-white/5 overflow-hidden rounded-sm min-h-[650px] flex flex-col relative">
                  {/* Digital Overlay HUD Overlay */}
                  <div className="absolute top-20 left-10 pointer-events-none opacity-20 z-50">
                      <div className="text-[10px] font-mono text-red-600 space-y-1">
                          <p>SCAN_MODE: ACTIVE</p>
                          <p>BUFFER_SYNC: 100%</p>
                          <p>LATENCY: 2.4MS</p>
                      </div>
                  </div>

                  {/* Viewport Header */}
                  <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/60 backdrop-blur-xl">
                      <div className="flex items-center gap-8">
                          <div className="flex items-center gap-3">
                              <LayoutGrid size={16} className="text-red-600" />
                              <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">Operational_Orchestrator</span>
                          </div>
                          <div className="flex bg-white/5 rounded-sm p-1">
                              {["grid", "map", "focus", "replay"].map((view) => (
                                  <button 
                                      key={view}
                                      onClick={() => setActiveView(view as any)}
                                      className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeView === view ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(255,0,0,0.4)]' : 'text-gray-500 hover:text-white'}`}
                                  >{view}</button>
                              ))}
                          </div>
                      </div>
                      <div className="flex items-center gap-6">
                          <div className="relative">
                              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                              <input placeholder="NODE_ID..." className="bg-white/5 border border-white/10 rounded-sm pl-10 pr-4 py-1.5 text-[9px] font-black uppercase tracking-widest w-48 focus:border-red-600 outline-none transition-all" />
                          </div>
                          <button className="text-gray-500 hover:text-white transition-colors"><Maximize2 size={16} /></button>
                      </div>
                  </div>

                  {/* Operational Viewport */}
                  <div className="flex-1 relative overflow-hidden">
                      <AnimatePresence mode="wait">
                          {activeView === 'grid' && (
                              <motion.div 
                                  key="grid"
                                  initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                  exit={{ opacity: 0, scale: 1.02 }}
                                  className="grid grid-cols-2 h-full gap-1 p-1 bg-white/5"
                              >
                                  {["cam-001", "cam-002", "cam-003", "cam-004"].map((id) => (
                                      <div 
                                          key={id} 
                                          onClick={() => { setSelectedCam(id); setActiveView("focus"); }}
                                          className={`relative group cursor-pointer border border-white/5 hover:border-red-600/50 transition-all ${selectedCam === id ? 'ring-2 ring-red-600/50' : ''}`}
                                      >
                                          <CameraFeed compact cameraId={id} />
                                          <div className="absolute top-6 left-6 z-10 px-3 py-1 bg-black/80 text-[10px] font-black text-white uppercase tracking-widest border border-white/10 group-hover:bg-red-600 transition-colors italic">
                                              {id} // LIVE_FEED
                                          </div>
                                      </div>
                                  ))}
                              </motion.div>
                          )}
                          {activeView === 'map' && (
                              <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                  <TacticalCommandMap />
                              </motion.div>
                          )}
                          {activeView === 'focus' && (
                              <motion.div key="focus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                  <CameraFeed threat="Target Analysis Active" confidence={98.7} location="Central Axis Sector" cameraId={selectedCam} />
                              </motion.div>
                          )}
                          {activeView === 'replay' && (
                              <motion.div key="replay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                  <TacticalReplay cameraId={selectedCam} onClose={() => setActiveView("focus")} />
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SystemIntelligence />
              <AIConfidenceChart />
            </div>
          </div>

          {/* Right Side Intelligence Stack */}
          <div className="space-y-6">
              <motion.div variants={itemVariants} className="h-[550px]">
                  <IntelligenceEscalationPanel />
              </motion.div>

              <motion.div variants={itemVariants} className="h-[450px]">
                  <TacticalTimeline />
              </motion.div>

              <motion.div
                  variants={itemVariants}
                  className="glass-panel-heavy p-8 border-l-2 border-red-600 relative overflow-hidden"
              >
                  <div className="radar-sweep opacity-5" />
                  <div className="flex items-center gap-3 mb-8">
                      <Target size={18} className="text-red-600" />
                      <h3 className="text-sm font-black text-white uppercase tracking-widest italic">High_Risk_Target_Intel</h3>
                  </div>
                  
                  <div className="space-y-4">
                      <SubjectCard id="X-9921-A" label="UNKNOWN_THREAT" confidence={0.97} lastSeen="SEC_ALPHA_GATE_4" threatScore={92} status="alert" />
                  </div>
              </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
