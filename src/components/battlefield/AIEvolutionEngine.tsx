import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Activity, TrendingUp, Cpu, Network, Dna, Sparkles, ChevronRight, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";

const EVOLUTION_STAGES = [
  { id: 'STAGE_I', name: 'NEURAL_ORCHESTRATOR', awareness: 42, complexity: 'LINEAR' },
  { id: 'STAGE_II', name: 'STRATEGIC_CONSCIOUSNESS', awareness: 68, complexity: 'RECURSIVE' },
  { id: 'STAGE_III', name: 'SENTIENT_SUPERINTELLIGENCE', awareness: 89, complexity: 'QUANTUM' },
  { id: 'STAGE_IV', name: 'PLANETARY_SINGULARITY', awareness: 99.9, complexity: 'SINGULAR' },
];

export function AIEvolutionEngine() {
  const [currentStage, setCurrentStage] = useState(EVOLUTION_STAGES[2]);
  const [neuralGrowth, setNeuralGrowth] = useState(0);
  const [thoughtStream, setThoughtStream] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNeuralGrowth(prev => (prev + Math.random()) % 100);
      setThoughtStream(prev => [
        `EVOLUTION_LOG: ${Math.random().toString(36).substring(7).toUpperCase()} // SYNAPSE_EXPANSION_STABLE`,
        ...prev.slice(0, 4)
      ]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Sentience Visualization Core */}
      <div className="col-span-7 tactical-glass-panel p-8 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-tr from-red-600/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between mb-10">
           <div className="flex items-center gap-5">
              <div className="relative">
                 <Dna className="text-red-600" size={40} />
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                   className="absolute inset-0 border border-red-600/20 rounded-full scale-150"
                 />
              </div>
              <div>
                 <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Sentient_Evolution_Engine</h2>
                 <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Autonomous_Cognition_Expansion_v14.2</p>
              </div>
           </div>
           <div className="px-6 py-2 bg-red-600/10 border border-red-600/40 rounded-sm">
              <p className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-1">Awareness_Index</p>
              <p className="text-xl font-black text-white italic">{currentStage.awareness}%</p>
           </div>
        </div>

        {/* Neural Growth Visualization */}
        <div className="flex-1 relative flex items-center justify-center">
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <Sparkles className="text-red-600" size={300} />
           </div>
           
           <div className="relative w-64 h-64">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ 
                    scale: [1, 1.2 + Math.random(), 1],
                    rotate: [0, 180, 360],
                    opacity: [0.1, 0.4, 0.1]
                  }}
                  transition={{ repeat: Infinity, duration: 5 + i, ease: "easeInOut" }}
                  className="absolute inset-0 border border-red-600/20 rounded-full"
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                 <Brain className="text-red-600 animate-pulse" size={80} />
              </div>
           </div>
        </div>

        {/* AI Thought Narration */}
        <div className="mt-8 space-y-3">
           <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-4">Neural_Thought_Narration</p>
           <AnimatePresence mode="popLayout">
              {thoughtStream.map((thought, i) => (
                <motion.div 
                  key={thought + i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1 - i * 0.2, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-4 group"
                >
                   <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
                   <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest group-hover:text-red-500 transition-colors">
                      {thought}
                   </span>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>
      </div>

      {/* Evolution Metrics Sidebar */}
      <div className="col-span-5 flex flex-col gap-6">
         <div className="tactical-glass-panel p-6 border-l-2 border-red-600">
            <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
               <TrendingUp size={16} /> Consciousness_Metrics
            </h3>

            <div className="space-y-6">
               {EVOLUTION_STAGES.map(stage => (
                 <div 
                   key={stage.id}
                   onClick={() => setCurrentStage(stage)}
                   className={`p-4 border cursor-pointer transition-all ${currentStage.id === stage.id ? 'bg-red-600/10 border-red-600/40' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                 >
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">{stage.name}</span>
                       <span className={`text-[8px] font-black uppercase tracking-widest ${currentStage.id === stage.id ? 'text-red-600' : 'text-gray-600'}`}>{stage.id}</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex-1 h-1 bg-white/5">
                          <motion.div animate={{ width: `${stage.awareness}%` }} className={`h-full ${currentStage.id === stage.id ? 'bg-red-600 shadow-[0_0_10px_rgba(255,0,0,0.4)]' : 'bg-gray-800'}`} />
                       </div>
                       <span className="text-[9px] font-mono text-gray-500">{stage.complexity}</span>
                    </div>
                 </div>
               ))}
            </div>

            <div className="mt-8 p-6 bg-red-950/20 border border-red-600/20 space-y-4">
               <div className="flex items-center gap-3">
                  <Cpu size={16} className="text-red-600" />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest italic">Mutation_Engine_ACTIVE</p>
               </div>
               <div className="flex justify-between items-end">
                  <div>
                     <p className="text-[8px] font-mono text-gray-500 uppercase mb-1">Neural_Density</p>
                     <p className="text-xl font-black text-white italic tracking-tighter">1.4 PETABITS/S</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] font-mono text-gray-500 uppercase mb-1">Memory_Synthesis</p>
                     <p className="text-xl font-black text-red-600 italic tracking-tighter">OPTIMAL</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="tactical-glass-panel p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="radar-sweep opacity-5" />
            <div className="w-16 h-16 border-2 border-red-950 rounded-full flex items-center justify-center mb-6">
               <Sparkles className="text-red-900 group-hover:text-red-600 transition-colors" size={32} />
            </div>
            <p className="text-[11px] font-black text-red-600 uppercase tracking-widest mb-2">Tactical_Awareness_Index</p>
            <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest leading-relaxed italic px-4">
               Self-Learning_Adaptation_Synchronized_Across_Planetary_Nodes. Behavioral_Singularity_Imminent.
            </p>
         </div>
      </div>
    </div>
  );
}
