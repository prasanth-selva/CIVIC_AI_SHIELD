import { motion } from "framer-motion";
import { CameraStream } from "../components/ui/CameraStream";
import { IntelligenceEscalationPanel } from "../components/ui/IntelligenceEscalationPanel";
import { TacticalTimeline } from "../components/ui/TacticalTimeline";
import { Activity, Shield, Zap, Target, Cpu, CpuIcon, Brain, Terminal, Crosshair, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { API_BASE } from "../config";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const as const } },
};

export default function LiveDetection() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    async function fetchIntel() {
      try {
        const response = await fetch(`${API_BASE}/api/system/intelligence`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
            setMetrics(await response.json());
        }
      } catch (err) {
        console.error("Failed to fetch intelligence:", err);
      }
    }
    const interval = setInterval(fetchIntel, 3000);
    fetchIntel();
    return () => clearInterval(interval);
  }, [token]);

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
           <div className="w-12 h-0.5 bg-red-600" />
           <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Live_Tactical_Stream</h2>
        </div>
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/5 rounded-sm">
                <Brain size={16} className="text-red-600" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">AI_Logic: Autonomous_Decision_Support</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse glow-red" />
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Inference_Active</span>
            </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Main Stream Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <motion.div variants={itemVariants} className="flex-1 min-h-0">
             <CameraStream />
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4 h-32">
             <div className="glass-panel-heavy p-4 border-l-2 border-red-600 flex flex-col justify-between">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Neural_Latency</p>
                <div className="flex items-end justify-between">
                    <p className="text-xl font-black text-white italic tracking-tighter">{metrics?.inference?.latency_ms || "4.2"}ms</p>
                    <Activity size={16} className="text-red-600" />
                </div>
             </div>
             <div className="glass-panel-heavy p-4 border-l-2 border-red-950 flex flex-col justify-between">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Throughput</p>
                <div className="flex items-end justify-between">
                    <p className="text-xl font-black text-white italic tracking-tighter">{metrics?.inference?.throughput_fps || "30.0"} FPS</p>
                    <Zap size={16} className="text-orange-500" />
                </div>
             </div>
             <div className="glass-panel-heavy p-4 border-l-2 border-red-600 flex flex-col justify-between">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Threat_Expansion</p>
                <div className="flex items-end justify-between">
                    <p className="text-xl font-black text-white italic tracking-tighter">8.4m</p>
                    <Target size={16} className="text-red-600" />
                </div>
             </div>
             <div className="glass-panel-heavy p-4 border-l-2 border-red-950 flex flex-col justify-between">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Node_Integrity</p>
                <div className="flex items-end justify-between">
                    <p className="text-xl font-black text-white italic tracking-tighter">100%</p>
                    <Shield size={16} className="text-green-500" />
                </div>
             </div>
          </motion.div>
        </div>

        {/* Intelligence Side Panel */}
        <div className="flex flex-col gap-6 overflow-hidden">
            <motion.div variants={itemVariants} className="flex-1 min-h-0">
                <IntelligenceEscalationPanel />
            </motion.div>
            <motion.div variants={itemVariants} className="h-2/5 min-h-0">
                <TacticalTimeline />
            </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
