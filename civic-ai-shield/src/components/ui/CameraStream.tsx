import { useRef, useEffect, useState } from "react";
import { API_BASE } from "../../config";
import { AlertTriangle, Wifi, WifiOff, Shield, ShieldOff, Crosshair, Target, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Detection {
  label: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  severity: string;
}

interface DetectionResult {
  status: string;
  detections: Detection[];
  highest_severity: string | null;
}

export function CameraStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError("Could not access webcam. Please ensure you have given permission.");
      }
    }

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext("2d");

        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const frameB64 = canvas.toDataURL("image/jpeg", 0.6).split(",")[1];
          
          try {
            const response = await fetch(`${API_BASE}/api/live_frame`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                frame_b64: frameB64,
                camera_id: "TACTICAL_NODE_ALPHA",
                camera_name: "ALPHA_COMMAND",
                privacy_mode: privacyMode
              })
            });

            if (response.ok) {
              const data = await response.json();
              setResult(data);
            }
          } catch (err) {
            console.error("Error sending frame to backend:", err);
          }
        }
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isStreaming, privacyMode]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-sm border border-white/5 overflow-hidden group shadow-2xl hud-border">
      {/* HUD Corners */}
      <div className="corner-tl" />
      <div className="corner-tr" />
      <div className="corner-bl" />
      <div className="corner-br" />

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-all duration-1000 ${privacyMode ? 'blur-3xl grayscale brightness-50' : 'brightness-90 contrast-110'}`}
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Scanline Overlay Effect */}
      <div className="scanline-overlay z-10" />
      
      {/* Privacy Mode Overlay */}
      <AnimatePresence>
        {privacyMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-950/20 pointer-events-none flex items-center justify-center z-20"
          >
             <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full border-2 border-red-600/30 flex items-center justify-center mx-auto relative">
                   <Shield className="text-red-600 opacity-50" size={32} />
                   <div className="absolute inset-0 radar-sweep opacity-20" />
                </div>
                <p className="text-red-500/60 font-black text-[10px] uppercase tracking-[0.4em]">ETHICAL_OVERRIDE: PRIVACY_FILTER_ACTIVE</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for detections */}
      {!privacyMode && result && result.detections.map((det, i) => {
        const x1 = (det.bbox.x1 / 640) * 100;
        const y1 = (det.bbox.y1 / 480) * 100;
        const width = ((det.bbox.x2 - det.bbox.x1) / 640) * 100;
        const height = ((det.bbox.y2 - det.bbox.y1) / 480) * 100;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-20"
            style={{
              left: `${x1}%`,
              top: `${y1}%`,
              width: `${width}%`,
              height: `${height}%`,
            }}
          >
            {/* Tracking Brackets */}
            <div className="absolute inset-0 border border-red-600/50">
               <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-red-500" />
               <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-red-500" />
               <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-red-500" />
               <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-red-500" />
            </div>

            {/* Target HUD Label */}
            <div className="absolute -top-8 left-0 flex items-center gap-2 bg-red-600 text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest italic rounded-sm">
               <Target size={10} />
               <span>{det.label} // {Math.round(det.confidence * 100)}%</span>
            </div>

            {/* Target ID & Coordinates */}
            <div className="absolute -bottom-10 left-0 text-[7px] font-mono text-red-500/80 bg-black/60 p-1 rounded-sm border border-red-500/20">
               <p>ID: TGT_{i+1024}</p>
               <p>POS: {det.bbox.x1.toFixed(0)},{det.bbox.y1.toFixed(0)}</p>
            </div>
          </motion.div>
        );
      })}

      {/* Central Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 z-10">
         <div className="relative w-12 h-12">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-600" />
            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-red-600" />
            <div className="absolute inset-0 border border-red-600 rounded-full" />
         </div>
      </div>

      {/* Connection Status & Privacy Toggle */}
      <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-black/80 border border-white/5 rounded-sm">
                <Wifi className={isStreaming ? "text-red-600" : "text-gray-600"} size={14} />
                <span className="text-[9px] font-black text-white tracking-[0.2em] uppercase">
                    {isStreaming ? "TACTICAL_NODE_ACTIVE" : "CONNECTION_ERROR"}
                </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-950/40 border border-red-600/30 rounded-sm text-[9px] font-black text-red-500 tracking-[0.2em] uppercase">
               <Activity size={12} />
               <span>Latency: 12ms</span>
            </div>
        </div>

        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm border text-[9px] font-black uppercase tracking-widest transition-all ${
                privacyMode ? 'bg-red-600 text-white border-red-400 glow-red' : 'bg-black/80 text-gray-400 border-white/10 hover:border-red-600/50'
            }`}
        >
            {privacyMode ? <Shield size={12} /> : <ShieldOff size={12} />}
            <span>Privacy Filter</span>
        </motion.button>
      </div>

      {/* Alert Overlay Banner */}
      <AnimatePresence>
        {result?.highest_severity && (result.highest_severity === 'critical' || result.highest_severity === 'high') && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-10 left-10 right-10 z-40"
          >
             <div className="bg-red-600 p-5 rounded-sm flex items-center gap-6 shadow-[0_0_50px_rgba(255,0,0,0.4)]">
                <div className="w-12 h-12 rounded-sm bg-black/20 flex items-center justify-center animate-pulse">
                   <AlertTriangle className="text-white" size={24} />
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-1">
                      <Zap size={14} className="text-white" />
                      <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Critical Neural Incident Detected</p>
                   </div>
                   <p className="text-white text-lg font-black italic uppercase tracking-tighter">Threat Type: {result.detections[0]?.label} // Engage Response Protocol</p>
                </div>
                <button className="px-6 py-2 bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                   Acknowledge
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50 p-8 text-center">
          <WifiOff className="text-red-600 mb-6 animate-pulse" size={48} />
          <h3 className="text-white font-black text-xl italic uppercase tracking-tighter mb-2">Signal Interrupted</h3>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-sm">{error}</p>
        </div>
      )}

      {/* System Identifiers */}
      <div className="absolute bottom-8 right-8 pointer-events-none opacity-40 z-30 flex flex-col items-end gap-1">
          <p className="text-red-500 font-mono text-[8px] tracking-[0.4em] font-black uppercase">Alpha_Command_Hub</p>
          <p className="text-white font-mono text-[7px] tracking-[0.2em] opacity-50 uppercase">Session: 0x47B2 // Node: TACTICAL_01</p>
      </div>
    </div>
  );
}

