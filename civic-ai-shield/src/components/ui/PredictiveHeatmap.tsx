import { motion } from 'framer-motion';
import { Map, Flame, TrendingUp, Info } from 'lucide-react';

const hotspots = [
  { id: 1, x: '20%', y: '30%', intensity: 0.8, label: 'Sector A1' },
  { id: 2, x: '65%', y: '45%', intensity: 0.4, label: 'Sector C3' },
  { id: 3, x: '40%', y: '75%', intensity: 0.9, label: 'Sector B2' },
  { id: 4, x: '80%', y: '20%', intensity: 0.2, label: 'Sector D4' },
];

export function PredictiveHeatmap() {
  return (
    <div className="bg-gradient-to-br from-black/40 to-black/20 border border-white/5 rounded-3xl p-6 backdrop-blur-2xl relative overflow-hidden h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Map size={18} className="text-cyan-400" />
            Predictive Heatmap
          </h3>
          <p className="text-gray-400 text-xs">AI Forecast for T+120 minutes</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-[10px] font-black uppercase tracking-tighter">
            <TrendingUp size={12} />
            High Accuracy Mode
        </div>
      </div>

      {/* Blueprint Grid */}
      <div className="relative aspect-video rounded-2xl bg-[#0a0e1a] border border-white/5 overflow-hidden group">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        {/* Procedural City Blueprint (Lines) */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 225">
            <path d="M50 0 V225 M150 0 V225 M250 0 V225 M350 0 V225" stroke="white" strokeWidth="0.5" />
            <path d="M0 50 H400 M0 120 H400 M0 180 H400" stroke="white" strokeWidth="0.5" />
            <rect x="60" y="60" width="80" height="50" fill="none" stroke="white" strokeWidth="1" />
            <rect x="260" y="20" width="100" height="80" fill="none" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="112" r="30" fill="none" stroke="white" strokeWidth="1" />
        </svg>

        {/* Heat Blobs */}
        {hotspots.map((spot) => (
            <motion.div
                key={spot.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [spot.intensity * 0.5, spot.intensity, spot.intensity * 0.5]
                }}
                transition={{ repeat: Infinity, duration: 3, delay: spot.id * 0.5 }}
                className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                style={{ 
                    left: spot.x, 
                    top: spot.y, 
                    backgroundColor: spot.intensity > 0.7 ? '#ef4444' : '#f59e0b'
                }}
            />
        ))}

        {/* Tactical Overlay */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
            <div className="flex justify-between">
                <span className="text-[10px] font-mono text-cyan-500/50">GRID_REF: [AX-9]</span>
                <span className="text-[10px] font-mono text-cyan-500/50">SCAN_FREQ: 2.4GHz</span>
            </div>
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                   <div className="flex items-center gap-2 text-white font-black text-[10px] bg-black/60 px-2 py-1 rounded border border-white/10">
                        <Flame size={10} className="text-red-500" />
                        CRITICAL_ZONE: SECTOR_B2
                   </div>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Risk Forecast</p>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">82%</span>
                <span className="text-red-500 text-xs font-bold">▲ 12%</span>
            </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Crowd Density</p>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">High</span>
                <span className="text-cyan-400 text-xs font-bold">STABLE</span>
            </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-gray-500 text-[10px]">
          <Info size={12} />
          Predictive model based on historical incident density and 24h behavior patterns.
      </div>
    </div>
  );
}
