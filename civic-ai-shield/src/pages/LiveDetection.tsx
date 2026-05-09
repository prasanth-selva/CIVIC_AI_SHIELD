import { motion } from "framer-motion";
import { CameraStream } from "../components/ui/CameraStream";
import { Shield, Activity, Crosshair, Target, History, Zap } from "lucide-react";

export default function LiveDetection() {
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 font-inter"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2">Live Tactical Feed</p>
          <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Inference_Engine_01</h1>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 glass-panel border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
              Neural Link: Active
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-8">
           <div className="relative group">
              <CameraStream />
              <div className="absolute top-4 left-4 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                 <div className="px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest italic">
                    Live_Inference_Stream
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "GPU Utilization", val: "78.4%", icon: Activity },
                { label: "Stream Latency", val: "14ms", icon: Crosshair },
                { label: "Target Density", val: "MODERATE", icon: Target }
              ].map(stat => (
                <div key={stat.label} className="glass-panel-heavy p-6 border-l-2 border-red-950 hover:border-red-600 transition-all group">
                   <div className="flex items-center gap-4 mb-4">
                      <stat.icon size={18} className="text-red-600 group-hover:text-glow-red transition-all" />
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                   </div>
                   <p className="text-3xl font-black text-white italic tracking-tighter">{stat.val}</p>
                </div>
              ))}
           </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-8">
          <div className="glass-panel-heavy p-8 border-l-2 border-red-600 h-full relative overflow-hidden">
             <div className="radar-sweep opacity-5" />
             <div className="flex items-center gap-4 mb-8">
                <History size={18} className="text-red-600" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Inference_Log</h2>
             </div>

             <div className="space-y-6">
                {[
                  { time: "14:22:01", event: "ENTITY_DETECTED", detail: "PERSON_0x24", severity: "LOW" },
                  { time: "14:21:45", event: "ANOMALY_TRIGGER", detail: "FAST_MOTION", severity: "MED" },
                  { time: "14:21:12", event: "WEAPON_SCAN", detail: "CLEAR", severity: "SAFE" },
                  { time: "14:20:55", event: "FACE_MATCH", detail: "UNKNOWN", severity: "WARN" },
                ].map((log, i) => (
                  <div key={i} className="space-y-2 border-b border-white/5 pb-4 last:border-0">
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-red-500/50">{log.time}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm ${
                           log.severity === 'SAFE' ? 'bg-green-500/10 text-green-500' :
                           log.severity === 'LOW' ? 'bg-blue-500/10 text-blue-500' :
                           log.severity === 'WARN' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                        }`}>{log.severity}</span>
                     </div>
                     <p className="text-[11px] font-black text-white uppercase tracking-widest">{log.event}</p>
                     <p className="text-[9px] text-gray-600 font-mono italic">{log.detail}</p>
                  </div>
                ))}
             </div>

             <div className="mt-8">
                <button className="w-full py-3 bg-red-950/20 border border-red-600/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                   Export Telemetry
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
