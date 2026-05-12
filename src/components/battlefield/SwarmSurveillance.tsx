import { motion, AnimatePresence } from "framer-motion";
import { Plane, Radio, Target, Shield, Activity, Wifi, Battery, Map, Crosshair, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const SWARM_UNITS = [
  { id: 'DRONE-V1', status: 'PATROL', battery: 84, alt: 120, speed: 45, lat: '34.0522° N' },
  { id: 'DRONE-V2', status: 'TRACKING', battery: 62, alt: 85, speed: 120, lat: '34.0519° N' },
  { id: 'DRONE-V3', status: 'SEARCH', battery: 91, alt: 200, speed: 30, lat: '34.0535° N' },
  { id: 'DRONE-V4', status: 'PATROL', battery: 45, alt: 110, speed: 40, lat: '34.0501° N' },
];

export function SwarmSurveillance() {
  const [activeUnit, setActiveUnit] = useState(SWARM_UNITS[1]);
  const [swarmPulse, setSwarmPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSwarmPulse(prev => (prev + 1) % 100);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Tactical Aerial Feed */}
      <div className="col-span-8 tactical-glass-panel p-0 relative overflow-hidden flex flex-col group">
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <h2 className="text-[12px] font-black text-white uppercase tracking-[0.4em]">LIVE_SWARM_AERIAL_FEED</h2>
           </div>
           <p className="text-[8px] font-mono text-red-600 uppercase tracking-widest mt-1">SOURCE: {activeUnit.id} // THERMAL_SCAN_ACTIVE</p>
        </div>

        {/* Video Simulation Container */}
        <div className="flex-1 bg-black relative">
           <div className="absolute inset-0 bg-red-900/10 mix-blend-color" />
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#000_100%)] opacity-60" />
           
           {/* Crosshair Overlay */}
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border border-white/10 rounded-full relative">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-red-600" />
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-red-600" />
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-4 bg-red-600" />
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1px] w-4 bg-red-600" />
              </div>
              <Crosshair className="text-red-600 animate-pulse" size={32} />
           </div>

           {/* Telemetry HUD on video */}
           <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none">
              <div className="space-y-4">
                 <div className="flex gap-4">
                    <div className="space-y-1">
                       <p className="text-[7px] font-black text-gray-500 uppercase">ALTITUDE</p>
                       <p className="text-xl font-black text-white italic">{activeUnit.alt}m</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[7px] font-black text-gray-500 uppercase">SPEED</p>
                       <p className="text-xl font-black text-white italic">{activeUnit.speed}kph</p>
                    </div>
                 </div>
                 <div className="h-0.5 bg-white/5 w-64 relative">
                    <motion.div animate={{ width: `${activeUnit.battery}%` }} className="h-full bg-red-600" />
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest">COORDS: {activeUnit.lat}</p>
                 <p className="text-[12px] font-black text-white italic tracking-tighter uppercase mt-1">Target_Acquired: T-800</p>
              </div>
           </div>

           {/* Scanlines & Grain */}
           <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
        </div>
      </div>

      {/* Swarm Coordination Sidebar */}
      <div className="col-span-4 flex flex-col gap-6">
         <div className="tactical-glass-panel p-6 border-r-2 border-red-600">
            <h3 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
               <Plane size={16} /> Swarm_Coordination
            </h3>

            <div className="space-y-4">
               {SWARM_UNITS.map(unit => (
                 <div 
                   key={unit.id}
                   onClick={() => setActiveUnit(unit)}
                   className={`p-4 border border-white/5 cursor-pointer transition-all ${activeUnit.id === unit.id ? 'bg-red-600/10 border-red-600/40' : 'bg-black/40 hover:border-white/10'}`}
                 >
                    <div className="flex justify-between items-center mb-3">
                       <div className="flex items-center gap-3">
                          <Radio size={14} className={activeUnit.id === unit.id ? 'text-red-600' : 'text-gray-600'} />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{unit.id}</span>
                       </div>
                       <span className={`text-[8px] font-black uppercase tracking-widest ${unit.status === 'TRACKING' ? 'text-orange-500' : 'text-gray-500'}`}>{unit.status}</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex-1 h-1 bg-white/5">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${unit.battery}%` }} className={`h-full ${unit.battery < 50 ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                       </div>
                       <Battery size={12} className={unit.battery < 50 ? 'text-orange-500' : 'text-emerald-500'} />
                    </div>
                 </div>
               ))}
            </div>

            <div className="mt-8 p-4 border border-dashed border-red-600/20 bg-black/40 space-y-4">
               <div className="flex items-center gap-3">
                  <Activity size={14} className="text-red-600" />
                  <p className="text-[9px] font-black text-white uppercase tracking-widest">Autonomous_Handoff_Logic</p>
               </div>
               <p className="text-[7px] font-mono text-gray-500 uppercase leading-relaxed italic">
                  Predictive_Target_Trajectory_Calculated. Node_Synchronization_Engaged_For_Continuous_Surveillance_Stream.
               </p>
            </div>
         </div>

         <div className="tactical-glass-panel p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 border border-white/5 rounded-sm flex items-center justify-center mb-4 relative">
               <Map className="text-red-900" size={28} />
               <motion.div 
                 animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                 transition={{ repeat: Infinity, duration: 4 }}
                 className="absolute inset-0 bg-red-600/20 rounded-full blur-xl"
               />
            </div>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Flight_Path_Sync</p>
            <p className="text-[8px] font-mono text-gray-700 uppercase tracking-widest leading-relaxed">
               Swarm_Node_Omega_Recon_Active. Continuous_Data_Mesh_Stabilized.
            </p>
         </div>
      </div>
    </div>
  );
}
