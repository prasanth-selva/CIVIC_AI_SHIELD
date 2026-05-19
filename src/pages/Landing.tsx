import { motion } from "framer-motion";
import { ChevronRight, Shield, Globe, Lock, ShieldCheck, Activity } from "lucide-react";
import Shield3D from "../components/Shield3D";

export default function Landing({ onEnter }: { onEnter: () => void }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const as const },
    },
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden font-inter selection:bg-red-500/30">
      {/* Global Cinematic Overlays */}
      <div className="ambient-red-glow" />
      <div className="scanline-overlay" />
      <div className="film-grain" />

      {/* 3D Background Layer */}
      <div className="absolute inset-0 opacity-40 z-0">
        <Shield3D />
      </div>

      {/* Background Radar Overlay */}
      <div className="absolute -top-1/4 -right-1/4 w-[1000px] h-[1000px] opacity-10 pointer-events-none z-0">
        <div className="radar-sweep" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <div className="text-left space-y-10">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-sm bg-red-950/30 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            Enterprise Security Protocol Active
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              variants={itemVariants}
              className="text-7xl md:text-[100px] font-black text-white leading-[0.9] tracking-tighter"
            >
              CIVIC <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-800 text-glow-red">
                AI SHIELD
              </span>
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-500 max-w-xl leading-relaxed font-medium"
            >
              National-grade threat detection powered by neural processing. 
              Deploying real-time autonomous monitoring and predictive anomaly analysis for high-stakes urban security.
            </motion.p>
          </div>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnter}
              className="btn-cinematic"
            >
              Initialize Command Center
              <ChevronRight size={18} className="inline ml-2" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
              className="px-8 py-3 bg-transparent border border-white/10 text-white font-bold text-sm rounded-sm uppercase tracking-widest transition-all"
            >
              Access Protocols
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-12 pt-6">
             {[
               { icon: Activity, val: "REAL-TIME", label: "Inference Status" },
               { icon: Lock, val: "MIL-SPEC", label: "Encryption" },
               { icon: ShieldCheck, val: "99.98%", label: "System Uptime" }
             ].map(({ icon: Icon, val, label }) => (
               <div key={label} className="space-y-2">
                 <div className="flex items-center gap-3 text-white font-black text-sm tracking-tight">
                    <Icon size={16} className="text-red-600" />
                    {val}
                 </div>
                 <div className="text-gray-600 text-[10px] font-black uppercase tracking-widest">{label}</div>
               </div>
             ))}
          </motion.div>
        </div>

        {/* Right Side Visuals - HUD Elements */}
        <div className="hidden lg:block relative h-[600px] hud-border">
          <div className="corner-tl" />
          <div className="corner-tr" />
          <div className="corner-bl" />
          <div className="corner-br" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
             {/* Holographic HUD UI Element */}
             <div className="w-[80%] h-[60%] glass-panel-heavy p-8 border-l-2 border-red-600 relative overflow-hidden">
                <div className="radar-sweep opacity-20" />
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <p className="text-red-500 font-black text-[10px] tracking-widest uppercase mb-1">Sector Analysis</p>
                      <h3 className="text-2xl font-black text-white italic">DOWNTOWN_AXIS_01</h3>
                   </div>
                   <div className="flex gap-1">
                      {[1,2,3].map(i => <div key={i} className="w-1.5 h-6 bg-red-600/40" />)}
                   </div>
                </div>

                <div className="space-y-6">
                   {[
                     { label: "Neural Load", val: "42.8%", color: "bg-red-600" },
                     { label: "Signal Latency", val: "12ms", color: "bg-red-500" },
                     { label: "Target Density", val: "HIGH", color: "bg-red-800" }
                   ].map(stat => (
                     <div key={stat.label} className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                           <span className="text-gray-500">{stat.label}</span>
                           <span className="text-white">{stat.val}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: "70%" }}
                             transition={{ duration: 2, delay: 1.5 }}
                             className={`h-full ${stat.color}`} 
                           />
                        </div>
                     </div>
                   ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[8px] font-mono text-red-500/50">
                   <span>LAT: 40.7128° N</span>
                   <span>LNG: 74.0060° W</span>
                </div>
             </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Footer Info */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-between px-16 items-center pointer-events-none z-20">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <p className="text-white/20 font-mono text-[9px] uppercase tracking-[0.4em]">SYSTEM_STATUS: OPERATIONAL</p>
          </div>
          <p className="text-white/20 font-mono text-[9px] uppercase tracking-[0.4em]">CAIS_KERNEL_V4.2.0_STABLE</p>
      </div>
    </div>
  );
}

