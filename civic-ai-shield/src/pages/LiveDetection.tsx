import { motion } from "framer-motion";
import { CameraFeed } from "../components/ui/CameraFeed";
import { SeverityBadge } from "../components/ui/SeverityBadge";
import { AlertTriangle, Clock, MapPin, Zap } from "lucide-react";

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

export default function LiveDetection() {
  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-white mb-2">Live Detection</h1>
        <p className="text-gray-400">Real-time AI monitoring and instant threat detection</p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="relative bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl overflow-hidden"
      >
        <div className="absolute inset-0 animate-pulse bg-red-500/5" />
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"
        />
        <div className="relative flex items-start gap-4">
          <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={24} />
          <div>
            <p className="font-bold text-red-300 text-lg">High Severity Alert</p>
            <p className="text-red-200/80 mt-1">Violence detected in Area 01. Immediate law enforcement dispatch recommended.</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold text-white mb-4">Live Camera Feed: Area 01</h2>
        <CameraFeed threat="Violence Detected" confidence={85} location="Warehouse A - Section 2" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-2xl"
        >
          <h3 className="text-xl font-bold text-white mb-6">Detected Threat Analysis</h3>
          <div className="space-y-5">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Threat Type</p>
              <p className="text-2xl font-bold text-white">Fight Detected</p>
              <div className="mt-2 flex items-center gap-2">
                <Zap className="text-red-400" size={16} />
                <span className="text-sm text-red-300">Urgent response required</span>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Confidence Level</p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-cyan-400">85%</p>
                <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-cyan-500/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Severity Assessment</p>
              <SeverityBadge level="high" animated />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-2xl"
        >
          <h3 className="text-xl font-bold text-white mb-6">Camera Status</h3>
          <div className="space-y-5">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Connection Status</p>
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-3 h-3 bg-green-400 rounded-full"
                />
                <p className="text-lg font-semibold text-green-400">Online & Streaming</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Location</p>
              <div className="flex items-start gap-2">
                <MapPin className="text-cyan-400 flex-shrink-0 mt-1" size={18} />
                <div>
                  <p className="font-semibold text-white">Warehouse A - Section 2</p>
                  <p className="text-sm text-gray-400">Zone: High-Traffic Area</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Stream Quality</p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-300 text-sm font-semibold rounded-lg">
                  4K Ultra HD
                </span>
                <span className="text-sm text-gray-400">30 FPS</span>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Detection Timestamp</p>
              <div className="flex items-center gap-2">
                <Clock className="text-gray-400" size={16} />
                <p className="text-sm text-gray-300">Today, 3:45 PM</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
