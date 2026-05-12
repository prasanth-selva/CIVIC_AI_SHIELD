import { motion, AnimatePresence } from "framer-motion";
import { Globe, Radio, Zap, Shield, AlertTriangle, Cpu, Network, MapPin, Activity } from "lucide-react";
import { useState, useEffect } from "react";

const DEFENSE_NODES = [
  { id: 'NODE-NA-1', region: 'NORTH_AMERICA', status: 'ACTIVE', load: 42, health: 98, threats: 2 },
  { id: 'NODE-EU-1', region: 'EUROPE', status: 'ACTIVE', load: 68, health: 94, threats: 5 },
  { id: 'NODE-AS-1', region: 'ASIA_PACIFIC', status: 'ALERT', load: 89, health: 82, threats: 14 },
  { id: 'NODE-ME-1', region: 'MIDDLE_EAST', status: 'ACTIVE', load: 55, health: 91, threats: 8 },
];

export function GlobalDefenseMesh() {
  const [activeNode, setActiveNode] = useState(DEFENSE_NODES[0]);
  const [meshPulse, setMeshPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMeshPulse(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Mesh Topology Visualization */}
      <div className="col-span-8 tactical-glass-panel p-8 relative overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <Globe className="text-red-600 animate-pulse" size={32} />
             <div>
                <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Global_Defense_Mesh</h2>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Multi-Region_Intelligence_Fabric_v9.4</p>
             </div>
          </div>
          <div className="flex gap-8">
             <div className="text-right">
                <p className="text-[9px] font-black text-gray-600 uppercase">Mesh_Sync</p>
                <p className="text-emerald-500 font-mono text-sm">99.999%</p>
             </div>
             <div className="text-right">
                <p className="text-[9px] font-black text-gray-600 uppercase">Active_Nodes</p>
                <p className="text-red-600 font-mono text-sm">512/512</p>
             </div>
          </div>
        </div>

        {/* Holographic Map Simulation */}
        <div className="flex-1 bg-black/60 border border-white/5 relative rounded-sm overflow-hidden group">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#ff000010,transparent_70%)]" />
           <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 opacity-10">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-red-600/20" />
              ))}
           </div>
           
           {/* Connection Lines */}
           <svg className="absolute inset-0 w-full h-full opacity-30">
              <motion.path 
                d="M 200 150 L 500 100 L 800 300 L 300 450 Z" 
                fill="none" 
                stroke="red" 
                strokeWidth="1" 
                strokeDasharray="5,5"
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
           </svg>

           {/* Nodes */}
           {DEFENSE_NODES.map((node, i) => (
             <motion.div 
               key={node.id}
               className="absolute cursor-pointer group/node"
               style={{ 
                 left: `${20 + i * 20}%`, 
                 top: `${20 + (i % 2) * 40}%` 
               }}
               onClick={() => setActiveNode(node)}
             >
                <div className={`w-4 h-4 rounded-full ${node.status === 'ALERT' ? 'bg-orange-500' : 'bg-red-600'} relative`}>
                   <div className={`absolute inset-0 rounded-full animate-ping ${node.status === 'ALERT' ? 'bg-orange-500' : 'bg-red-600'}`} />
                </div>
                <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity">
                   <div className="p-2 bg-black/90 border border-red-600/40 text-[8px] font-black text-white uppercase tracking-widest">
                      {node.id} // {node.region}
                   </div>
                </div>
             </motion.div>
           ))}

           {/* Live Telemetry Overlay */}
           <div className="absolute bottom-6 left-6 flex gap-6">
              <div className="p-4 bg-black/80 border border-red-600/20 rounded-sm">
                 <p className="text-[8px] font-black text-gray-500 uppercase mb-2">Tactical_Data_Routing</p>
                 <div className="flex gap-1">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <motion.div 
                        key={i} 
                        animate={{ height: [4, Math.random() * 20 + 4, 4] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                        className="w-1 bg-red-600/40" 
                      />
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Node Detail Sidebar */}
      <div className="col-span-4 flex flex-col gap-6">
         <div className="tactical-glass-panel p-6 border-r-2 border-red-600">
            <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
               <Cpu size={16} /> Node_Intelligence
            </h3>
            
            <AnimatePresence mode="wait">
               <motion.div 
                 key={activeNode.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-8"
               >
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-2xl font-black text-white italic tracking-tighter">{activeNode.id}</p>
                        <p className="text-[10px] font-mono text-red-600 uppercase tracking-widest">{activeNode.region}</p>
                     </div>
                     <div className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest ${activeNode.status === 'ALERT' ? 'bg-orange-500 text-black' : 'bg-emerald-500 text-black'}`}>
                        {activeNode.status}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-black/40 border border-white/5 space-y-2">
                        <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Compute_Load</p>
                        <p className="text-xl font-black text-white">{activeNode.load}%</p>
                        <div className="h-1 bg-white/5 w-full">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${activeNode.load}%` }} className="h-full bg-red-600" />
                        </div>
                     </div>
                     <div className="p-4 bg-black/40 border border-white/5 space-y-2">
                        <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Infra_Health</p>
                        <p className="text-xl font-black text-white">{activeNode.health}%</p>
                        <div className="h-1 bg-white/5 w-full">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${activeNode.health}%` }} className="h-full bg-emerald-500" />
                        </div>
                     </div>
                  </div>

                  <div className="p-6 bg-red-600/5 border border-red-600/10 space-y-4">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-red-600">
                        <span>Autonomous_Threat_Relay</span>
                        <AlertTriangle size={14} className="animate-pulse" />
                     </div>
                     <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3 text-[9px] font-mono text-gray-500">
                             <div className="w-1 h-1 bg-red-600 rounded-full" />
                             <span>TR-X{i}92 // ESCALATION_PREDICTED // NODE_SYNC</span>
                          </div>
                        ))}
                     </div>
                  </div>

                  <button className="w-full h-12 border border-red-600 text-red-600 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-600 hover:text-black transition-all">
                     SYNCHRONIZE_SURVEILLANCE_FABRIC
                  </button>
               </motion.div>
            </AnimatePresence>
         </div>

         <div className="tactical-glass-panel p-6 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 border-2 border-red-950 rounded-full flex items-center justify-center mb-4 relative">
               <Network className="text-red-900" size={32} />
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                 className="absolute inset-0 border border-dashed border-red-600/20 rounded-full"
               />
            </div>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Inter-Node_AI_Comm</p>
            <p className="text-[8px] font-mono text-gray-600 uppercase leading-relaxed">
               Neural_Federation_Active_Across_Continental_Nodes. Encrypted_Tunneling_v9_Engaged.
            </p>
         </div>
      </div>
    </div>
  );
}
