import { motion } from 'framer-motion';
import { TrendingUp, Flame, Info } from 'lucide-react';

const hotspots = [
  { id: 1, x: '20%', y: '30%', intensity: 0.8, label: 'Sector A1' },
  { id: 2, x: '65%', y: '45%', intensity: 0.4, label: 'Sector C3' },
  { id: 3, x: '40%', y: '75%', intensity: 0.9, label: 'Sector B2' },
  { id: 4, x: '80%', y: '20%', intensity: 0.2, label: 'Sector D4' },
];

export function PredictiveHeatmap() {
  return (
    <div className="glass-panel-heavy p-8 border-l-2 border-red-600 relative overflow-hidden h-full font-inter">
      <div className="radar-sweep opacity-5" />
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-1">Threat_Intelligence</p>
          <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Danger_Density_Map</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-600/30 rounded-sm text-red-600 text-[10px] font-black uppercase tracking-widest italic">
            <TrendingUp size={12} />
            Predictive_Mode
        </div>
      </div>

      <div className="relative aspect-video rounded-sm bg-black border border-white/5 overflow-hidden group">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ef444410_1px,transparent_1px),linear-gradient(to_bottom,#ef444410_1px,transparent_1px)] bg-[size:30px_30px]" />
        
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 400 225">
            <path d="M0 0 L400 225 M400 0 L0 225" stroke="red" strokeWidth="0.5" strokeDasharray="4 4" />
            <circle cx="200" cy="112" r="80" fill="none" stroke="red" strokeWidth="0.5" />
            <rect x="50" y="50" width="300" height="125" fill="none" stroke="red" strokeWidth="0.2" />
        </svg>

        {hotspots.map((spot) => (
            <motion.div
                key={spot.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [spot.intensity * 0.3, spot.intensity * 0.6, spot.intensity * 0.3]
                }}
                transition={{ repeat: Infinity, duration: 4, delay: spot.id * 0.5 }}
                className="absolute w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[40px]"
                style={{ 
                    left: spot.x, 
                    top: spot.y, 
                    backgroundColor: spot.intensity > 0.7 ? '#ff0000' : '#ff4d00'
                }}
            />
        ))}

        <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-mono text-red-600 font-bold tracking-widest">TACTICAL_GRID: [AX-09]</p>
                    <p className="text-[8px] font-mono text-gray-600">RESOLUTION: 0.02m/px</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-mono text-red-600 font-bold">NODE_SYNC: 100%</p>
                    <p className="text-[8px] font-mono text-gray-600">LATENCY: 4ms</p>
                </div>
            </div>
            <div className="flex justify-between items-end">
                <div className="bg-black/80 px-4 py-2 border border-red-600/30 rounded-sm">
                    <div className="flex items-center gap-3">
                        <Flame size={14} className="text-red-600 animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">High_Threat_Cluster_Detected</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div className="p-5 rounded-sm bg-white/5 border-l-2 border-red-600">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 italic">Risk_Probability</p>
            <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-white italic tracking-tighter">82%</span>
                <span className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">▲ CRITICAL</span>
            </div>
        </div>
        <div className="p-5 rounded-sm bg-white/5 border-l-2 border-red-950">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 italic">Threat_Expansion</p>
            <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-white italic tracking-tighter">12.4m</span>
                <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest italic">/ minute</span>
            </div>
        </div>
      </div>
      
      <div className="mt-6 flex items-center gap-2 text-gray-600 text-[9px] font-black uppercase tracking-[0.2em]">
          <Info size={12} />
          Neural model localized to Sector_Alpha_9. Forecast accuracy: 94.2%.
      </div>
    </div>
  );
}
