import { motion } from "framer-motion";
import { SeverityBadge } from "../components/ui/SeverityBadge";
import { Upload, Play, Download, BarChart3 } from "lucide-react";
import { useState } from "react";

const analysisResults = [
  { time: "00:00:15", threat: "Fight Detected", conf: "92.50%", severity: "high" as const },
  { time: "00:00:30", threat: "Suspicious Loitering", conf: "78.10%", severity: "medium" as const },
  { time: "00:00:45", threat: "Object Left Behind", conf: "85.30%", severity: "high" as const },
  { time: "00:01:10", threat: "Crowd Gathering", conf: "65.00%", severity: "medium" as const },
  { time: "00:01:25", threat: "Normal Activity", conf: "99.10%", severity: "low" as const },
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

export default function VideoAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-white mb-2">Video Analysis</h1>
        <p className="text-gray-400">Upload and analyze video files with advanced AI threat detection</p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="group relative bg-gradient-to-br from-black/40 to-black/20 border-2 border-dashed border-cyan-500/30 rounded-2xl p-12 text-center backdrop-blur-2xl hover:border-cyan-500/50 transition cursor-pointer overflow-hidden"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-cyan-500/5 to-transparent" />

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="relative z-10 mb-4"
        >
          <Upload className="w-16 h-16 text-cyan-400 mx-auto opacity-80 group-hover:opacity-100 transition" />
        </motion.div>

        <p className="text-2xl font-bold text-white mb-2 relative z-10">Upload Video</p>
        <p className="text-gray-400 mb-6 relative z-10">Drag & drop your video file or click to browse</p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAnalyzing(true)}
          className="relative z-10 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition"
        >
          Select Video File
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Supported Formats", value: "MP4, MOV, AVI, MKV" },
          { label: "Max File Size", value: "2 GB" },
          { label: "Processing Time", value: "~2-3 min per hour" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-xl p-4 backdrop-blur-xl text-center"
          >
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-lg font-semibold text-cyan-400">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
              <BarChart3 className="text-green-400" size={24} />
            </motion.div>
            <div>
              <p className="font-bold text-green-300">Analysis in Progress</p>
              <p className="text-sm text-green-200/80">Processing video: sample_video.mp4</p>
            </div>
          </div>
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-green-500/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-green-500 to-green-400"
            />
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={24} />
          Analysis Results
        </h2>
        <p className="text-gray-400 mb-6">Detailed breakdown of detected threats in the video</p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="overflow-x-auto bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl backdrop-blur-2xl"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-500/20">
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Timestamp</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Threat Detected</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Confidence</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Severity</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {analysisResults.map((row, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-4 text-white font-mono text-sm">{row.time}</td>
                  <td className="px-6 py-4 text-white">{row.threat}</td>
                  <td className="px-6 py-4">
                    <span className="text-cyan-400 font-semibold font-mono">{row.conf}</span>
                  </td>
                  <td className="px-6 py-4">
                    <SeverityBadge level={row.severity} />
                  </td>
                  <td className="px-6 py-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="p-2 hover:bg-white/10 rounded-lg transition"
                    >
                      <Play size={16} className="text-cyan-400" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex gap-4 justify-center pt-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 rounded-xl font-semibold hover:bg-cyan-500/30 transition"
        >
          <Download size={18} />
          Export Report
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
