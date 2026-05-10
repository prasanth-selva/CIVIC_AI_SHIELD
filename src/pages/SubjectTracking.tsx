import { motion } from "framer-motion";
import { User, MapPin, ArrowRight, Shield, History, Camera } from "lucide-react";

const trackingHistory = [
  { id: 1, camera: "CAM-047", location: "Main Entrance", time: "14:35:22", status: "Detected", confidence: 0.98 },
  { id: 2, camera: "CAM-122", location: "Lobby North", time: "14:36:10", status: "Tracking", confidence: 0.94 },
  { id: 3, camera: "CAM-089", location: "Elevator Bank B", time: "14:37:05", status: "In View", confidence: 0.91 },
  { id: 4, camera: "CAM-201", location: "Level 2 Hallway", time: "14:38:45", status: "Predicted", confidence: 0.85 },
];

export default function SubjectTracking() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Subject Tracking</h1>
          <p className="text-gray-400">Multi-camera re-identification (Re-ID) & path analysis</p>
        </div>
        <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 font-bold text-sm flex items-center gap-2">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Active Re-ID Session: #SBJ-9921
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject Profile Card */}
        <div className="space-y-6">
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-black/40 to-black/20 border border-white/5 rounded-3xl p-8 backdrop-blur-2xl">
                <div className="w-32 h-32 mx-auto rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 overflow-hidden relative group">
                    <User className="text-white/20 group-hover:scale-110 transition-transform" size={64} />
                    <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 bg-cyan-500 py-1 text-[10px] font-black text-white text-center">SUBJECT_IDENTIFIED</div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-white">Subject Delta-4</h3>
                    <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Confidence Score: 98.2%</p>
                </div>
                <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-gray-500 text-xs font-bold uppercase">First Seen</span>
                        <span className="text-white text-sm font-mono">14:35:22</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-gray-500 text-xs font-bold uppercase">Last Seen</span>
                        <span className="text-white text-sm font-mono">14:37:05</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-gray-500 text-xs font-bold uppercase">Nodes Passed</span>
                        <span className="text-white text-sm font-mono">3 Cameras</span>
                    </div>
                </div>
            </motion.div>

            <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="w-full py-4 bg-red-500/10 border border-red-500/30 text-red-500 font-black rounded-2xl flex items-center justify-center gap-2"
            >
                <Shield size={18} />
                Flag as Threat
            </motion.button>
        </div>

        {/* Breadcrumb Trail Timeline */}
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
                <History className="text-cyan-400" />
                Breadcrumb Trail Analysis
            </h2>
            
            <div className="relative space-y-8 before:absolute before:left-8 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                {trackingHistory.map((item, idx) => (
                    <motion.div 
                        key={item.id}
                        variants={itemVariants}
                        className="relative pl-20"
                    >
                        {/* Timeline Node */}
                        <div className={`absolute left-6 top-1.5 w-4 h-4 rounded-full border-2 bg-black z-10 ${
                            item.status === 'Predicted' ? 'border-dashed border-gray-600' : 'border-cyan-500 shadow-[0_0_10px_#06b6d4]'
                        }`} />
                        
                        <div className={`bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:bg-white/10 transition group ${
                            item.status === 'Predicted' ? 'opacity-50 grayscale' : ''
                        }`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/20 transition">
                                        <Camera className="text-cyan-400" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black text-lg">{item.camera}</h4>
                                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                                            <MapPin size={12} />
                                            {item.location}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Timestamp</p>
                                        <p className="text-white font-mono">{item.time}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Status</p>
                                        <p className={`font-black ${
                                            item.status === 'Predicted' ? 'text-gray-400' : 'text-cyan-400'
                                        }`}>{item.status}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/40">
                                        <ArrowRight className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-black font-black">
                        AI
                    </div>
                    <div>
                        <p className="text-white font-bold">Predicted Next Location</p>
                        <p className="text-gray-400 text-xs">Subject likely moving towards Parking Zone 3 based on current vector.</p>
                    </div>
                </div>
                <button className="px-6 py-2 bg-white text-black font-black rounded-xl text-sm">Deploy Operator</button>
            </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
