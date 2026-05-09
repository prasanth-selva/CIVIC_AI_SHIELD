import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Cpu, Zap, Database, Network, Globe, AlertCircle, Cpu as GpuIcon } from "lucide-react";
import { API_BASE } from "../../config";
import { useAuth } from "../../context/AuthContext";

export function SystemIntelligence() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchIntelligence() {
      try {
        const response = await fetch(`${API_BASE}/api/system/intelligence`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const d = await response.json();
          setData(d);
        }
      } catch (err) {
        console.error("Intelligence fetch failed:", err);
      }
    }
    const interval = setInterval(fetchIntelligence, 2000);
    fetchIntelligence();
    return () => clearInterval(interval);
  }, [token]);

  if (!data) return null;

  return (
    <div className="glass-panel-heavy p-8 border-l-2 border-red-950 relative overflow-hidden font-inter">
      <div className="radar-sweep opacity-5" />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-red-600" />
          <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">AI_Intelligence_Matrix</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest italic">
            Realtime_Telemetry
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Inference Stats */}
        <div className="space-y-6">
           <div className="space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Inference_Latency</p>
                <p className="text-xl font-black text-white italic tracking-tighter">{data.inference.latency_ms}ms</p>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((data.inference.latency_ms / 100) * 100, 100)}%` }}
                    className="h-full bg-red-600"
                />
              </div>
           </div>

           <div className="space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Throughput</p>
                <p className="text-xl font-black text-white italic tracking-tighter">{data.inference.throughput_fps} FPS</p>
              </div>
              <div className="flex gap-1 h-3">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div 
                        key={i}
                        animate={{ height: [4, Math.random() * 12 + 2, 4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.05 }}
                        className="flex-1 bg-red-600/40"
                    />
                ))}
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Total_Frames</p>
                    <p className="text-sm font-black text-white italic">{data.inference.processed_frames.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Dropped_Frames</p>
                    <p className="text-sm font-black text-red-600 italic">{data.inference.dropped_frames}</p>
                </div>
           </div>
        </div>

        {/* Resource Stats */}
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <MetricItem icon={<GpuIcon size={12} />} label="GPU_Load" value={data.resources.gpu_usage} />
                <MetricItem icon={<Database size={12} />} label="GPU_VRAM" value={data.resources.gpu_mem} />
                <MetricItem icon={<Cpu size={12} />} label="CPU_Load" value={data.resources.cpu_usage} />
                <MetricItem icon={<Activity size={12} />} label="RAM_Load" value={data.resources.ram_usage} />
            </div>

            <div className="p-4 bg-white/5 border border-white/5 rounded-sm space-y-4">
                <div className="flex items-center gap-2">
                    <Globe size={12} className="text-red-600" />
                    <p className="text-[9px] font-black text-white uppercase tracking-widest">Neural_Node_Orchestration</p>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] font-bold text-gray-500">ACTIVE_NODES</span>
                        <span className="text-[10px] font-black text-red-500">{data.network.active_nodes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] font-bold text-gray-500">WS_SYNC_TX</span>
                        <span className="text-[10px] font-black text-white">{data.network.bandwidth_mbps} Mbps</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={14} className="text-red-600" />
            <p className="text-[10px] font-black text-white uppercase tracking-widest">Active_Neural_Models</p>
        </div>
        <div className="flex flex-wrap gap-2">
            {data.active_models.map((model: string) => (
                <span key={model} className="px-3 py-1 bg-black/40 border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-tighter italic">
                    {model}
                </span>
            ))}
        </div>
      </div>
    </div>
  );
}

function MetricItem({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-600">
                {icon}
                <p className="text-[8px] font-black uppercase tracking-tighter">{label}</p>
            </div>
            <p className="text-sm font-black text-white italic tracking-tighter">{value}</p>
        </div>
    )
}
