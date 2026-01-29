import { motion } from "framer-motion";
import { LayoutDashboard, Video, Film, Bell, HeartPulse, Settings, LogOut } from "lucide-react";
import { useState } from "react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "live", label: "Live Detection", icon: Video },
  { key: "analysis", label: "Video Analysis", icon: Film },
  { key: "alerts", label: "Alerts & History", icon: Bell },
  { key: "health", label: "System Health", icon: HeartPulse },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ setPage }: { setPage: (p: string) => void }) {
  const [active, setActive] = useState("dashboard");

  const containerVariants = {
    hidden: { x: -260 },
    visible: {
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.aside
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="row-start-2 w-[260px] bg-black/30 backdrop-blur-2xl border-r border-cyan-500/10 p-6 flex flex-col"
    >
      <motion.div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Navigation</p>
        <nav className="space-y-2">
          {navItems.map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              variants={itemVariants}
              onClick={() => {
                setActive(key);
                setPage(key);
              }}
              whileHover={{ x: 6 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition group"
            >
              <motion.div
                animate={{
                  color: active === key ? "#22d3ee" : "#9ca3af",
                }}
                transition={{ duration: 0.3 }}
              >
                <Icon size={18} />
              </motion.div>

              <span
                className={`font-medium transition ${
                  active === key ? "text-cyan-400" : "text-gray-400 group-hover:text-gray-200"
                }`}
              >
                {label}
              </span>

              {active === key && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-lg bg-cyan-500/10 border border-cyan-500/30 -z-10"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </nav>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-auto pt-6 border-t border-white/10"
      >
        <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition rounded-lg w-full hover:bg-red-500/5">
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </motion.div>
    </motion.aside>
  );
}
