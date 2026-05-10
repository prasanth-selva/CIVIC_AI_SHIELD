import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2 } from "lucide-react";

export function CameraFullscreen({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl h-[85vh] bg-black rounded-2xl overflow-hidden border-2 border-red-500/50 shadow-2xl shadow-red-500/20"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-50 bg-black/60 backdrop-blur-lg p-3 rounded-full text-white border border-white/20 hover:border-red-500/60 transition"
            >
              <X size={24} />
            </motion.button>

            {/* Fullscreen Indicator */}
            <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/60 backdrop-blur-lg px-4 py-2 rounded-full border border-cyan-500/40">
              <Maximize2 size={16} className="text-cyan-400" />
              <span className="text-sm text-cyan-400 font-semibold">Fullscreen Mode</span>
            </div>

            {/* Mock Camera Feed */}
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-6xl mb-4"
                >
                  📹
                </motion.div>
                <p className="text-gray-400 text-lg">Live Camera Feed</p>
                <p className="text-gray-500 text-sm">Warehouse A - Section 2</p>
              </div>
            </div>

            {/* AI Scanning Overlay - Vertical */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/30 to-transparent pointer-events-none scan-line"
              animate={{ y: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            />

            {/* AI Scanning Overlay - Horizontal */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            />

            {/* Detection Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-6 left-6 z-40"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(239, 68, 68, 0)",
                    "0 0 30px rgba(239, 68, 68, 0.6)",
                    "0 0 0px rgba(239, 68, 68, 0)",
                  ],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="severity-high bg-red-600/90 backdrop-blur-lg px-6 py-3 rounded-xl border border-red-400/50"
              >
                <p className="text-white font-bold text-lg">Violence Detected</p>
                <p className="text-red-200 text-sm">Confidence: 94%</p>
              </motion.div>
            </motion.div>

            {/* Timestamp */}
            <div className="absolute bottom-6 right-6 z-40 bg-black/60 backdrop-blur-lg px-4 py-2 rounded-lg border border-white/20">
              <p className="text-xs text-gray-400">
                {new Date().toLocaleTimeString()}
              </p>
            </div>

            {/* Corner Borders (UI Enhancement) - Animated Glow */}
            <motion.div
              className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-500/60 pointer-events-none corner-glow"
              animate={{
                opacity: [0.3, 1, 0.3],
                boxShadow: [
                  "0 0 10px rgba(34, 211, 238, 0.2)",
                  "0 0 20px rgba(34, 211, 238, 0.6)",
                  "0 0 10px rgba(34, 211, 238, 0.2)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            />
            <motion.div
              className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-cyan-500/60 pointer-events-none corner-glow"
              animate={{
                opacity: [0.3, 1, 0.3],
                boxShadow: [
                  "0 0 10px rgba(34, 211, 238, 0.2)",
                  "0 0 20px rgba(34, 211, 238, 0.6)",
                  "0 0 10px rgba(34, 211, 238, 0.2)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.3 }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-cyan-500/60 pointer-events-none corner-glow"
              animate={{
                opacity: [0.3, 1, 0.3],
                boxShadow: [
                  "0 0 10px rgba(34, 211, 238, 0.2)",
                  "0 0 20px rgba(34, 211, 238, 0.6)",
                  "0 0 10px rgba(34, 211, 238, 0.2)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.6 }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-500/60 pointer-events-none corner-glow"
              animate={{
                opacity: [0.3, 1, 0.3],
                boxShadow: [
                  "0 0 10px rgba(34, 211, 238, 0.2)",
                  "0 0 20px rgba(34, 211, 238, 0.6)",
                  "0 0 10px rgba(34, 211, 238, 0.2)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.9 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
