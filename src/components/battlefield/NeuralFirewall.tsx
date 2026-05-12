import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Activity, ShieldAlert, ShieldCheck, Lock, Unlock, AlertTriangle, Cpu, Terminal, Wifi, Network } from "lucide-react";
import { useState, useEffect } from "react";

const DEFENSE_NODES = [
  { id: 'FW-CORE-1', status: 'ACTIVE', integrity: 99.9, threat: 'LOW', layer: 'QUANTUM_SYNC' },
  { id: 'FW-NODE-ALPHA', status: 'BREACH_ATTEMPT', integrity: 84.2, threat: 'ELEVATED', layer: 'NEURAL_MESH' },
  { id: 'FW-GATE-OMEGA', status: 'LOCKED', integrity: 100.0, threat: 'NONE', layer: 'CIPHER_GATE' },
];

export function NeuralFirewall() {
  const [nodes, setNodes] = useState(DEFENSE_NODES);
  const [isNeutralizing, setIsNeutralizing] = useState(false);
  const [intrusionWave, setIntrusionWave] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIntrusionWave(Array.from({ length: 50 }, () => Math.random() * 100));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerNeutralize = () => {
    setIsNeutralizing(true);
    setTimeout(() => {
      setNodes(prev => prev.map(n => ({ ...n, status: 'ACTIVE', integrity: 99.9, threat: 'LOW' })));
      setIsNeutralizing(false);
    }, 3000);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Neural Defense Grid */}
      <div className="col-span-8 tactical-glass-panel p-8 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.05),transparent_70%)]" />
        
        <div className="flex items-center justify-between mb-10">
           <div className="flex items-center gap-5">
              <div className="relative">
                 <Shield className="text-red-600" size={36} />
                 <motion.div 
                   animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.4, 0.1] }}
                   transition={{ repeat: Infinity, duration: 4 }}
                   className="absolute inset-0 bg-red-600/20 rounded-full blur-xl"
                 />
              </div>
              <div>
                 <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Neural_Firewall_Array</h2>
                 <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Autonomous_Intrusion_Neutralization_v12.0</p>
              </div>
           </div>
           <button 
             onClick={triggerNeutralize}
             disabled={isNeutralizing}
             className={`px-6 h-10 border border-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${isNeutralizing ? 'bg-red-600 text-black shadow-[0_0_20px_rgba(255,0,0,0.6)]' : 'text-red-600 hover:bg-red-600/10'}`}
           >
              <Zap className={isNeutralizing ? 'animate-pulse' : ''} size={14} />
              {isNeutralizing ? 'NEUTRALIZING_THREAT...' : 'INITIALIZE_COUNTER_WAVE'}
           </button>
        </div>

        {/* Intrusion Waveform Visualization */}
        <div className="flex-1 bg-black/40 border border-white/5 rounded-sm relative overflow-hidden p-8 flex flex-col group">
           <div className="absolute top-8 left-8 flex justify-between w-[calc(100%-64px)] items-start">
              <div>
                 <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-2">Live_Intrusion_Wave_Tracking</p>
                 <div className="flex items-center gap-4">
                    <span className="text-3xl font-black text-white italic tracking-tighter uppercase">ANOMALY_DETECTED_SECTOR_4</span>
                    <AlertTriangle className="text-orange-500 animate-pulse" size={24} />
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Firewall_Integrity</p>
                 <p className="text-4xl font-black text-white italic tracking-tighter uppercase">99.42%</p>
              </div>
           </div>
           
           <div className="flex-1 flex items-center justify-center gap-1">
              {intrusionWave.map((val, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: `${val}%`, backgroundColor: val > 80 ? 'rgba(255,0,0,0.6)' : 'rgba(255,0,0,0.1)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="flex-1 min-w-[2px] rounded-full"
                />
              ))}
           </div>

           <div className="absolute inset-0 pointer-events-none">
              <div className="scanlines opacity-10" />
              <div className="tactical-grid opacity-5" />
              {isNeutralizing && (
                <motion.div 
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600/20 to-transparent skew-x-12"
                />
              )}
           </div>
        </div>
      </div>

      {/* Defense Control Sidebar */}
      <div className="col-span-4 flex flex-col gap-6">
         <div className="tactical-glass-panel p-6 border-r-2 border-red-600">
            <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
               <ShieldAlert size={16} /> Defense_Node_Status
            </h3>

            <div className="space-y-4">
               {nodes.map(node => (
                 <div 
                   key={node.id}
                   className={`p-6 border bg-black/40 transition-all ${node.status === 'BREACH_ATTEMPT' ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/5 hover:border-red-600/20'}`}
                 >
                    <div className="flex justify-between items-center mb-4">
                       <div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest block">{node.id}</span>
                          <span className="text-[7px] font-mono text-gray-600 uppercase tracking-widest">{node.layer}</span>
                       </div>
                       {node.status === 'LOCKED' ? <Lock size={14} className="text-red-900" /> : <Wifi size={14} className="text-red-600" />}
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between text-[8px] font-mono uppercase tracking-widest">
                          <span className="text-gray-600">Node_Integrity</span>
                          <span className={node.integrity < 90 ? 'text-orange-500' : 'text-emerald-500'}>{node.integrity}%</span>
                       </div>
                       <div className="h-1 bg-white/5 w-full overflow-hidden">
                          <motion.div animate={{ width: `${node.integrity}%` }} className={`h-full ${node.integrity < 90 ? 'bg-orange-500' : 'bg-red-600'}`} />
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="mt-8 p-6 bg-red-600/5 border border-red-600/10 space-y-4 relative overflow-hidden group">
               <div className="flex items-center gap-3">
                  <Terminal size={16} className="text-red-600" />
                  <p className="text-[9px] font-black text-white uppercase tracking-widest italic">Predictive_Cyber_Defense</p>
               </div>
               <p className="text-[8px] font-mono text-gray-600 uppercase leading-relaxed italic">
                  Self-Isolating_Compromised_Nodes_In_Progress. Neural_Firewall_Shields_Engaged_Sector_Alpha.
               </p>
            </div>
         </div>

         <div className="tactical-glass-panel p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="radar-sweep opacity-5" />
            <div className="w-16 h-16 border-2 border-red-950 rounded-lg flex items-center justify-center mb-6">
               <ShieldCheck className="text-red-900 group-hover:text-red-600 transition-colors" size={32} />
            </div>
            <p className="text-[11px] font-black text-red-600 uppercase tracking-widest mb-2">Neural_OS_Lock</p>
            <p className="text-[8px] font-mono text-gray-700 uppercase tracking-widest leading-relaxed px-4">
               Autonomous_Intrusion_Neutralization_ACTIVE. All_Planetary_Nodes_Synchronized_Secure.
            </p>
         </div>
      </div>
    </div>
  );
}
