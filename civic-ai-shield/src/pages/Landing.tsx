import { motion } from "framer-motion";
import { Shield, ChevronRight, Zap, Eye, Bell, Globe, Lock, ShieldCheck } from "lucide-react";
import Shield3D from "../components/Shield3D";

export default function Landing({ onEnter }: { onEnter: () => void }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center overflow-hidden selection:bg-cyan-500/30">
      {/* 3D Background Layer */}
      <div className="absolute inset-0 opacity-60">
        <Shield3D />
      </div>

      {/* Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{ repeat: Infinity, duration: 10 }}
          className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{ repeat: Infinity, duration: 10, delay: 2 }}
          className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
      >
        <div className="text-left space-y-8">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Next-Gen AI Protocol
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              variants={itemVariants}
              className="text-7xl md:text-8xl font-black text-white leading-none tracking-tighter"
            >
              CIVIC <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 animate-gradient">
                AI SHIELD
              </span>
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-400 max-w-lg leading-relaxed font-medium"
            >
              Enterprise-grade threat detection powered by YOLOv8. 
              Safeguarding cities with real-time neural processing and predictive anomaly analysis.
            </motion.p>
          </div>

          <motion.div variants={itemVariants} className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEnter}
              className="px-10 py-5 bg-white text-black font-black rounded-2xl flex items-center gap-3 hover:bg-cyan-50 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              Launch Core Console
              <ChevronRight size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="px-8 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl backdrop-blur-md hover:bg-white/10 transition"
            >
              View Protocols
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-8 pt-4">
             {[
               { icon: Globe, val: "24/7", label: "Active Nodes" },
               { icon: Lock, val: "E2E", label: "Encrypted" },
               { icon: ShieldCheck, val: "99.9%", label: "Accuracy" }
             ].map(({ icon: Icon, val, label }) => (
               <div key={label} className="space-y-1">
                 <div className="flex items-center gap-2 text-white font-bold text-lg">
                    <Icon size={18} className="text-cyan-500" />
                    {val}
                 </div>
                 <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</div>
               </div>
             ))}
          </motion.div>
        </div>

        <div className="hidden lg:block relative">
          {/* Floating Interface Elements */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-0 right-0 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl z-20"
          >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Bell className="text-white" />
                </div>
                <div>
                    <p className="text-white font-bold">Threat Detected</p>
                    <p className="text-gray-400 text-xs">Sector 7G — 0.4s ago</p>
                </div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-10 left-0 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl z-20"
          >
            <div className="space-y-3">
                <p className="text-cyan-400 font-bold text-xs uppercase tracking-widest">Neural Link Active</p>
                <div className="flex gap-2">
                    {[1,2,3,4,5].map(i => (
                        <motion.div 
                            key={i}
                            animate={{ height: [10, 30, 10] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                            className="w-1 bg-cyan-500/50 rounded-full"
                        />
                    ))}
                </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Version & Credits */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-between px-12 items-center pointer-events-none">
          <p className="text-white/20 font-mono text-xs uppercase tracking-widest">CV-OS v2.4.0-STABLE</p>
          <div className="flex gap-4">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <p className="text-white/20 font-mono text-xs uppercase tracking-widest">Neural Cluster: Connected</p>
          </div>
      </div>
    </div>
  );
}
