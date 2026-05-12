import { motion, AnimatePresence } from "framer-motion";
import { Zap, Activity, TrendingUp, GitBranch, Target, Shield, AlertTriangle, Cpu, Network, Binary } from "lucide-react";
import { useState, useEffect } from "react";

const TIMELINES = [
  { id: 'TL-ALPHA', status: 'OPTIMAL', probability: 84.2, risk: 12, drift: 0.2 },
  { id: 'TL-BETA', status: 'UNSTABLE', probability: 42.8, risk: 65, drift: 4.5 },
  { id: 'TL-GAMMA', status: 'CRITICAL', probability: 12.5, risk: 92, drift: 12.8 },
  { id: 'TL-DELTA', status: 'DIVERGENT', probability: 28.1, risk: 44, drift: 8.2 },
];

export function QuantumIntelligenceCore() {
  const [activeTimeline, setActiveTimeline] = useState(TIMELINES[0]);
  const [quantumState, setQuantumState] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuantumState(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Quantum Probability Matrix */}
      <div className="col-span-8 tactical-glass-panel p-8 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-5">
              <div className="relative">
                 <Binary className="text-red-600" size={36} />
                 <motion.div 
                   animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
                   transition={{ repeat: Infinity, duration: 3 }}
                   className="absolute inset-0 bg-red-600/20 blur-xl rounded-full"
                 />
              </div>
              <div>
                 <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Quantum_Strategic_Core</h2>
                 <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Multi-Future_Scenario_Simulation_v12.0</p>
              </div>
           </div>
           <div className="flex gap-8">
              <div className="text-right">
                 <p className="text-[9px] font-black text-gray-700 uppercase">Superposition_Status</p>
                 <p className="text-emerald-500 font-mono text-sm uppercase">STABLE_COHERENCE</p>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black text-gray-700 uppercase">Qubits_Active</p>
                 <p className="text-red-600 font-mono text-sm">4096 / 4096</p>
              </div>
           </div>
        </div>

        {/* Branching Timeline Trees (SVG Visualization) */}
        <div className="flex-1 bg-black/60 border border-white/5 relative rounded-sm overflow-hidden group">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.05),transparent_70%)]" />
           <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="tactical-grid h-full w-full" />
           </div>

           <svg className="absolute inset-0 w-full h-full">
              {/* Main Trunk */}
              <motion.line 
                x1="10%" y1="50%" x2="30%" y2="50%" 
                stroke="#ff0000" strokeWidth="2" 
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} 
              />
              {/* Branch Alpha */}
              <motion.path 
                d="M 30% 50% Q 50% 50% 70% 30%" 
                fill="none" stroke={activeTimeline.id === 'TL-ALPHA' ? '#ff0000' : '#444'} 
                strokeWidth={activeTimeline.id === 'TL-ALPHA' ? '3' : '1'} 
                strokeDasharray="5,5"
              />
              {/* Branch Beta */}
              <motion.path 
                d="M 30% 50% Q 50% 50% 70% 70%" 
                fill="none" stroke={activeTimeline.id === 'TL-BETA' ? '#ff0000' : '#444'} 
                strokeWidth={activeTimeline.id === 'TL-BETA' ? '3' : '1'} 
                strokeDasharray="5,5"
              />
              {/* Branch Gamma */}
              <motion.path 
                d="M 30% 50% Q 40% 50% 70% 50%" 
                fill="none" stroke={activeTimeline.id === 'TL-GAMMA' ? '#ff0000' : '#444'} 
                strokeWidth={activeTimeline.id === 'TL-GAMMA' ? '3' : '1'} 
                strokeDasharray="5,5"
              />
           </svg>

           {/* Timeline Interaction Points */}
           {TIMELINES.map((tl, i) => (
             <motion.div 
               key={tl.id}
               className={`absolute cursor-pointer p-4 group/tl ${activeTimeline.id === tl.id ? 'z-20' : 'z-10'}`}
               style={{ 
                 right: '15%', 
                 top: `${20 + i * 20}%`,
                 transform: 'translateY(-50%)'
               }}
               onClick={() => setActiveTimeline(tl)}
             >
                <div className={`w-3 h-3 rounded-full ${tl.status === 'CRITICAL' ? 'bg-orange-500' : tl.status === 'OPTIMAL' ? 'bg-emerald-500' : 'bg-red-600'} relative`}>
                   {activeTimeline.id === tl.id && (
                     <div className={`absolute inset-0 rounded-full animate-ping ${tl.status === 'CRITICAL' ? 'bg-orange-500' : tl.status === 'OPTIMAL' ? 'bg-emerald-500' : 'bg-red-600'}`} />
                   )}
                </div>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap">
                   <p className={`text-[10px] font-black uppercase tracking-widest ${activeTimeline.id === tl.id ? 'text-white' : 'text-gray-600'}`}>
                      {tl.id} // {tl.probability}%
                   </p>
                </div>
             </motion.div>
           ))}

           {/* Live Future Simulation Text */}
           <div className="absolute bottom-6 left-6 p-4 bg-black/80 border border-red-600/20 max-w-sm">
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">Autonomous_War-Game_Generation</p>
              <div className="space-y-1">
                 <p className="text-[9px] font-mono text-red-500 uppercase tracking-tighter">SIMULATING_CONFLICT_X942...</p>
                 <p className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">PREDICTING_REGIONAL_DESTABILIZATION: 94.2%</p>
                 <p className="text-[9px] font-mono text-emerald-500 uppercase tracking-tighter">COUNTERMEASURE_GENERATED: OMEGA_PROTOCOL</p>
              </div>
           </div>
        </div>
      </div>

      {/* Strategic Detail Sidebar */}
      <div className="col-span-4 flex flex-col gap-6">
         <div className="tactical-glass-panel p-6 border-r-2 border-red-600 h-full">
            <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
               <GitBranch size={16} /> Probabilistic_Modeling
            </h3>
            
            <AnimatePresence mode="wait">
               <motion.div 
                 key={activeTimeline.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-8"
               >
                  <div>
                     <p className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{activeTimeline.id}</p>
                     <p className={`text-[10px] font-mono font-black uppercase tracking-widest mt-2 ${activeTimeline.status === 'OPTIMAL' ? 'text-emerald-500' : 'text-orange-500'}`}>{activeTimeline.status}_CONVERGENCE</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-black/40 border border-white/5 space-y-2">
                        <p className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">Future_Drift</p>
                        <p className="text-xl font-black text-white italic">{activeTimeline.drift}%</p>
                        <div className="h-1 bg-white/5 w-full">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${activeTimeline.drift * 5}%` }} className="h-full bg-red-600" />
                        </div>
                     </div>
                     <div className="p-4 bg-black/40 border border-white/5 space-y-2">
                        <p className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">Systemic_Risk</p>
                        <p className="text-xl font-black text-white italic">{activeTimeline.risk}%</p>
                        <div className="h-1 bg-white/5 w-full">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${activeTimeline.risk}%` }} className={`h-full ${activeTimeline.risk > 50 ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                        </div>
                     </div>
                  </div>

                  <div className="p-6 bg-red-600/5 border border-red-600/10 space-y-4">
                     <p className="text-[9px] font-black text-red-600 uppercase tracking-widest italic">Strategic_Branch_Prediction</p>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Confidence_Rating</span>
                           <span className="text-emerald-500 font-black italic">98.4%</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Entropy_Factor</span>
                           <span className="text-red-600 font-black italic">0.002</span>
                        </div>
                     </div>
                  </div>

                  <button className="w-full h-14 border-2 border-red-600 text-red-600 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-red-600 hover:text-black transition-all flex items-center justify-center gap-4 group">
                     <Activity size={16} className="group-hover:animate-spin" />
                     INITIALIZE_FUTURE_COLLAPSE
                  </button>
               </motion.div>
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
