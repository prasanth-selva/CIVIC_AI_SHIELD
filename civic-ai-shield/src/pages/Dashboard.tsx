import { motion } from "framer-motion";
import { StatCard } from "../components/ui/StatCard";
import { CameraFeed } from "../components/ui/CameraFeed";
import { SeverityBadge } from "../components/ui/SeverityBadge";
import { Camera, AlertTriangle, Activity, Wifi } from "lucide-react";

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

export default function Dashboard() {
  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Real-time surveillance and threat monitoring system</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Cameras" value="847" icon={<Camera size={24} />} trend="up" trendValue="+12 this month" />
        <StatCard title="Active Streams" value="124" icon={<Wifi size={24} />} trend="stable" trendValue="98.7% uptime" />
        <StatCard title="Alerts Today" value="37" icon={<AlertTriangle size={24} />} trend="down" trendValue="-23% vs yesterday" />
        <StatCard title="System Health" value="98.7%" icon={<Activity size={24} />} trend="up" trendValue="All systems nominal" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">Live Threat Detection</h2>
          <CameraFeed threat="Violence Detected" confidence={94} location="Warehouse A - Section 2" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-2xl"
        >
          <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="p-3 bg-black/40 rounded-lg border border-white/10 hover:border-cyan-500/30 transition">
              <p className="text-gray-400 text-sm mb-1">Online Cameras</p>
              <p className="text-2xl font-bold text-cyan-400">824 / 847</p>
              <p className="text-xs text-gray-500 mt-1">97.3% operational</p>
            </div>
            <div className="p-3 bg-black/40 rounded-lg border border-white/10 hover:border-cyan-500/30 transition">
              <p className="text-gray-400 text-sm mb-1">Avg Response Time</p>
              <p className="text-2xl font-bold text-green-400">2.3 sec</p>
              <p className="text-xs text-gray-500 mt-1">Detection to alert</p>
            </div>
            <div className="p-3 bg-black/40 rounded-lg border border-white/10 hover:border-cyan-500/30 transition">
              <p className="text-gray-400 text-sm mb-1">Detection Accuracy</p>
              <p className="text-2xl font-bold text-green-400">98.2%</p>
              <p className="text-xs text-gray-500 mt-1">AI model performance</p>
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
