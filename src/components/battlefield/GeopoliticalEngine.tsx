import { motion, AnimatePresence } from "framer-motion";
import { Globe, Activity, Shield, Target, AlertTriangle, Network, Users, MessageSquare, TrendingUp, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const REGIONS = [
  { id: 'REG-01', name: 'NORTH_TRANSATLANTIC', stability: 92, tension: 12, risk: 'LOW' },
  { id: 'REG-02', name: 'PACIFIC_RIM_ORCHESTRA', stability: 64, tension: 45, risk: 'ELEVATED' },
  { id: 'REG-03', name: 'EURASIAN_CORE', stability: 28, tension: 88, risk: 'CRITICAL' },
  { id: 'REG-04', name: 'GLOBAL_SOUTH_MESH', stability: 55, tension: 32, risk: 'STABLE' },
];

export function GeopoliticalEngine() {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[2]);
  const [tensionPulse, setTensionPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTensionPulse(prev => (prev + 1) % 100);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Geopolitical Strategic Map */}
      <div className="col-span-8 tactical-glass-panel p-8 relative overflow-hidden flex flex-col group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.05),transparent_70%)]" />
        
        <div className="flex items-center justify-between mb-10">
           <div className="flex items-center gap-5">
              <Globe className="text-red-600 animate-pulse" size={36} />
              <div>
                 <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Geopolitical_Intelligence_Engine</h2>
                 <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Regional_Stability_Analysis_v11.4</p>
              </div>
           </div>
           <div className="flex gap-8">
              <div className="text-right">
                 <p className="text-[9px] font-black text-gray-700 uppercase">Diplomatic_Tension</p>
                 <p className="text-red-600 font-mono text-sm uppercase italic tracking-tighter">ELEVATED_CONFLICT_RISK</p>
              </div>
           </div>
        </div>

        {/* Geopolitical Heatmap View */}
        <div className="flex-1 bg-black/60 border border-white/5 relative rounded-sm overflow-hidden p-8">
           <div className="absolute inset-0 opacity-10">
              <div className="tactical-grid h-full w-full" />
           </div>
           
           <div className="relative h-full flex items-center justify-center">
              <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
                 {REGIONS.map((region) => (
                   <motion.div 
                     key={region.id}
                     onClick={() => setSelectedRegion(region)}
                     className={`p-6 border cursor-pointer relative group/region transition-all ${selectedRegion.id === region.id ? 'bg-red-600/10 border-red-600/40' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                   >
                      <div className="flex justify-between items-start mb-4">
                         <h3 className={`text-[12px] font-black uppercase tracking-widest transition-colors ${selectedRegion.id === region.id ? 'text-white' : 'text-gray-500'}`}>{region.name}</h3>
                         <div className={`w-2 h-2 rounded-full ${region.risk === 'CRITICAL' ? 'bg-red-600 animate-pulse shadow-[0_0_8px_rgba(255,0,0,1)]' : region.risk === 'LOW' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                      </div>
                      <div className="space-y-3">
                         <div className="flex justify-between text-[8px] font-mono uppercase tracking-widest">
                            <span className="text-gray-600">Stability_Index</span>
                            <span className={region.stability < 40 ? 'text-red-600' : 'text-emerald-500'}>{region.stability}%</span>
                         </div>
                         <div className="h-1 bg-white/5 w-full">
                            <motion.div animate={{ width: `${region.stability}%` }} className={`h-full ${region.stability < 40 ? 'bg-red-600' : 'bg-emerald-500'}`} />
                         </div>
                      </div>
                   </motion.div>
                 ))}
              </div>

              {/* Alliance Networks (Floating Lines) */}
              <svg className="absolute inset-0 pointer-events-none opacity-20">
                 <motion.path 
                   d="M 200 150 L 500 400 L 800 150" 
                   fill="none" stroke="#ff0000" strokeWidth="1" 
                   strokeDasharray="5,5"
                   animate={{ strokeDashoffset: [0, -20] }}
                   transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                 />
              </svg>
           </div>
        </div>

        {/* Global Incident Probability Matrix */}
        <div className="mt-8 grid grid-cols-4 gap-6">
           {['WAR', 'CYBER', 'ECONOMIC', 'CIVIL'].map(type => (
              <div key={type} className="p-4 bg-black/40 border border-white/5 space-y-2">
                 <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest">{type}_PROBABILITY</p>
                 <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-white italic tracking-tighter">{(Math.random() * 100).toFixed(1)}%</span>
                    <TrendingUp size={14} className="text-red-900" />
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* Diplomatic Intelligence Sidebar */}
      <div className="col-span-4 flex flex-col gap-6">
         <div className="tactical-glass-panel p-6 border-r-2 border-red-600">
            <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
               <Users size={16} /> Alliance_Network_Analysis
            </h3>

            <AnimatePresence mode="wait">
               <motion.div 
                 key={selectedRegion.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-8"
               >
                  <div>
                     <p className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedRegion.name}</p>
                     <p className="text-[10px] font-mono text-red-600 uppercase tracking-widest mt-2 italic">STATUS: {selectedRegion.risk}_THRESHOLD</p>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Diplomatic_Tension_Stream</p>
                     <div className="p-4 bg-red-950/20 border border-red-600/20 space-y-4">
                        {['Negotiation Failure Predicted', 'Border Escalation: Sector-7', 'Neural Defense Grid Locked'].map((msg, i) => (
                           <div key={i} className="flex gap-3 text-[9px] font-mono text-gray-400 uppercase tracking-tighter">
                              <span className="text-red-900 font-black">{i+1}.</span>
                              <span>{msg}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Conflict_Probability_Arcs</p>
                     <div className="h-32 bg-black/60 border border-white/5 p-4 relative overflow-hidden flex items-center justify-center">
                        <Activity className="text-red-600/20" size={64} />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                          className="absolute inset-0 bg-red-600/10 rounded-full blur-2xl"
                        />
                        <p className="absolute bottom-4 text-[10px] font-black text-red-600 italic">P_CONVERGENCE: 0.94</p>
                     </div>
                  </div>

                  <button className="w-full h-14 bg-red-600 text-black text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-white transition-all">
                     <MessageSquare size={16} /> GENERATE_DIPLOMATIC_COUNTER
                  </button>
               </motion.div>
            </AnimatePresence>
         </div>

         <div className="tactical-glass-panel p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="radar-sweep opacity-5" />
            <div className="w-16 h-16 border border-white/5 rounded-full flex items-center justify-center mb-6 relative">
               <Zap className="text-red-900 group-hover:text-red-600 transition-colors" size={32} />
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute inset-0 border border-dashed border-red-600/20 rounded-full" />
            </div>
            <p className="text-[11px] font-black text-red-600 uppercase tracking-widest mb-2">Strategic_Influence_Graph</p>
            <p className="text-[8px] font-mono text-gray-700 uppercase tracking-widest leading-relaxed">
               Global_Incident_Probability_Matrix_STABLE. Regional_Destabilization_Predicted_Sector_3.
            </p>
         </div>
      </div>
    </div>
  );
}
