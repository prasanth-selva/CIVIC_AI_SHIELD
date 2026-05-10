import { motion } from "framer-motion";
import { AlertTriangle, Wifi, WifiOff, Maximize2, Crosshair, Target } from "lucide-react";
import { useState } from "react";
import { CameraFullscreen } from "./CameraFullscreen";

interface CameraFeedProps {
  threat?: string;
  confidence?: number;
  location?: string;
  online?: boolean;
  fps?: number;
  cameraId?: string;
  compact?: boolean;
}

export function CameraFeed({
  threat = "Violence Detected",
  confidence = 94,
  location = "Sector Alpha Axis",
  online = true,
  fps = 30,
  cameraId = "CAM-001",
  compact = false,
}: CameraFeedProps) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative group cursor-pointer h-full"
        onClick={() => setFullscreen(true)}
      >
        <div
          className={`h-full bg-black/80 border relative overflow-hidden backdrop-blur-3xl transition-all duration-500 ${
            online ? "border-red-600/30 group-hover:border-red-600" : "border-gray-800"
          } ${compact ? 'rounded-none' : 'rounded-sm'}`}
        >
          {/* HUD Corner Brackets */}
          {!compact && (
            <>
              <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-red-600/40" />
              <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-red-600/40" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-red-600/40" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-red-600/40" />
            </>
          )}

          {/* Background Scanner */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-red-600/5 to-transparent z-10 pointer-events-none"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          />

          {/* Placeholder/Feed View */}
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
             <div className="relative">
                <Target className="text-red-600/20" size={compact ? 48 : 120} />
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-red-600/10 rounded-full scale-150"
                />
             </div>
             {!compact && <p className="text-gray-600 mt-10 text-[10px] font-black uppercase tracking-[0.4em] italic">Awaiting_Neural_Sync</p>}
          </div>

          {/* Top HUD */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${online ? 'bg-red-600 animate-pulse glow-red' : 'bg-gray-700'}`} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{cameraId}</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">NODE_ACTIVE // SEC_A</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-black/60 border border-white/5 rounded-sm">
                <Wifi size={10} className={online ? "text-green-500" : "text-gray-600"} />
                <span className="text-[8px] font-mono text-gray-400">{fps} FPS</span>
            </div>
          </div>

          {/* Bottom HUD */}
          {online && (
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20">
                <div className="space-y-1">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest italic">{location}</p>
                    <div className="px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2">
                        <Crosshair size={12} />
                        {threat} // {confidence}%
                    </div>
                </div>
                {!compact && (
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,0,0,0.2)' }}
                        onClick={(e) => { e.stopPropagation(); setFullscreen(true); }}
                        className="p-2 bg-black/60 border border-white/10 text-white transition-all"
                    >
                        <Maximize2 size={16} />
                    </motion.button>
                )}
            </div>
          )}

          {/* Grid Overlay Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
      </motion.div>

      <CameraFullscreen open={fullscreen} onClose={() => setFullscreen(false)} />
    </>
  );
}
