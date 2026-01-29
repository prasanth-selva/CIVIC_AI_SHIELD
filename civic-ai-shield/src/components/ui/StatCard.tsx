import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
}

export function StatCard({ title, value, icon, trend, trendValue }: StatCardProps) {
  const trendColor =
    trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-gray-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(34, 211, 238, 0.15)" }}
      className="group relative bg-gradient-to-br from-black/40 to-black/20 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-2xl hover:border-cyan-500/40 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-cyan-500/5 to-transparent" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
            <h3 className="text-3xl font-bold text-white">{value}</h3>
          </div>
          {icon && (
            <motion.div
              animate={{ rotate: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity"
            >
              {icon}
            </motion.div>
          )}
        </div>

        {trend && trendValue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xs font-semibold ${trendColor}`}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </motion.div>
        )}
      </div>

      <motion.div
        className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-3xl -z-0 group-hover:bg-cyan-500/10 transition-all"
        animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
      />
    </motion.div>
  );
}
