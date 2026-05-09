import { motion } from "framer-motion";
import { LayoutDashboard, Video, Film, Bell, HeartPulse, Settings, LogOut, User, Cpu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "live", label: "Live Detection", icon: Video },
  { key: "tracking", label: "Subject Tracking", icon: User },
  { key: "analysis", label: "Video Analysis", icon: Film },
  { key: "alerts", label: "Alerts & History", icon: Bell },
  { key: "health", label: "System Health", icon: HeartPulse },
  { key: "settings", label: "Settings", icon: Settings },
];

const roleAccess: Record<"ADMIN" | "OPERATOR" | "VIEWER", string[]> = {
  ADMIN: ["dashboard", "live", "tracking", "analysis", "alerts", "health", "settings"],
  OPERATOR: ["dashboard", "live", "tracking"],
  VIEWER: ["dashboard"],
};

export default function Sidebar({
  setPage,
  role,
}: {
  setPage: (p: string) => void;
  role: "ADMIN" | "OPERATOR" | "VIEWER";
}) {
  const [active, setActive] = useState("dashboard");
  const { logout, user } = useAuth();
  const allowed = roleAccess[role];

  const containerVariants = {
    hidden: { x: -300 },
    visible: {
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.aside
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="row-start-2 w-[280px] bg-black/60 backdrop-blur-3xl border-r border-white/5 p-8 flex flex-col z-40 relative"
    >
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-red-600/20 to-transparent" />
      
      <motion.div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-6 px-4">Core_Systems</p>
        <nav className="space-y-1">
          {navItems
            .filter(({ key }) => allowed.includes(key))
            .map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              variants={itemVariants}
              onClick={() => {
                setActive(key);
                setPage(key);
              }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full flex items-center gap-4 px-4 py-3.5 transition-all group"
            >
              <div
                className={`transition-all duration-300 ${
                  active === key ? "text-red-600 text-glow-red" : "text-gray-500 group-hover:text-white"
                }`}
              >
                <Icon size={18} strokeWidth={active === key ? 2.5 : 2} />
              </div>

              <span
                className={`text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                  active === key ? "text-white italic" : "text-gray-500 group-hover:text-gray-300"
                }`}
              >
                {label}
              </span>

              {active === key && (
                <motion.div
                  layoutId="activeNavHUD"
                  className="absolute inset-0 border-l-2 border-red-600 bg-gradient-to-r from-red-600/5 to-transparent -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-red-600/10" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </nav>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-auto space-y-8"
      >
        <div className="px-4 py-6 glass-panel-heavy border-red-600/20 relative overflow-hidden">
           <div className="radar-sweep opacity-5" />
           <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-sm bg-red-950/40 border border-red-600/20 flex items-center justify-center text-red-600">
                 <User size={16} />
              </div>
              <div className="flex-1 overflow-hidden">
                 <p className="text-[10px] text-white font-black truncate uppercase tracking-tighter italic">{user?.full_name}</p>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    <p className="text-[8px] text-red-500 font-black uppercase tracking-[0.2em]">{role}</p>
                 </div>
              </div>
           </div>
           <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "85%" }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="h-full bg-red-600" 
              />
           </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-white transition-all duration-300 group border border-white/5 hover:border-red-600/50 hover:bg-red-600/5 rounded-sm"
        >
          <LogOut size={16} className="group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Terminate_Session</span>
        </button>
      </motion.div>
    </motion.aside>
  );
}

