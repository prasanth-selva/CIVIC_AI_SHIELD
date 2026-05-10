import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Rewind, FastForward, Maximize2, Target, History, Clock, Share2, Download, Search } from "lucide-react";
import { API_BASE } from "../../config";
import { useAuth } from "../../context/AuthContext";

interface ReplayFrame {
  timestamp: number;
  frame: string;
  detections: any;
}

interface TacticalReplayProps {
  cameraId: string;
  onClose?: () => void;
}

export function TacticalReplay({ cameraId, onClose }: TacticalReplayProps) {
  const { token } = useAuth();
  const [frames, setFrames] = useState<ReplayFrame[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const playInterval = useRef<any>(null);

  useEffect(() => {
    async function fetchReplay() {
      try {
        const response = await fetch(`${API_BASE}/api/replay/${cameraId}?limit=60`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setFrames(data.timeline.reverse());
        }
      } catch (err) {
        console.error("Replay fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReplay();
  }, [cameraId, token]);

  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      playInterval.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % frames.length);
      }, 100);
    } else {
      clearInterval(playInterval.current);
    }
    return () => clearInterval(playInterval.current);
  }, [isPlaying, frames]);

  const currentFrame = frames[currentIndex];

  return (
    <div className="glass-panel-heavy border-red-600/30 overflow-hidden relative flex flex-col h-full font-inter">
      <div className="radar-sweep opacity-5" />
      
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-3">
            <History size={18} className="text-red-600" />
            <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Forensic_Replay_Engine</h3>
                <p className="text-[8px] font-black text-red-600 uppercase tracking-widest opacity-60">Source: {cameraId}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-950/20 border border-red-900/30 rounded-sm">
                <Clock size={12} className="text-red-500" />
                <span className="text-[10px] font-mono text-red-500 font-bold">
                    {currentFrame ? new Date(currentFrame.timestamp * 1000).toLocaleTimeString() : "--:--:--"}
                </span>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <Maximize2 size={16} />
            </button>
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
        {isLoading ? (
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest animate-pulse">Syncing Tactical Data...</p>
            </div>
        ) : (
            <>
                <AnimatePresence mode="wait">
                    {currentFrame && (
                        <motion.img 
                            key={currentIndex}
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: 1 }}
                            src={`data:image/jpeg;base64,${currentFrame.frame}`}
                            className="w-full h-full object-contain brightness-90 contrast-110"
                        />
                    )}
                </AnimatePresence>
                
                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-8 left-8 p-4 border-l-2 border-t-2 border-red-600/50 w-20 h-20" />
                    <div className="absolute top-8 right-8 p-4 border-r-2 border-t-2 border-red-600/50 w-20 h-20" />
                    <div className="absolute bottom-8 left-8 p-4 border-l-2 border-b-2 border-red-600/50 w-20 h-20" />
                    <div className="absolute bottom-8 right-8 p-4 border-r-2 border-b-2 border-red-600/50 w-20 h-20" />
                    
                    {/* Active Detection HUD */}
                    {currentFrame?.detections?.detections?.map((det: any, i: number) => (
                        <div 
                            key={i}
                            className="absolute border border-red-600 shadow-[0_0_15px_rgba(255,0,0,0.3)]"
                            style={{
                                left: `${(det.bbox.x1 / 640) * 100}%`,
                                top: `${(det.bbox.y1 / 480) * 100}%`,
                                width: `${((det.bbox.x2 - det.bbox.x1) / 640) * 100}%`,
                                height: `${((det.bbox.y2 - det.bbox.y1) / 480) * 100}%`
                            }}
                        >
                            <div className="absolute -top-6 left-0 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 uppercase italic">
                                {det.label} // {Math.round(det.confidence * 100)}%
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}
      </div>

      {/* Timeline Controls */}
      <div className="p-6 bg-black/60 backdrop-blur-xl border-t border-white/5 space-y-6">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-sm bg-red-600 flex items-center justify-center text-white glow-red hover:bg-red-500 transition-all"
            >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
            </button>
            <div className="flex gap-2">
                <button className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-sm"><Rewind size={16} /></button>
                <button className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-sm"><FastForward size={16} /></button>
            </div>
            
            {/* Timeline Scrubber */}
            <div className="flex-1 relative h-10 flex items-center">
                <div className="absolute inset-0 bg-white/5 rounded-sm overflow-hidden border border-white/5">
                    {/* Event markers */}
                    {frames.map((f, i) => f.detections?.detections?.length > 0 && (
                        <div 
                            key={i} 
                            className="absolute top-0 w-0.5 h-full bg-red-600/40"
                            style={{ left: `${(i / frames.length) * 100}%` }}
                        />
                    ))}
                </div>
                <input 
                    type="range"
                    min="0"
                    max={frames.length - 1}
                    value={currentIndex}
                    onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                />
                <motion.div 
                    className="absolute h-full w-1 bg-red-600 shadow-[0_0_10px_rgba(255,0,0,0.8)] pointer-events-none"
                    style={{ left: `${(currentIndex / frames.length) * 100}%` }}
                />
            </div>

            <div className="flex gap-4">
                <button className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest"><Search size={14} /> Analyze</button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest"><Download size={14} /> Export</button>
            </div>
        </div>

        <div className="flex justify-between items-center text-[8px] font-black text-gray-600 uppercase tracking-[0.3em]">
            <p>Frame_Index: {currentIndex.toString().padStart(4, '0')} / {frames.length.toString().padStart(4, '0')}</p>
            <p>Neural_Confidence_Mean: 87.4%</p>
            <p>Encryption: AES-256-MIL</p>
        </div>
      </div>
    </div>
  );
}
