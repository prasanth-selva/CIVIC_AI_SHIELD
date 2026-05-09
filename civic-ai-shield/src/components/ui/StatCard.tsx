import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { ReactNode, useEffect } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
}

export function StatCard({ title, value, icon, trend, trendValue }: StatCardProps) {
  const trendColor =
    trend === "up" ? "text-red-400" : trend === "down" ? "text-gray-500" : "text-gray-500";

  const numericValue = typeof value === "number" ? value : Number.parseFloat(String(value).replace(/[^\d.]/g, ""));
  const suffix = typeof value === "string" ? String(value).replace(/[\d.]/g, "") : "";
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => `${latest.toFixed(numericValue % 1 === 0 ? 0 : 1)}${suffix}`);

  useEffect(() => {
    if (Number.isNaN(numericValue)) return;
    const controls = animate(count, numericValue, { duration: 2, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [count, numericValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ 
        y: -10, 
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(255, 0, 0, 0.15)" 
      }}
      className="group relative glass-panel-heavy p-8 border-l-2 border-red-950/50 hover:border-red-600 transition-all duration-500 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-red-600 to-transparent" />
      <div className="radar-sweep opacity-0 group-hover:opacity-5 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">
              {Number.isNaN(numericValue) ? value : <motion.span>{rounded}</motion.span>}
            </h3>
          </div>
          {icon && (
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-red-600 opacity-40 group-hover:opacity-100 group-hover:text-glow-red transition-all duration-500"
            >
              {icon}
            </motion.div>
          )}
        </div>

        {trend && trendValue && (
          <div className="flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded-sm bg-red-950/20 border border-red-500/10 text-[9px] font-black uppercase tracking-widest ${trendColor}`}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
            </div>
            <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "65%" }}
                 transition={{ duration: 1.5, delay: 0.5 }}
                 className="h-full bg-red-600/40" 
               />
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl -z-0 group-hover:bg-red-600/10 transition-all duration-700" />
    </motion.div>
  );
}

