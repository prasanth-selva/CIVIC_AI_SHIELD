import { motion } from "framer-motion";
import { AlertTriangle, Wifi, WifiOff } from "lucide-react";

interface CameraFeedProps {
  threat?: string;
  confidence?: number;
  location?: string;
  online?: boolean;
  fps?: number;
}

export function CameraFeed({
  threat = "Violence Detected",
  confidence = 94,
  location = "Live stream from Warehouse A",
  online = true,
  fps = 30,
}: CameraFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      <motion.div
        animate={{
          boxShadow: online
            ? [
                "0 0 0 0 rgba(239, 68, 68, 0)",
                "0 0 30px 10px rgba(239, 68, 68, 0.3)",
                "0 0 0 0 rgba(239, 68, 68, 0)",
              ]
            : "0 0 0 0 rgba(100, 116, 139, 0)",
        }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute inset-0 rounded-2xl"
      />

      <div
        className={`aspect-video bg-black/80 rounded-2xl border-2 relative overflow-hidden backdrop-blur-xl ${
          online ? "border-red-500/50" : "border-gray-700/50"
        }`}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "linear",
            repeatDelay: 0.5,
          }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <AlertTriangle className="text-red-500/40" size={64} />
          </motion.div>
          <p className="text-gray-500 mt-4 text-sm">{location}</p>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-4 left-4 flex items-center gap-2"
        >
          {online ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              <Wifi className="text-green-400" size={16} />
            </motion.div>
          ) : (
            <WifiOff className="text-red-400" size={16} />
          )}
          <span className="text-xs font-semibold text-gray-300">{online ? "LIVE" : "OFFLINE"}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-4 right-4 text-xs text-gray-400"
        >
          {fps} FPS
        </motion.div>

        {online && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-4 left-4 bg-gradient-to-r from-red-600/90 to-red-700/90 backdrop-blur-md px-3 py-2 rounded-lg border border-red-500/50 flex items-center gap-2"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 bg-red-300 rounded-full"
            />
            <span className="text-sm font-semibold">{threat}</span>
            <span className="text-xs text-red-200 ml-2">{confidence}%</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
