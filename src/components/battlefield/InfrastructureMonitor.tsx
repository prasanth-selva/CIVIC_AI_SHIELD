import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Zap, Activity, Shield, AlertTriangle, RefreshCw, Thermometer, Database, Server, Network } from "lucide-react";
import { useState, useEffect } from "react";

const INFRA_NODES = [
  { id: 'CORE-H-1', type: 'GPU_COMPUTE', load: 78, temp: 62, status: 'STABLE' },
  { id: 'CORE-H-2', type: 'NEURAL_PROCESSOR', load: 92, temp: 78, status: 'HIGH_LOAD' },
  { id: 'MEM-BANK-1', type: 'TACTICAL_MEMORY', load: 45, temp: 48, status: 'STABLE' },
  { id: 'MESS-DRIV-1', type: 'DATA_BUS', load: 12, temp: 42, status: 'RECOVERY' },
];

export function InfrastructureMonitor() {
  const [nodes, setNodes] = useState(INFRA_NODES);
  const [isHealing, setIsHealing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        load: Math.min(100, Math.max(10, node.load + (Math.random() * 10 - 5))),
        temp: Math.min(100, Math.max(40, node.temp + (Math.random() * 6 - 3)))
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const triggerHeal = () => {
    setIsHealing(true);
    setTimeout(() => {
      setNodes(prev => prev.map(n => ({ ...n, status: 'STABLE', load: Math.min(50, n.load) })));
      setIsHealing(false);
    }, 3000);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Infrastructure Neural Graph */}
      <div className="col-span-8 tactical-glass-panel p-8 relative overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-10">
           <div className="flex items-center gap-4">
              <Server className="text-red-600" size={32} />
              <div>
                 <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Self-Healing_Infra</h2>
                 <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Autonomous_Resource_Orchestration_v6.1</p>
              </div>
           </div>
           <button 
             onClick={triggerHeal}
             disabled={isHealing}
             className={`px-6 h-10 border border-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${isHealing ? 'bg-red-600 text-black' : 'text-red-600 hover:bg-red-600/10'}`}
           >
              <RefreshCw className={isHealing ? 'animate-spin' : ''} size={14} />
              {isHealing ? 'HEALING_NODES...' : 'INITIALIZE_SELF_HEAL'}
           </button>
        </div>

        {/* Distributed Infrastructure Grid */}
        <div className="flex-1 grid grid-cols-2 gap-8">
           {nodes.map((node, i) => (
             <motion.div 
               key={node.id}
               className="p-6 bg-black/40 border border-white/5 relative group hover:border-red-600/40 transition-all"
             >
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <p className="text-xl font-black text-white italic tracking-tighter">{node.id}</p>
                      <p className="text-[8px] font-mono text-red-600 uppercase tracking-widest">{node.type}</p>
                   </div>
                   <div className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${node.status === 'STABLE' ? 'text-emerald-500' : 'text-orange-500 animate-pulse'}`}>
                      {node.status}
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500">
                         <span>Load_Balance</span>
                         <span>{node.load.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 bg-white/5 w-full relative overflow-hidden">
                         <motion.div 
                           animate={{ width: `${node.load}%` }} 
                           className={`h-full ${node.load > 85 ? 'bg-orange-500' : 'bg-red-600'}`} 
                         />
                      </div>
                   </div>

                   <div className="flex gap-10">
                      <div className="flex items-center gap-3">
                         <Thermometer size={14} className={node.temp > 75 ? 'text-orange-500' : 'text-emerald-500'} />
                         <span className="text-[10px] font-mono text-white font-bold">{node.temp.toFixed(0)}°C</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <Zap size={14} className="text-red-600" />
                         <span className="text-[10px] font-mono text-white font-bold">{(node.load * 1.2).toFixed(1)}W</span>
                      </div>
                   </div>
                </div>

                {isHealing && (
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 origin-left"
                  />
                )}
             </motion.div>
           ))}
        </div>
      </div>

      {/* Optimization Sidebar */}
      <div className="col-span-4 flex flex-col gap-6">
         <div className="tactical-glass-panel p-6 border-l-2 border-red-600">
            <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
               <Activity size={16} /> Autonomous_Optimization
            </h3>

            <div className="space-y-6">
               <div className="p-4 bg-red-950/20 border border-red-600/20 space-y-4">
                  <p className="text-[9px] font-black text-white uppercase tracking-widest">Distributed_AI_Load</p>
                  <div className="flex items-end gap-1 h-12">
                     {Array.from({ length: 30 }).map((_, i) => (
                       <motion.div 
                         key={i}
                         animate={{ height: [4, Math.random() * 40 + 4, 4] }}
                         transition={{ repeat: Infinity, duration: 1, delay: i * 0.05 }}
                         className="flex-1 bg-red-600/40"
                       />
                     ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Failover_Routing_Paths</p>
                  <div className="h-40 bg-black/60 border border-white/5 p-4 relative overflow-hidden">
                     <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-10">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className="border border-red-600/20" />
                        ))}
                     </div>
                     <motion.div 
                       animate={{ 
                         x: [0, 50, 50, 0, 0], 
                         y: [0, 0, 50, 50, 0] 
                       }}
                       transition={{ duration: 10, repeat: Infinity }}
                       className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_10px_rgba(255,0,0,1)]"
                     />
                     <div className="absolute top-2 left-2 text-[6px] font-mono text-gray-700">FAILOVER_TOPOLOGY_v9.1</div>
                  </div>
               </div>
            </div>
         </div>

         <div className="tactical-glass-panel p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="radar-sweep opacity-5" />
            <div className="w-16 h-16 border-2 border-red-950 rounded-lg transform rotate-45 flex items-center justify-center mb-6">
               <Shield className="text-red-900 -rotate-45" size={28} />
            </div>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">OS_Integrity_Lock</p>
            <p className="text-[8px] font-mono text-gray-700 uppercase tracking-widest leading-relaxed px-4">
               Autonomous_Node_Repair_Engaged. Infrastructure_Neural_Graph_Stabilized.
            </p>
         </div>
      </div>
    </div>
  );
}
