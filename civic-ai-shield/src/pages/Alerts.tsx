import { motion } from "framer-motion";
import { SeverityBadge } from "../components/ui/SeverityBadge";
import { AlertTriangle, Clock, MapPin, ChevronRight } from "lucide-react";
import { useState } from "react";

const mockAlerts = [
  { id: 1, type: "Fight Detected", location: "Main Lobby Camera 1", time: "2024-01-29 18:30:15", severity: "high" as const, responded: true },
  { id: 2, type: "Vehicle Loitering", location: "Parking Lot Exit", time: "2024-01-29 09:00:00", severity: "medium" as const, responded: false },
  { id: 3, type: "Object Left Behind", location: "Food Court Area", time: "2024-01-28 10:20:00", severity: "low" as const, responded: true },
  { id: 4, type: "Unauthorized Access", location: "Server Room Door", time: "2024-01-28 23:00:00", severity: "high" as const, responded: false },
  { id: 5, type: "Vandalism in Progress", location: "Building Exterior 3", time: "2024-01-27 11:05:00", severity: "high" as const, responded: true },
  { id: 6, type: "Crowd Gathering", location: "City Square South", time: "2024-01-27 14:15:00", severity: "medium" as const, responded: false },
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

export default function Alerts() {
  const [filter, setFilter] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);

  const filteredAlerts = mockAlerts.filter((a) => {
    if (filter === "high") return a.severity === "high";
    if (filter === "medium") return a.severity === "medium";
    if (filter === "pending") return !a.responded;
    return true;
  });

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-white mb-2">Alerts & History</h1>
        <p className="text-gray-400">Browse and manage all security alerts and incidents</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-3 flex-wrap">
        {[
          { label: "All Alerts", value: "all" },
          { label: "High Priority", value: "high" },
          { label: "Medium Priority", value: "medium" },
          { label: "Pending Response", value: "pending" },
        ].map((btn) => (
          <motion.button
            key={btn.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(btn.value)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === btn.value
                ? "bg-cyan-500/30 border border-cyan-500/50 text-cyan-300"
                : "bg-black/40 border border-white/10 text-gray-300 hover:border-cyan-500/30"
            }`}
          >
            {btn.label}
          </motion.button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        {filteredAlerts.map((alert, idx) => (
          <motion.button
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedAlert(alert.id)}
            className="w-full text-left group"
          >
            <div
              className={`relative bg-gradient-to-r rounded-2xl p-6 backdrop-blur-2xl border transition overflow-hidden ${
                alert.severity === "high"
                  ? "from-red-500/10 to-red-600/5 border-red-500/20 hover:border-red-500/40"
                  : alert.severity === "medium"
                    ? "from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 hover:border-yellow-500/40"
                    : "from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-500/40"
              }`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity bg-gradient-to-r from-transparent via-white/5 to-transparent" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <motion.div
                    animate={{
                      scale: alert.severity === "high" ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ repeat: alert.severity === "high" ? Infinity : undefined, duration: 1.5 }}
                  >
                    <AlertTriangle
                      className={
                        alert.severity === "high"
                          ? "text-red-400"
                          : alert.severity === "medium"
                            ? "text-yellow-400"
                            : "text-green-400"
                      }
                      size={24}
                    />
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <SeverityBadge level={alert.severity} animated={alert.severity === "high"} />
                      {alert.responded && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded border border-green-500/30">
                          Responded
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-white group-hover:text-cyan-400 transition">{alert.type}</p>
                    <div className="flex items-center gap-6 mt-2 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {alert.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {alert.time}
                      </div>
                    </div>
                  </div>
                </div>

                <ChevronRight
                  className="text-gray-400 group-hover:text-cyan-400 transition"
                  size={20}
                />
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {selectedAlert && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-2xl mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {mockAlerts.find((a) => a.id === selectedAlert)?.type}
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setSelectedAlert(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </motion.button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Location</p>
                <p className="text-white font-semibold">
                  {mockAlerts.find((a) => a.id === selectedAlert)?.location}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Severity</p>
                <SeverityBadge
                  level={mockAlerts.find((a) => a.id === selectedAlert)?.severity || "low"}
                  animated
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition"
            >
              View Full Details & Footage
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
