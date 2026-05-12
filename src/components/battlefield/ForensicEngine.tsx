import { motion, AnimatePresence } from "framer-motion";
import { History, Search, Shield, Target, FileText, CheckCircle, Clock, Zap, AlertTriangle, Layers, Hash } from "lucide-react";
import { useState, useEffect } from "react";

const FORENSIC_EVENTS = [
  { id: 'EV-001', time: '02:14:22', type: 'INTRUSION', detail: 'Neural_Link_Breach_Attempted', node: 'NODE-NA-1', hash: 'SHA256: 8f2b...9a1c' },
  { id: 'EV-002', time: '02:14:45', type: 'AUTONOMOUS_DEFENSE', detail: 'Citadel_Protocol_Alpha_Engaged', node: 'NODE-NA-1', hash: 'SHA256: d4e5...b2f1' },
  { id: 'EV-003', time: '02:15:10', type: 'THREAT_NEUTRALIZED', detail: 'Pattern_Ghost_Filter_Active', node: 'CORE-HUB', hash: 'SHA256: a7c8...e3d4' },
  { id: 'EV-004', time: '02:16:05', type: 'SURVEILLANCE_HANDOFF', detail: 'Drone_V2_Tracking_Target_Alpha', node: 'SECTOR-7', hash: 'SHA256: 1c9d...f6e5' },
];

export function ForensicEngine() {
  const [selectedEvent, setSelectedEvent] = useState(FORENSIC_EVENTS[0]);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyEvidence = () => {
    setIsVerifying(true);
    setTimeout(() => setIsVerifying(false), 2000);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Timeline Reconstruction */}
      <div className="col-span-8 tactical-glass-panel p-8 relative overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-10">
           <div className="flex items-center gap-4">
              <History className="text-red-600" size={32} />
              <div>
                 <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Tactical_Forensics</h2>
                 <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Historical_Threat_Timeline_Reconstruction_v4.2</p>
              </div>
           </div>
           <div className="flex gap-4">
              <div className="px-3 py-1 bg-black/60 border border-white/5 text-[8px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                 <Clock size={12} /> Live_Playback_Sync
              </div>
              <div className="px-3 py-1 bg-red-600/10 border border-red-600/40 text-[8px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                 <Shield size={12} /> Evidence_Integrity_Chain
              </div>
           </div>
        </div>

        {/* Forensic Timeline View */}
        <div className="flex-1 space-y-4 relative">
           <div className="absolute left-[39px] top-0 bottom-0 w-[1px] bg-red-600/20" />
           {FORENSIC_EVENTS.map((event, i) => (
             <motion.div 
               key={event.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               onClick={() => setSelectedEvent(event)}
               className={`relative pl-20 py-4 group cursor-pointer transition-all ${selectedEvent.id === event.id ? 'bg-red-600/5' : 'hover:bg-white/5'}`}
             >
                <div className={`absolute left-[35px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 transition-colors ${selectedEvent.id === event.id ? 'bg-red-600 border-red-600' : 'bg-black border-red-900 group-hover:border-red-600'}`} />
                <div className="flex items-center justify-between pr-8">
                   <div className="space-y-1">
                      <div className="flex items-center gap-4">
                         <span className="text-[10px] font-mono text-red-600 font-black">{event.time}</span>
                         <span className="text-[11px] font-black text-white uppercase tracking-widest italic">{event.type}</span>
                      </div>
                      <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">{event.detail}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-1">Source_Node</p>
                      <p className="text-[10px] font-mono text-white font-bold">{event.node}</p>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Evidence Verification Bar */}
        <div className="mt-8 p-6 bg-black/60 border border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="p-3 bg-red-600/10 border border-red-600/20">
                 <Hash className="text-red-600" size={20} />
              </div>
              <div>
                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Selected_Evidence_Hash</p>
                 <p className="text-[12px] font-mono text-white tracking-widest">{selectedEvent.hash}</p>
              </div>
           </div>
           <button 
             onClick={verifyEvidence}
             disabled={isVerifying}
             className={`px-8 h-12 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 transition-all ${isVerifying ? 'bg-emerald-600 text-black' : 'bg-red-600 text-black hover:bg-white'}`}
           >
              {isVerifying ? (
                <>
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                   VERIFYING_CHAIN...
                </>
              ) : (
                <>
                   <CheckCircle size={16} />
                   VERIFY_INTEGRITY
                </>
              )}
           </button>
        </div>
      </div>

      {/* Forensic Intelligence Sidebar */}
      <div className="col-span-4 flex flex-col gap-6">
         <div className="tactical-glass-panel p-6 border-r-2 border-red-600">
            <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
               <Layers size={16} /> Strategic_Analysis
            </h3>
            
            <div className="space-y-8">
               <div className="p-4 bg-black/40 border border-white/5 space-y-4">
                  <p className="text-[9px] font-black text-white uppercase tracking-widest">AI_Reasoning_Timeline</p>
                  <div className="space-y-3">
                     {['Anomalous Pattern Detected', 'Cross-Node Verification Synchronized', 'Escalation Probability Calculated', 'Response Directive Generated'].map((step, i) => (
                        <div key={i} className="flex gap-4">
                           <span className="text-[8px] font-mono text-red-900">{i+1}.</span>
                           <span className="text-[9px] font-mono text-gray-500 uppercase italic tracking-tighter">{step}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Trajectory_Reconstruction</p>
                  <div className="h-40 relative bg-black/60 border border-red-600/10 rounded-sm p-4 overflow-hidden">
                     <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#ff0000,transparent_70%)]" />
                     <svg className="absolute inset-0 w-full h-full">
                        <motion.path 
                          d="M20 140 L 100 80 L 180 120 L 250 40" 
                          fill="none" 
                          stroke="rgba(255,0,0,0.4)" 
                          strokeWidth="2"
                          strokeDasharray="10,5"
                          animate={{ strokeDashoffset: [0, -30] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                     </svg>
                     <div className="absolute top-4 left-4 text-[7px] font-mono text-gray-600">VECTOR_MAP_v2.0</div>
                  </div>
               </div>
            </div>
         </div>

         <div className="tactical-glass-panel p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="radar-sweep opacity-5" />
            <div className="w-16 h-16 border border-white/5 rounded-full flex items-center justify-center mb-6 relative">
               <FileText className="text-red-900" size={28} />
            </div>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Automated_Report_Gen</p>
            <p className="text-[8px] font-mono text-gray-700 uppercase tracking-[0.2em] leading-relaxed">
               Tactical_Summary_ID: FR-942-B. Authorized_For_Commander_Review_Only.
            </p>
         </div>
      </div>
    </div>
  );
}
