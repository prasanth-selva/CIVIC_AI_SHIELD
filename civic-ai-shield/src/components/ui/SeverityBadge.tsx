import { motion } from "framer-motion";

interface SeverityBadgeProps {
  level: "critical" | "high" | "medium" | "low" | "safe";
  animated?: boolean;
}

export function SeverityBadge({ level, animated = false }: SeverityBadgeProps) {
  const styles = {
    critical: "bg-red-600 text-white border-red-400 glow-red",
    high: "bg-red-950/40 text-red-500 border-red-500/30",
    medium: "bg-orange-950/20 text-orange-500 border-orange-500/20",
    low: "bg-blue-950/20 text-blue-500 border-blue-500/20",
    safe: "bg-green-950/20 text-green-500 border-green-500/20",
  };

  const labels = {
    critical: "CRITICAL",
    high: "HIGH_RISK",
    medium: "MEDIUM",
    low: "LOW",
    safe: "SAFE",
  };

  const badge = (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border transition-all ${styles[level as keyof typeof styles] || styles.high}`}
    >
      {(animated || level === "critical") && (
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-1.5 h-1.5 rounded-full mr-2 bg-current"
        />
      )}
      {labels[level as keyof typeof labels] || level.toUpperCase()}
    </span>
  );

  return animated && (level === "high" || level === "critical") ? (
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

