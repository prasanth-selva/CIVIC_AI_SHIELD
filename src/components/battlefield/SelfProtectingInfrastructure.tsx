import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Activity, ShieldAlert, ShieldCheck, Lock, Unlock, AlertTriangle, Cpu, Terminal, Wifi, Network, Database, Server, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

const SYSTEM_NODES = [
  { id: 'INFRA-CORE-SINGULARITY', load: 42, temp: 38, health: 100, status: 'OPTIMAL' },
  { id: 'INFRA-NODE-QUANTUM-1', load: 88, temp: 72, health: 94, status: 'HEAVY_LOAD' },
  { id: 'INFRA-GATE-NEURAL', load: 12, temp: 32, health: 100, status: 'STABLE' },
];

export function SelfProtectingInfrastructure() {
  const [nodes, setNodes] = useState(SYSTEM_NODES);
  const [isHealing, setIsHealing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(n => ({
        ...n,
        load: Math.max(10, Math.min(100, n.load + (Math.random() * 10 - 5))),
        temp: Math.max(30, Math.min(90, n.temp + (Math.random() * 6 - 3)))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerHealing = () => {
    setIsHealing(true);
    setTimeout(() => {
      setNodes(prev => prev.map(n => ({ ...n, health: 100, status: 'OPTIMAL' })));
      setIsHealing(false);
    }, 4000);
  };

  return (
    <div className="grid grid-cols-12 gap-8 h-full">
      {/* Infrastructure Core Monitor */}
      <div className="col-span-8 tactical-glass-panel p-10 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.05),transparent_70%)]" />
        
        <div className="flex items-center justify-between mb-12 relative z-10">
           <div className="flex items-center gap-6">
              <div className="relative">
                 <Server className="text-red-600" size={40} />
                 <motion.div 
                   animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
                   transition={{ repeat: Infinity, duration: 4 }}
                   className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full"
                 />
              </div>
              <div>
                 <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Self_Protecting_Infrastructure</h2>
                 <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-2">Planetary_Node_Stability_v16.0_ACTIVE</p>
              </div>
           </div>
           <button 
             onClick={triggerHealing}
             disabled={isHealing}
             className={`px-10 h-14 border-2 border-red-600 text-[12px] font-black uppercase tracking-[0.3em] flex items-center gap-6 transition-all ${isHealing ? 'bg-red-600 text-black shadow-[0_0_50px_rgba(255,0,0,0.6)]' : 'text-red-600 hover:bg-red-600/10'}`}
           >
              <RefreshCw className={isHealing ? 'animate-spin' : ''} size={18} />
              {isHealing ? 'SYSTEM_HEALING_IN_PROGRESS...' : 'INITIALIZE_PLANETARY_REPAIR'}
           </button>
        </div>

        {/* Node Health Grid */}
        <div className="flex-1 grid grid-cols-3 gap-8 relative z-10">
           {nodes.map((node) => (
              <div key={node.id} className="bg-black/60 border border-white/5 p-8 relative overflow-hidden group hover:border-red-600/40 transition-all flex flex-col justify-between">
                 {isHealing && (
                   <motion.div 
                     initial={{ top: '100%' }}
                     animate={{ top: '-100%' }}
                     transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                     className="absolute inset-x-0 h-32 bg-red-600/10 blur-3xl pointer-events-none"
                   />
                 )}
                 
                 <div>
                    <div className="flex justify-between items-start mb-6">
                       <Database className={node.health < 95 ? 'text-orange-500 animate-pulse' : 'text-red-600'} size={28} />
                       <span className={`text-[10px] font-black uppercase tracking-widest ${node.health < 95 ? 'text-orange-500' : 'text-emerald-500'}`}>{node.status}</span>
                    </div>
                    <h3 className="text-[14px] font-black text-white uppercase tracking-widest leading-none mb-2">{node.id}</h3>
                    <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest italic">Planetary_Core_Sector_A</p>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[8px] font-mono uppercase text-gray-500">
                          <span>Compute_Load</span>
                          <span className={node.load > 80 ? 'text-red-600' : 'text-white'}>{node.load.toFixed(1)}%</span>
                       </div>
                       <div className="h-1 bg-white/5 w-full">
                          <motion.div animate={{ width: `${node.load}%` }} className={`h-full ${node.load > 80 ? 'bg-red-600' : 'bg-red-600/40'}`} />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[8px] font-mono uppercase text-gray-500">
                          <span>Core_Temperature</span>
                          <span className={node.temp > 70 ? 'text-orange-500' : 'text-white'}>{node.temp.toFixed(1)}°C</span>
                       </div>
                       <div className="h-1 bg-white/5 w-full">
                          <motion.div animate={{ width: `${node.temp}%` }} className={`h-full ${node.temp > 70 ? 'bg-orange-500' : 'bg-red-600/40'}`} />
                       </div>
                    </div>
                 </div>
              </div>
           ))}
        </div>

        {/* Neural OS Logs */}
        <div className="mt-12 p-8 bg-black/80 border border-white/5 relative">
           <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">Neural_OS_Intrusion_Logs</p>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                 <span className="text-[8px] font-black text-white uppercase tracking-widest">FIREWALL_ACTIVE</span>
              </div>
           </div>
           <div className="space-y-2 font-mono text-[10px] text-gray-500 uppercase">
              <p><span className="text-red-600">[ALERT]</span> ATTEMPTED_INTRUSION_SECTOR_4 // SOURCE: REDACTED // ACTION: NEUTRALIZED</p>
              <p><span className="text-emerald-500">[SYSTEM]</span> SELF_HEALING_SYNC_OMEGA // ALL_NODES_HEALTHY</p>
              <p><span className="text-gray-700">[LOG]</span> QUANTUM_CORE_TEMP_STABILIZED // OPTIMIZING_LOAD_BALANCER</p>
           </div>
        </div>
      </div>

      {/* Cyber Defense Control Sidebar */}
      <div className="col-span-4 flex flex-col gap-8">
         <div className="tactical-glass-panel p-8 border-r-4 border-red-600 flex flex-col justify-between">
            <div>
               <h3 className="text-red-600 text-[12px] font-black uppercase tracking-[0.5em] mb-10 flex items-center gap-4">
                  <ShieldAlert size={20} /> Neural_Firewall_Status
               </h3>
               
               <div className="space-y-10">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <Lock size={32} className="text-red-600" />
                        <div>
                           <p className="text-[11px] font-black text-white uppercase tracking-widest">Core_Lockdown</p>
                           <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Protocol: OMEGA_12</p>
                        </div>
                     </div>
                     <span className="text-emerald-500 font-black text-[10px]">ENGAGED</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <Activity size={32} className="text-red-600 animate-pulse" />
                        <div>
                           <p className="text-[11px] font-black text-white uppercase tracking-widest">Intrusion_Scan</p>
                           <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Monitoring_Traffic_v14</p>
                        </div>
                     </div>
                     <span className="text-emerald-500 font-black text-[10px]">ACTIVE</span>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-red-600/5 border border-red-600/20 space-y-6">
               <p className="text-[10px] font-black text-red-600 uppercase tracking-widest italic">Intrusion_Neutralization_Matrix</p>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                     <span className="text-gray-500">Threat_Neutralized</span>
                     <span className="text-emerald-500">14,242</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono">
                     <span className="text-gray-500">Node_Isolation</span>
                     <span className="text-white">ACTIVE</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="tactical-glass-panel p-10 flex flex-col items-center text-center relative overflow-hidden group cursor-help">
            <div className="radar-sweep opacity-10" />
            <div className="w-20 h-20 border-4 border-red-950 rounded-full flex items-center justify-center mb-8 relative">
               <ShieldCheck className="text-red-900 group-hover:text-red-600 transition-colors" size={48} />
               <motion.div 
                 animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute inset-0 bg-red-600/20 rounded-full"
               />
            </div>
            <p className="text-[14px] font-black text-red-600 uppercase tracking-[0.4em] mb-4">Infrastructure_Secure</p>
            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest leading-relaxed">
               Planetary_OS_Defends_Itself_Autonomously. Cyber_Threat_Analysis_Predicts_Zero_Bypass_Probability.
            </p>
         </div>
      </div>
    </div>
  );
}
