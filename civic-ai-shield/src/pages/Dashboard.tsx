import { motion } from "framer-motion";
import { StatCard } from "../components/ui/StatCard";
import { CameraFeed } from "../components/ui/CameraFeed";
import { SeverityBadge } from "../components/ui/SeverityBadge";
import { AIConfidenceChart } from "../components/ui/AIConfidenceChart";
import { Camera, AlertTriangle, Activity, Wifi, Globe } from "lucide-react";
import Globe3D from "../components/Globe3D";

const mockAlerts = [
  { id: 1, threat: "Fight Detected", location: "Main Entrance", time: "2 min ago", severity: "high" as const },
  { id: 2, threat: "Suspicious Loitering", location: "Parking Area", time: "15 min ago", severity: "medium" as const },
  { id: 3, threat: "Fall Detection", location: "Building A", time: "42 min ago", severity: "high" as const },
];

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

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
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Real-time surveillance and threat monitoring system</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Cameras" value={stats.total_cameras} icon={<Camera size={24} />} trend={stats.trends.cameras as any} trendValue="+12 this month" />
        <StatCard title="Active Streams" value={stats.active_streams} icon={<Wifi size={24} />} trend={stats.trends.streams as any} trendValue="98.7% uptime" />
        <StatCard title="Alerts Today" value={stats.alerts_today} icon={<AlertTriangle size={24} />} trend={stats.trends.alerts as any} trendValue="-23% vs yesterday" />
        <StatCard title="System Health" value={stats.system_health} icon={<Activity size={24} />} trend={stats.trends.health as any} trendValue="All systems nominal" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Live Threat Detection</h2>
            <CameraFeed threat="Violence Detected" confidence={94} location="Warehouse A - Section 2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-2xl relative overflow-hidden h-[400px]">
                <div className="absolute top-6 left-6 z-10">
                    <h3 className="text-lg font-bold text-white">Global Threat Intelligence</h3>
                    <p className="text-gray-400 text-xs">Real-time node status & anomaly distribution</p>
                </div>
                <div className="absolute inset-0 pt-12">
                    <Globe3D />
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10 pointer-events-none">
                    <div className="space-y-1">
                        <p className="text-cyan-400 font-mono text-xs">SCANNING_PROTOCOL: ACTIVE</p>
                        <p className="text-white/40 font-mono text-[10px]">COORDINATES: 28.6139° N, 77.2090° E</p>
                    </div>
                    <div className="text-right">
                        <div className="flex gap-2 justify-end mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        </div>
                        <p className="text-red-400 font-bold text-xs">3 ACTIVE THREATS</p>
                    </div>
                </div>
            </div>
            <AIConfidenceChart />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-2xl flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Current Threat Status</h3>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="text-center p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
              <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Detected Threat</p>
              <p className="text-2xl font-bold text-white mb-2">Violence Detected</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30 text-red-300 text-xs font-semibold">
                <Activity size={12} />
                <span>Action Required</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                <p className="text-gray-400 text-xs mb-1">Confidence</p>
                <div className="text-xl font-bold text-cyan-400">94%</div>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                <p className="text-gray-400 text-xs mb-1">Severity</p>
                <div className="flex justify-center">
                  <SeverityBadge level="high" animated />
                </div>
              </div>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
              <p className="text-gray-400 text-xs mb-1">Timestamp</p>
              <p className="text-lg font-mono text-white tracking-widest">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Active Alerts</h2>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-red-500"
          >
            <AlertTriangle size={20} />
          </motion.div>
        </div>

        <div className="space-y-3">
          {mockAlerts.map((alert, idx) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-cyan-500/20 transition group"
            >
              <div className="flex-1">
                <p className="font-semibold text-white group-hover:text-cyan-400 transition">{alert.threat}</p>
                <p className="text-sm text-gray-400">{alert.location}</p>
              </div>
              <div className="flex items-center gap-3">
                <SeverityBadge level={alert.severity} animated={alert.severity === "high"} />
                <p className="text-xs text-gray-500 whitespace-nowrap">{alert.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
