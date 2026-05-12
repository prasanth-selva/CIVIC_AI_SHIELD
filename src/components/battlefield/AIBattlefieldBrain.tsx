import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Target, Shield, Activity, TrendingUp, ChevronRight, MessageSquare, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

const THOUGHT_STREAM = [
  "ANALYZING SATELLITE TELEMETRY FROM SECTOR-7...",
  "IDENTIFIED ANOMALOUS CROWD FORMATION AT COORDINATES 34.05, -118.24",
  "PREDICTING 84% PROBABILITY OF CIVILIAN UNREST ESCALATION",
  "GENERATE TACTICAL DIRECTIVE: ALPHA-9-SECURE",
  "ORCHESTRATING FIELD UNITS FOR CONTAINMENT...",
  "THREAT NEUTRALIZATION CONFIDENCE: 92.4%",
  "MONITORING NEURAL LINK INTEGRITY...",
  "SAWI_OS STABLE. CONTINUING AUTONOMOUS REASONING."
];

export function AIBattlefieldBrain() {
  const [activeThoughts, setActiveThoughts] = useState<string[]>([]);
  const [cognitionLevel, setCognitionLevel] = useState(88);
  const [threatRank, setThreatRank] = useState('ELEVATED');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveThoughts(prev => [
        THOUGHT_STREAM[Math.floor(Math.random() * THOUGHT_STREAM.length)],
        ...prev.slice(0, 5)
      ]);
      setCognitionLevel(prev => Math.min(100, Math.max(80, prev + (Math.random() * 4 - 2))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* AI Consciousness Layer */}
      <div className="col-span-7 tactical-glass-panel p-8 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className="relative">
               <Brain className="text-red-600" size={40} />
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute inset-0 bg-red-600/20 blur-xl rounded-full"
               />
            </div>
            <div>
               <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">SAWI_CONSCIOUSNESS</h2>
               <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Strategic_Autonomous_Warfare_Intelligence_v1.0</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-red-600/10 border border-red-600/40 rounded-sm">
             <p className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-1">Cognition_Engine</p>
             <p className="text-xl font-black text-white italic">{cognitionLevel.toFixed(1)}%</p>
          </div>
        </div>

        {/* Neural Thought Stream */}
        <div className="flex-1 space-y-4 overflow-hidden">
           <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] mb-6">Neural_Thought_Stream_LIVE</p>
           <AnimatePresence>
              {activeThoughts.map((thought, i) => (
                <motion.div 
                  key={thought + i}
                  initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1 - i * 0.15, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 group cursor-help"
                >
                   <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-red-600 animate-pulse' : 'bg-red-950'}`} />
                   <span className={`text-[11px] font-mono tracking-widest uppercase ${i === 0 ? 'text-red-500 font-black' : 'text-gray-600'}`}>
                      {thought}
                   </span>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* AI Awareness Visualization */}
        <div className="mt-8 h-32 flex items-end gap-1 px-4">
           {Array.from({ length: 60 }).map((_, i) => (
             <motion.div
               key={i}
               animate={{ height: [10, Math.random() * 100 + 10, 10] }}
               transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.05 }}
               className="flex-1 bg-red-600/10 group-hover:bg-red-600/30 transition-colors"
             />
           ))}
        </div>
      </div>

      {/* Strategic Intelligence Sidebar */}
      <div className="col-span-5 flex flex-col gap-6">
         <div className="tactical-glass-panel p-6 border-l-2 border-red-600">
            <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
               <Target size={16} /> Autonomous_Directive_Engine
            </h3>

            <div className="space-y-8">
               <div className="p-4 bg-red-950/20 border border-red-600/20 space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                     <Zap className="text-red-600" size={14} />
                  </div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest italic">ACTIVE_MISSION: CITADEL_GUARD</p>
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] font-mono text-gray-500 uppercase">Confidence_Rating</span>
                     <span className="text-emerald-500 font-black italic">94.2%</span>
                  </div>
                  <div className="h-1 bg-white/5 w-full">
                     <motion.div initial={{ width: 0 }} animate={{ width: "94.2%" }} className="h-full bg-emerald-500" />
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Escalation_Forecast</p>
                  <div className="h-32 relative bg-black/40 border border-white/5 rounded-sm p-4 overflow-hidden">
                     <svg className="absolute inset-0 w-full h-full opacity-40">
                        <motion.path 
                          d="M0 80 Q 50 20 100 60 T 200 40 T 300 10" 
                          fill="none" 
                          stroke="#ff0000" 
                          strokeWidth="2"
                          animate={{ d: ["M0 80 Q 50 20 100 60 T 200 40 T 300 10", "M0 70 Q 50 90 100 30 T 200 60 T 300 20"] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <TrendingUp className="text-red-900/20" size={64} />
                     </div>
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Tactical_Response_Tree</p>
                  {['DEFENSIVE_MESH_DEPLOY', 'NEURAL_CIPHER_LOCK', 'FIELD_UNIT_ORCHESTRATE'].map(action => (
                    <div key={action} className="flex items-center justify-between p-3 border border-white/5 bg-black/20 hover:border-red-600/40 transition-colors group cursor-pointer">
                       <span className="text-[9px] font-mono text-gray-400 group-hover:text-white transition-colors">{action}</span>
                       <ChevronRight size={12} className="text-red-900 group-hover:text-red-600" />
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="tactical-glass-panel p-6 flex flex-col justify-center gap-4 relative overflow-hidden group">
            <div className="radar-sweep opacity-5" />
            <div className="flex items-center gap-4">
               <AlertCircle className="text-orange-500 animate-pulse" size={20} />
               <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic">Strategic_Threat_Ranking</h3>
            </div>
            <div className="flex justify-between items-end">
               <span className="text-3xl font-black text-white italic tracking-tighter">PHASE_IV</span>
               <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">CRITICAL_THRESHOLD</span>
            </div>
         </div>
      </div>
    </div>
  );
}
