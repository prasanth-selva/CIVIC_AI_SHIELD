import { motion } from "framer-motion";
import { Bell, Shield, Circle, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

export default function TopNav({ role }: { role: "ADMIN" | "OPERATOR" | "VIEWER" }) {
  const { user } = useAuth();
  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="col-span-2 flex items-center justify-between px-8 bg-black/20 backdrop-blur-2xl border-b border-cyan-500/10 h-[70px]"
    >
      <motion.div className="flex items-center gap-3 font-bold text-xl">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <Shield className="text-cyan-400" size={28} />
        </motion.div>
        <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Civic AI Shield
        </span>
      </motion.div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex flex-col items-end text-right mr-2">
          <TimeDisplay />
        </div>

        <motion.div className="flex items-center gap-2 text-sm text-green-400">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Circle size={8} fill="currentColor" />
          </motion.div>
          <span>System Online</span>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 hover:bg-white/5 rounded-lg transition"
        >
          <Bell size={20} className="text-gray-300 hover:text-cyan-400" />
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
          />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-white/5 rounded-lg transition"
        >
          <Settings size={20} className="text-gray-300 hover:text-cyan-400" />
        </motion.button>

        <motion.div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400">{user?.full_name}</p>
            <p className="text-[11px] uppercase tracking-widest text-cyan-400">{role}</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold cursor-pointer"
          >
            {user?.full_name
              ?.split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() ?? "CS"}
          </motion.div>
        </motion.div>
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
    <>
      <span className="text-lg font-bold text-white leading-none tracking-wider font-mono">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
      <span className="text-xs text-cyan-400/80 font-medium tracking-wide uppercase">
        {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    </>
  )
}
