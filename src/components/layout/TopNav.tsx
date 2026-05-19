import { motion } from "framer-motion";
import { Bell, Shield, Circle, Settings, Activity, Command, Zap } from "lucide-react";
import { Role } from "../../context/AuthContext";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

export default function TopNav({ role }: { role: Role }) {
  const { user } = useAuth();
  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="col-span-2 flex items-center justify-between px-10 bg-black/40 backdrop-blur-3xl border-b border-white/5 h-[80px] z-50 relative"
    >
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
      
      <motion.div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-red-950/40 border border-red-500/30 flex items-center justify-center glow-red">
                <Shield className="text-red-600" size={24} />
            </div>
            <div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">Civic_AI_Shield</h1>
                <p className="text-[8px] font-black text-red-600 uppercase tracking-[0.4em]">Tactical_OS_v4.2.0</p>
            </div>
        </div>
        <div className="h-8 w-px bg-white/5 hidden md:block" />
        <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-red-600/10 border border-red-600/30 rounded-sm">
            <Activity size={12} className="text-red-600 animate-pulse" />
            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">EDGE_MODE_ACTIVE</span>
        </div>
      </motion.div>

      <div className="flex items-center gap-8">
        <div className="hidden lg:flex flex-col items-end text-right">
          <TimeDisplay />
        </div>

        <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1, color: "#ef4444" }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 text-gray-500 transition-colors"
            >
              <Bell size={18} />
              <motion.span
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-600 rounded-full glow-red"
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, color: "#ffffff" }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-500 transition-colors"
            >
              <Settings size={18} />
            </motion.button>
        </div>

        <div className="flex items-center gap-4 pl-8 border-l border-white/5">
          <div className="text-right">
            <p className="text-[10px] font-black text-white uppercase tracking-tighter italic">{user?.full_name}</p>
            <div className="flex items-center justify-end gap-2">
                <div className="w-1 h-1 rounded-full bg-red-600" />
                <p className="text-[8px] uppercase tracking-widest text-red-600 font-black">{role}</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white font-black text-xs cursor-pointer border border-red-500/20 shadow-[0_0_20px_rgba(255,0,0,0.1)]">
            {user?.full_name
              ?.split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() ?? "OP"}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function TimeDisplay() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end">
      <span className="text-xl font-black text-white leading-none tracking-tighter font-mono italic">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
      </span>
      <div className="flex items-center gap-2 mt-1">
         <div className="w-1 h-1 rounded-full bg-gray-800" />
         <span className="text-[9px] text-gray-500 font-black tracking-widest uppercase">
            {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
         </span>
      </div>
    </div>
  )
}
