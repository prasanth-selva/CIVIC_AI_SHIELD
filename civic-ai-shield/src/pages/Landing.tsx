import { motion } from "framer-motion";
import { Shield, ChevronRight, Zap, Eye, Bell } from "lucide-react";

export default function Landing({ onEnter }: { onEnter: () => void }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#050812] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{ repeat: Infinity, duration: 8 }}
          className="absolute top-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{ repeat: Infinity, duration: 8, delay: 2 }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center z-10 px-4"
      >
        <motion.div
          variants={itemVariants}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="mb-8"
        >
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/50 backdrop-blur-xl"
            whileHover={{ scale: 1.1 }}
          >
            <Shield className="w-12 h-12 text-cyan-400" />
          </motion.div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-6xl font-bold mb-4 text-white">
          Civic AI Shield
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Advanced AI-powered public safety monitoring for smart cities. Detect threats in real-time and
          protect communities with cutting-edge computer vision.
        </motion.p>

        <motion.div variants={itemVariants} className="flex gap-6 justify-center mb-12 flex-wrap">
          {[
            { icon: Eye, label: "Real-time Monitoring" },
            { icon: Zap, label: "Instant Detection" },
            { icon: Bell, label: "Smart Alerts" },
          ].map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              whileHover={{ y: -5 }}
              className="flex items-center gap-2 text-gray-300 text-sm"
            >
              <Icon className="text-cyan-400" size={20} />
              {label}
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(34, 211, 238, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onEnter}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative text-white flex items-center gap-2">
            Enter Dashboard
            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </span>
        </motion.button>

        <motion.p variants={itemVariants} className="text-gray-500 text-sm mt-8">
          Version 1.0 — Enterprise Edition
        </motion.p>
      </motion.div>
    </div>
  );
}
