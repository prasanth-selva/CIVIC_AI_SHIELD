import { motion, AnimatePresence } from "framer-motion";
import { StatCard } from "../components/ui/StatCard";
import { CameraFeed } from "../components/ui/CameraFeed";
import { SeverityBadge } from "../components/ui/SeverityBadge";
import { AIConfidenceChart } from "../components/ui/AIConfidenceChart";
import { TacticalReplay } from "../components/ui/TacticalReplay";
import { SystemIntelligence } from "../components/ui/SystemIntelligence";
import { SubjectCard } from "../components/ui/SubjectCard";
import { Camera, AlertTriangle, Activity, Wifi, Globe, Map, Target, Crosshair, Grid, Maximize2, LayoutGrid, ShieldCheck, Zap } from "lucide-react";
import Globe3D from "../components/Globe3D";
import { PredictiveHeatmap } from "../components/ui/PredictiveHeatmap";
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
  const [activeView, setActiveView] = useState<"grid" | "focus" | "replay">("grid");
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
    async function fetchStats() {
      try {
        const response = await fetch(`${API_BASE}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    }
    if (token) fetchStats();
  }, [token]);

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-10 font-inter pb-20">
      {/* Tactical Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-0.5 bg-red-600" />
             <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em]">Strategic_Inference_Hub</p>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none">Command_Shield_Alpha</h1>
        </div>
        <div className="text-right">
           <div className="flex items-center gap-4 justify-end mb-4">
              <div className="px-4 py-2 bg-red-950/20 border border-red-500/20 rounded-sm flex items-center gap-3">
                 <div className="w-2 h-2 bg-red-600 rounded-full animate-ping shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                 <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Neural_Sync: High</span>
              </div>
              <div className="px-4 py-2 bg-black/40 border border-white/5 rounded-sm flex items-center gap-3">
                 <ShieldCheck size={14} className="text-green-500" />
                 <span className="text-[10px] font-black text-green-500 uppercase tracking-widest italic">Encrypted_Link_0x82</span>
              </div>
           </div>
           <p className="text-gray-600 font-mono text-[10px] uppercase tracking-widest">Sector: Global_Strategic_Axis // 40.7128° N, 74.0060° W</p>
        </div>
      </motion.div>

      {/* Top Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Strategic Nodes" value={stats.total_cameras} icon={<Camera size={20} />} trend={stats.trends.cameras as any} trendValue="+12 active" />
        <StatCard title="Neural Threads" value={stats.active_streams} icon={<Zap size={20} />} trend={stats.trends.streams as any} trendValue="98.7% uptime" />
        <StatCard title="Active Threats" value={stats.alerts_today} icon={<AlertTriangle size={20} />} trend={stats.trends.alerts as any} trendValue="-23% risk" />
        <StatCard title="System Integrity" value={stats.system_health} icon={<Activity size={20} />} trend={stats.trends.health as any} trendValue="Nominal" />
      </motion.div>

      {/* Multi-Camera Orchestration & Replay */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="hud-border p-0.5">
            <div className="corner-tl" /> <div className="corner-tr" /> <div className="corner-bl" /> <div className="corner-br" />
            <div className="bg-black/60 backdrop-blur-3xl border border-white/5 overflow-hidden rounded-sm min-h-[600px] flex flex-col">
                {/* Control Bar */}
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <LayoutGrid size={16} className="text-red-600" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Tactical_Orchestrator</span>
                        </div>
                        <div className="flex bg-white/5 rounded-sm p-1">
                            <button 
                                onClick={() => setActiveView("grid")}
                                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'grid' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >Grid</button>
                            <button 
                                onClick={() => setActiveView("focus")}
                                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'focus' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >Focus</button>
                            <button 
                                onClick={() => setActiveView("replay")}
                                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${activeView === 'replay' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >Replay</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-mono text-red-600/60 uppercase">Node_ID: {selectedCam}</span>
                        <div className="w-px h-4 bg-white/10" />
                        <button className="text-gray-500 hover:text-white transition-colors"><Maximize2 size={16} /></button>
                    </div>
                </div>

                {/* Viewport */}
                <div className="flex-1 relative">
                    <AnimatePresence mode="wait">
                        {activeView === 'grid' && (
                            <motion.div 
                                key="grid"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                className="grid grid-cols-2 h-full gap-1 p-1 bg-white/5"
                            >
                                {["cam-001", "cam-002", "cam-003", "cam-004"].map((id) => (
                                    <div 
                                        key={id} 
                                        onClick={() => { setSelectedCam(id); setActiveView("focus"); }}
                                        className={`relative group cursor-pointer border border-white/5 hover:border-red-600/50 transition-all ${selectedCam === id ? 'ring-1 ring-red-600/50' : ''}`}
                                    >
                                        <CameraFeed compact cameraId={id} />
                                        <div className="absolute top-4 left-4 z-10 px-2 py-0.5 bg-black/60 text-[8px] font-black text-white uppercase tracking-widest border border-white/10 group-hover:bg-red-600 transition-colors">
                                            {id} // LIVE
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                        {activeView === 'focus' && (
                            <motion.div 
                                key="focus"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="h-full"
                            >
                                <CameraFeed threat="Subject Tracking" confidence={98.2} location="Main Lobby - Sector Axis" cameraId={selectedCam} />
                            </motion.div>
                        )}
                        {activeView === 'replay' && (
                            <motion.div 
                                key="replay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full"
                            >
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

        {/* Tactical Intel Panel */}
        <div className="space-y-6">
            <motion.div
                variants={itemVariants}
                className="glass-panel-heavy p-8 border-l-2 border-red-600 relative overflow-hidden"
            >
                <div className="radar-sweep opacity-5" />
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                    <Target size={18} className="text-red-600" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Target_Intelligence</h3>
                    </div>
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse glow-red" />
                </div>
                
                <div className="space-y-4">
                    <SubjectCard 
                        id="S-4921-X" 
                        label="PERSON_DETECTED" 
                        confidence={0.94} 
                        lastSeen="SEC_01_NORTH" 
                        threatScore={82} 
                        status="alert" 
                    />
                    <SubjectCard 
                        id="S-0021-B" 
                        label="VEHICLE_TRACKED" 
                        confidence={0.88} 
                        lastSeen="SEC_03_GATE" 
                        threatScore={45} 
                        status="tracking" 
                    />
                </div>

                <div className="mt-8 p-4 bg-red-950/20 border border-red-900/30 rounded-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity size={12} className="text-red-500" />
                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Active_Tracking_Queue</p>
                    </div>
                    <p className="text-[10px] text-gray-500 italic">4 potential threats identified in sectors Alpha through Gamma. Maintaining surveillance lock.</p>
                </div>
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="glass-panel p-8 border-l-2 border-red-950"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Map size={18} className="text-red-600" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Strategic_Map</h3>
                    </div>
                </div>
                <div className="h-[300px] relative rounded-sm overflow-hidden border border-white/5">
                    <PredictiveHeatmap />
                </div>
            </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
