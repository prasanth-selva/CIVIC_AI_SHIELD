import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Activity, Zap, HardDrive, Wifi } from "lucide-react";

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

const systemStatus = [
  { label: "AI Model", status: "active", color: "text-green-400" },
  { label: "Backend Server", status: "active", color: "text-green-400" },
  { label: "Database", status: "active", color: "text-green-400" },
  { label: "Storage", status: "active", color: "text-green-400" },
];

const cameras = [
  { name: "Main Entrance", status: "online", fps: 30, resolution: "4K" },
  { name: "Parking Lot A", status: "offline", fps: 0, resolution: "2K" },
  { name: "Warehouse North", status: "online", fps: 30, resolution: "4K" },
  { name: "Rooftop Cam", status: "online", fps: 25, resolution: "1080p" },
];

export default function SystemHealth() {
  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-white mb-2">System Health & Status</h1>
        <p className="text-gray-400">Monitor AI models, servers, and connected cameras</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Zap, label: "Detection Accuracy", value: "98.2%", color: "text-green-400" },
          { icon: Activity, label: "System Uptime", value: "125 days", color: "text-blue-400" },
          { icon: HardDrive, label: "Storage Used", value: "256 GB / 500 GB", color: "text-yellow-400" },
          { icon: Wifi, label: "Network Speed", value: "980 Mbps", color: "text-cyan-400" },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-2xl hover:border-cyan-500/40 transition"
          >
            <motion.div animate={{ rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="mb-4">
              <Icon className={`${color}`} size={28} />
            </motion.div>
            <p className="text-gray-400 text-sm mb-2">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">System Status</h3>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-2"
          >
            <CheckCircle className="text-green-400" size={24} />
            <span className="text-green-400 font-semibold">All Systems Operational</span>
          </motion.div>
        </div>

        <div className="space-y-3">
          {systemStatus.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/5 hover:border-green-500/30 transition"
            >
              <span className="text-white font-medium">{item.label}</span>
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-2 h-2 bg-green-400 rounded-full"
                />
                <span className={`text-sm font-semibold ${item.color}`}>
                  {item.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-2xl">
        <h3 className="text-2xl font-bold text-white mb-6">Camera Management</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/20">
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Camera Name</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Status</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">FPS</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Resolution</th>
              </tr>
            </thead>
            <tbody>
              {cameras.map((cam, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-4 text-white font-medium">{cam.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {cam.status === "online" ? (
                        <>
                          <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-2 h-2 bg-green-400 rounded-full"
                          />
                          <span className="text-green-400 text-sm font-semibold">Online</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-red-400 rounded-full" />
                          <span className="text-red-400 text-sm font-semibold">Offline</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{cam.fps}</td>
                  <td className="px-6 py-4 text-gray-300">{cam.resolution}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
