import { motion, AnimatePresence } from "framer-motion";
import { Zap, Activity, Shield, Target, AlertTriangle, Layers, Clock, Play, Square, RefreshCw, Box, Move } from "lucide-react";
import { useState, useEffect } from "react";

const SCENARIOS = [
  { id: 'SCENARIO-942', title: 'METROPOLIS_COLLAPSE', probability: 94, risk: 'CRITICAL', status: 'SIMULATING' },
  { id: 'SCENARIO-108', title: 'GRID_CASCADE_FAILURE', probability: 12, risk: 'ELEVATED', status: 'IDLE' },
  { id: 'SCENARIO-561', title: 'SWARM_PROTOCOL_BREACH', probability: 4, risk: 'SEVERE', status: 'IDLE' },
];

export function TacticalSimulationReality() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [simProgress, setSimProgress] = useState(0);
  const [simulationData, setSimulationData] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSimProgress(prev => (prev + 1) % 100);
      setSimulationData(Array.from({ length: 40 }, () => Math.random() * 100));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Simulation Reality Engine */}
      <div className="col-span-8 tactical-glass-panel p-8 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.05),transparent_70%)]" />
        
        <div className="flex items-center justify-between mb-10">
           <div className="flex items-center gap-5">
              <Box className="text-red-600" size={36} />
              <div>
                 <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Simulation_Reality_Engine</h2>
                 <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Autonomous_Crisis_Modeling_v9.2</p>
              </div>
           </div>
           <div className="flex gap-4">
              <div className="px-4 py-2 bg-red-600/10 border border-red-600/40 text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-3">
                 <RefreshCw className="animate-spin" size={14} /> SIM_ACTIVE
              </div>
              <div className="px-4 py-2 bg-black/60 border border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-3">
                 <Clock size={14} /> 00:04:12:88
              </div>
           </div>
        </div>

        {/* Predictive Movement Tracking (Waveform) */}
        <div className="flex-1 bg-black/40 border border-white/5 rounded-sm relative overflow-hidden flex flex-col justify-end p-8 group">
           <div className="absolute top-8 left-8">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-2">Simulated_Emergency_Propagation</p>
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{activeScenario.title}</h3>
           </div>
           
           <div className="flex items-end gap-1 h-64">
              {simulationData.map((val, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className={`flex-1 ${val > 80 ? 'bg-red-600' : 'bg-red-950/40'} border-t border-red-600/40`}
                />
              ))}
           </div>

           {/* Alternate Timeline Markers */}
           <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-red-600/10" />
           <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-red-600/10" />
           
           <div className="absolute inset-0 pointer-events-none">
              <div className="scanlines opacity-10" />
              <div className="tactical-grid opacity-5" />
           </div>
        </div>

        {/* Simulation Controls */}
        <div className="mt-8 flex gap-4">
           <button className="flex-1 h-14 bg-red-600 text-black text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-white transition-all">
              <Play size={18} fill="currentColor" /> START_SIMULATION
           </button>
           <button className="flex-1 h-14 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-white/5 transition-all">
              <Square size={18} fill="currentColor" /> TERMINATE
           </button>
           <button className="w-14 h-14 border border-white/10 text-white flex items-center justify-center hover:bg-white/5 transition-all">
              <RefreshCw size={20} />
           </button>
        </div>
      </div>

      {/* Scenario Selection Sidebar */}
      <div className="col-span-4 flex flex-col gap-6">
         <div className="tactical-glass-panel p-6 border-r-2 border-red-600">
            <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
               <Layers size={16} /> Crisis_Scenario_Grid
            </h3>

            <div className="space-y-4">
               {SCENARIOS.map(scenario => (
                 <div 
                   key={scenario.id}
                   onClick={() => setActiveScenario(scenario)}
                   className={`p-6 border cursor-pointer transition-all ${activeScenario.id === scenario.id ? 'bg-red-600/10 border-red-600/40' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                 >
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">{scenario.id}</span>
                       <div className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${scenario.risk === 'CRITICAL' ? 'bg-red-600 text-black' : 'bg-orange-500 text-black'}`}>
                          {scenario.risk}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <p className="text-[12px] font-black text-white italic uppercase">{scenario.title}</p>
                          <span className="text-[10px] font-mono text-gray-500">{scenario.probability}% PROB</span>
                       </div>
                       <div className="h-1 bg-white/5 w-full">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${scenario.probability}%` }} className="h-full bg-red-600" />
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="mt-8 p-6 bg-black border border-white/5 space-y-4 relative overflow-hidden group">
               <div className="flex items-center gap-3">
                  <Move size={16} className="text-red-600 animate-pulse" />
                  <p className="text-[9px] font-black text-white uppercase tracking-widest">Predictive_Civilian_Logic</p>
               </div>
               <p className="text-[8px] font-mono text-gray-600 uppercase leading-relaxed italic">
                  Virtual_City_Collapse_Modeling_Enabled. Strategic_Response_Simulations_Running_On_Alternate_Timelines.
               </p>
            </div>
         </div>

         <div className="tactical-glass-panel p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="radar-sweep opacity-5" />
            <div className="w-16 h-16 border border-white/5 rounded-sm flex items-center justify-center mb-6 relative">
               <Target className="text-red-900 group-hover:text-red-600 transition-colors" size={32} />
               <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-red-600/10 rounded-full" />
            </div>
            <p className="text-[11px] font-black text-red-600 uppercase tracking-widest mb-2">Sim_Reality_Sync</p>
            <p className="text-[8px] font-mono text-gray-700 uppercase tracking-widest leading-relaxed">
               Strategic_Response_Sandbox_STABLE. Alternate_Future_Rendering_ACTIVE.
            </p>
         </div>
      </div>
    </div>
  );
}
