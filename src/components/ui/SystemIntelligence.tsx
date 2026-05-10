import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Cpu, Zap, Database, Network, Globe, AlertCircle, Cpu as GpuIcon, Server, Shield } from "lucide-react";
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
    <div className="glass-panel-heavy p-8 border-l-2 border-red-600 relative overflow-hidden font-inter h-full flex flex-col">
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

      <div className="grid grid-cols-2 gap-8 flex-1">
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
                    className="h-full bg-red-600 shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                />
              </div>
           </div>

           <div className="space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Throughput</p>
                <p className="text-xl font-black text-white italic tracking-tighter">{data.inference.throughput_fps} FPS</p>
              </div>
              <div className="flex gap-1 h-4 items-end">
                {Array.from({ length: 24 }).map((_, i) => (
                    <motion.div 
                        key={i}
                        animate={{ height: [4, Math.random() * 16 + 4, 4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
                        className="flex-1 bg-red-600/40 border-t border-red-500/50"
                    />
                ))}
              </div>
           </div>

           <div className="p-4 bg-red-950/5 border border-red-900/20 rounded-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Server size={12} className="text-red-600" />
                    <p className="text-[9px] font-black text-white uppercase tracking-widest italic">Distributed_Cluster_Status</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {[1,1,1,1,0,1,0,1].map((s, i) => (
                        <div key={i} className={`h-1.5 rounded-full ${s ? 'bg-red-600' : 'bg-gray-800'}`} />
                    ))}
                </div>
                <p className="text-[7px] text-gray-600 mt-2 font-mono uppercase tracking-widest">Active_Edge_Nodes: 06 // SYNC: 99.2%</p>
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

            <div className="p-4 bg-white/5 border border-white/5 rounded-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10"><Shield size={32} className="text-red-600" /></div>
                <div className="flex items-center gap-2">
                    <Globe size={12} className="text-red-600" />
                    <p className="text-[9px] font-black text-white uppercase tracking-widest">Network_Orchestration</p>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] font-bold text-gray-500">K8S_PODS_ACTIVE</span>
                        <span className="text-[10px] font-black text-red-500">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] font-bold text-gray-500">WS_TRAFFIC_LATENCY</span>
                        <span className="text-[10px] font-black text-white">2.4ms</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="flex flex-wrap gap-2">
            {data.active_models.map((model: string) => (
                <span key={model} className="px-3 py-1 bg-black/40 border border-white/10 text-[8px] font-black text-gray-500 uppercase tracking-tighter italic hover:border-red-600/50 transition-all cursor-crosshair">
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
        <div className="space-y-1 group">
            <div className="flex items-center gap-2 text-gray-600 group-hover:text-red-600 transition-colors">
                {icon}
                <p className="text-[8px] font-black uppercase tracking-tighter">{label}</p>
            </div>
            <p className="text-sm font-black text-white italic tracking-tighter">{value}</p>
        </div>
    )
}
