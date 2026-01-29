import { motion } from "framer-motion";
import { Bell, Shield, Circle } from "lucide-react";

export default function TopNav() {
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

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold cursor-pointer"
        >
          CS
        </motion.div>
      </div>
    </motion.header>
  );
}
