import { motion } from "framer-motion";
import { StatCard } from "../components/ui/StatCard";
import { CameraFeed } from "../components/ui/CameraFeed";
import { SeverityBadge } from "../components/ui/SeverityBadge";
import { AIConfidenceChart } from "../components/ui/AIConfidenceChart";
import { Camera, AlertTriangle, Activity, Wifi, Globe, Map, Target, Crosshair } from "lucide-react";
import Globe3D from "../components/Globe3D";
import { PredictiveHeatmap } from "../components/ui/PredictiveHeatmap";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

const mockAlerts = [
  { id: 1, threat: "Aggressive Behavior", location: "Sector 7-G / Entry", time: "2 min ago", severity: "high" as const },
  { id: 2, threat: "Unidentified Entity", location: "Parking Level B", time: "15 min ago", severity: "medium" as const },
  { id: 3, threat: "Critical Hardware Fail", location: "Server Node 04", time: "42 min ago", severity: "high" as const },
];

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
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-10 font-inter">
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2">Tactical Command Overview</p>
          <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Operation_Shield</h1>
        </div>
        <div className="text-right">
          <p className="text-gray-600 font-mono text-[10px] mb-1">LOCAL_TIME: {new Date().toLocaleTimeString()}</p>
          <div className="flex gap-2 justify-end">
             <div className="px-3 py-1 bg-red-950/20 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest">Node: Active</div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Global Nodes" value={stats.total_cameras} icon={<Camera size={20} />} trend={stats.trends.cameras as any} trendValue="+12 deploy" />
        <StatCard title="Neural Streams" value={stats.active_streams} icon={<Wifi size={20} />} trend={stats.trends.streams as any} trendValue="98.7% sync" />
        <StatCard title="Threat Detections" value={stats.alerts_today} icon={<AlertTriangle size={20} />} trend={stats.trends.alerts as any} trendValue="-23% risk" />
        <StatCard title="System Integrity" value={stats.system_health} icon={<Activity size={20} />} trend={stats.trends.health as any} trendValue="Nominal" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="hud-border p-0.5">
            <div className="corner-tl" />
            <div className="corner-tr" />
            <div className="corner-bl" />
            <div className="corner-br" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden rounded-sm">
                <div className="relative h-[500px] border-r border-white/5">
                    <div className="absolute top-8 left-8 z-10">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-0.5 bg-red-600" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Global_Grid</h3>
                        </div>
                        <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold">Inference distribution mapping</p>
                    </div>
                    <div className="absolute inset-0 pt-20">
                        <Globe3D />
                    </div>
                    <div className="radar-sweep opacity-5" />
                    <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-10">
                        <div className="space-y-1">
                            <p className="text-red-500 font-mono text-[9px] font-black">SCAN_LEVEL: 04</p>
                            <p className="text-white/20 font-mono text-[8px]">POS: 40.7° N, 74.0° W</p>
                        </div>
                        <div className="text-right">
                            <div className="flex gap-1 justify-end mb-2">
                                {[1,2,3,4].map(i => <div key={i} className="w-1 h-4 bg-red-600/40" />)}
                            </div>
                            <p className="text-red-600 font-black text-[9px] uppercase tracking-widest">3 Alert Zones</p>
                        </div>
                    </div>
                </div>

                <div className="relative h-[500px] bg-red-950/5">
                    <PredictiveHeatmap />
                </div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">Critical Surveillance Feed</h2>
                <div className="flex-1 h-px bg-white/5" />
             </div>
             <CameraFeed threat="Aggressive Behavior" confidence={94.2} location="Main Lobby - North Axis" />
          </div>

          <AIConfidenceChart />
        </div>

        <motion.div
          variants={itemVariants}
          className="glass-panel-heavy p-8 border-l-2 border-red-600 flex flex-col h-full relative overflow-hidden"
        >
          <div className="radar-sweep opacity-5" />
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
               <Crosshair size={18} className="text-red-600" />
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Active_Lock</h3>
            </div>
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse glow-red" />
          </div>

          <div className="space-y-8 flex-1 flex flex-col justify-center">
            <div className="text-center py-10 bg-red-950/20 rounded-sm border border-red-900/30 relative">
              <div className="absolute top-2 left-2 text-[8px] font-mono text-red-900">ID: THREAT_0842</div>
              <p className="text-gray-500 text-[10px] mb-2 uppercase tracking-[0.2em] font-black">Target Profile</p>
              <p className="text-3xl font-black text-white mb-4 italic tracking-tighter">Violence Detected</p>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest">
                <Target size={14} />
                <span>Engage Response</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-white/5 rounded-sm border border-white/5">
                <p className="text-gray-500 text-[9px] mb-2 uppercase tracking-widest font-black">Confidence</p>
                <div className="text-2xl font-black text-red-500">94.2%</div>
              </div>
              <div className="p-4 bg-white/5 rounded-sm border border-white/5">
                <p className="text-gray-500 text-[9px] mb-2 uppercase tracking-widest font-black">Threat Level</p>
                <div className="flex">
                  <SeverityBadge level="high" animated />
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-sm border border-white/5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1 bg-red-600" />
              <p className="text-gray-500 text-[9px] mb-2 uppercase tracking-widest font-black">System Timestamp</p>
              <p className="text-xl font-mono text-white tracking-widest font-black">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel p-10 border-l-2 border-red-950">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <AlertTriangle size={20} className="text-red-600" />
             <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Recent System Logs</h2>
          </div>
          <div className="h-px w-20 bg-white/5" />
        </div>

        <div className="space-y-4">
          {mockAlerts.map((alert, idx) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-5 bg-black/40 border-l-2 border-white/5 hover:border-red-600 hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="flex items-center gap-6">
                 <div className="w-10 h-10 bg-red-950/20 border border-red-900/30 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                    <Activity size={18} />
                 </div>
                 <div>
                   <p className="font-black text-white uppercase tracking-widest text-sm group-hover:text-red-500 transition-colors">{alert.threat}</p>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{alert.location}</p>
                 </div>
              </div>
              <div className="flex items-center gap-6">
                <SeverityBadge level={alert.severity} animated={alert.severity === "high"} />
                <p className="text-[10px] font-mono text-gray-600 whitespace-nowrap">{alert.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

