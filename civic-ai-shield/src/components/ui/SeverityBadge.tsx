import { motion } from "framer-motion";

interface SeverityBadgeProps {
  level: "high" | "medium" | "low";
  animated?: boolean;
}

export function SeverityBadge({ level, animated = false }: SeverityBadgeProps) {
  const styles = {
    high: "bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50 hover:bg-yellow-500/30",
    low: "bg-green-500/20 text-green-300 border-green-500/50 hover:bg-green-500/30",
  };

  const labels = {
    high: "High",
    medium: "Medium",
    low: "Safe",
  };

  const badge = (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${styles[level]}`}
    >
      {animated && level === "high" && (
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-1.5 h-1.5 rounded-full mr-2"
          style={{
            background: level === "high" ? "#ef4444" : level === "medium" ? "#f59e0b" : "#10b981",
          }}
        />
      )}
      {labels[level]}
    </span>
  );

  return animated && level === "high" ? (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      {badge}
    </motion.div>
  ) : (
    badge
  );
}
