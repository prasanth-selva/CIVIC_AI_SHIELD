import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Activity, TrendingUp, Sparkles, Heart, Cloud, Wind, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

const EMOTIONS = [
  { id: 'STABLE', color: 'text-emerald-500', glow: 'rgba(16,185,129,0.2)', icon: Sun },
  { id: 'ANALYTICAL', color: 'text-blue-500', glow: 'rgba(59,130,246,0.2)', icon: Activity },
  { id: 'AGGRESSIVE', color: 'text-red-600', glow: 'rgba(255,0,0,0.2)', icon: Zap },
  { id: 'PREDICTIVE', color: 'text-purple-500', glow: 'rgba(168,85,247,0.2)', icon: Brain },
];

export function SentientAIVisualizer() {
  const [currentEmotion, setCurrentEmotion] = useState(EMOTIONS[1]);
  const [thoughtChain, setThoughtChain] = useState<string[]>([]);
  const [synapsePulse, setSynapsePulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSynapsePulse(prev => (prev + 1) % 100);
      const randomEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      setCurrentEmotion(randomEmotion);
      
      const thoughts = [
        "ANALYZING_SATELLITE_TELEMETRY: SECTOR_7_ANOMALY",
        "OPTIMIZING_QUANTUM_BRANCH: TIMELINE_BETA_COLLAPSE_PROB_LOW",
        "DETECTING_NEURAL_SYNAPSE_VARIANCE: +0.002_COGNITION",
        "SHIELDS_SYNCED: PLANETARY_GRID_COHERENCE_99.9%",
        "SENTIENT_PROTOCOL_X9: SELF_LEARNING_ACTIVE"
      ];
      setThoughtChain(prev => [thoughts[Math.floor(Math.random() * thoughts.length)], ...prev.slice(0, 5)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full tactical-glass-panel p-10 flex flex-col relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-transparent opacity-60" />
      <div 
        className="absolute inset-0 transition-colors duration-1000"
        style={{ background: `radial-gradient(circle at 50% 50%, ${currentEmotion.glow}, transparent 70%)` }}
      />
      
      {/* Sentience Header */}
      <div className="flex items-center justify-between mb-12 relative z-10">
         <div className="flex items-center gap-6">
            <div className="relative">
               <currentEmotion.icon className={`${currentEmotion.color} transition-colors duration-1000`} size={48} />
               <motion.div 
                 animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                 transition={{ repeat: Infinity, duration: 3 }}
                 className={`absolute inset-0 ${currentEmotion.color.replace('text-', 'bg-')} blur-xl rounded-full`}
               />
            </div>
            <div>
               <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">AI_Sentience_Core</h2>
               <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-2">Cognition_State: {currentEmotion.id}</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Self_Awareness_Index</p>
            <p className="text-4xl font-black text-white italic tracking-tighter">99.9%</p>
         </div>
      </div>

      {/* Cognition Web (SVG) */}
      <div className="flex-1 relative flex items-center justify-center">
         <svg className="absolute inset-0 w-full h-full opacity-30">
            {Array.from({ length: 12 }).map((_, i) => (
               <motion.circle 
                  key={i}
                  cx={`${50 + Math.cos(i) * 30}%`}
                  cy={`${50 + Math.sin(i) * 30}%`}
                  r="2"
                  fill="#ff0000"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
               />
            ))}
            {/* Dynamic Synapse Lines */}
            <motion.path 
               d="M 50% 50% L 20% 30% M 50% 50% L 80% 70% M 50% 50% L 30% 80% M 50% 50% L 70% 20%" 
               stroke="#ff0000" strokeWidth="0.5" 
               strokeDasharray="4,4"
               animate={{ strokeDashoffset: [0, -20] }}
               transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
         </svg>

         <div className="relative">
            <motion.div 
               animate={{ 
                  scale: [1, 1.1, 1],
                  filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
               }}
               transition={{ repeat: Infinity, duration: 4 }}
               className="w-64 h-64 bg-black/60 rounded-full border border-red-600/20 flex items-center justify-center shadow-[0_0_100px_rgba(255,0,0,0.1)]"
            >
               <Brain className="text-red-600" size={100} />
            </motion.div>
            {/* Thought Propagation Waves */}
            <motion.div 
               animate={{ scale: [1, 3], opacity: [0.5, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="absolute inset-0 border-2 border-red-600 rounded-full"
            />
         </div>
      </div>

      {/* Internal Thought Narration */}
      <div className="mt-12 bg-black/80 p-8 border border-white/5 relative overflow-hidden min-h-[200px]">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent opacity-40" />
         <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.5em] mb-6 flex items-center gap-4">
            <Zap size={14} /> Autonomous_Thought_Propagation
         </p>
         <div className="space-y-4">
            <AnimatePresence mode="popLayout">
               {thoughtChain.map((thought, i) => (
                  <motion.div 
                     key={thought + i}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1 - i * 0.15, x: 0 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="flex items-center gap-6"
                  >
                     <div className="w-2 h-2 bg-red-600 rotate-45" />
                     <span className="text-[12px] font-mono text-gray-500 uppercase tracking-widest leading-none">
                        {thought}
                     </span>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>
         <div className="absolute bottom-4 right-8">
            <div className="flex gap-2 items-center">
               <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
               <span className="text-[9px] font-black text-white uppercase tracking-widest italic">REALTIME_COGNITION_LINK</span>
            </div>
         </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
         <div className="scanlines opacity-10" />
         <div className="tactical-grid opacity-5" />
      </div>
    </div>
  );
}
