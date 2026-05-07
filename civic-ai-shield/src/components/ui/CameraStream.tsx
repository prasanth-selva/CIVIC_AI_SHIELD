import { useRef, useEffect, useState } from "react";
import { API_BASE } from "../../config";
import { AlertTriangle, Wifi, WifiOff, Shield, ShieldOff } from "lucide-react";
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
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
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
          
          const frameB64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
          
          try {
            const response = await fetch(`${API_BASE}/api/live_frame`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                frame_b64: frameB64,
                camera_id: "webcam-001",
                camera_name: "Local Webcam",
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
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, privacyMode]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-3xl border-2 border-cyan-500/30 overflow-hidden group shadow-2xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-all duration-700 ${privacyMode ? 'blur-2xl grayscale' : ''}`}
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Privacy Mode Overlay */}
      <AnimatePresence>
        {privacyMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-cyan-900/10 pointer-events-none flex items-center justify-center"
          >
             <div className="text-center space-y-2">
                <Shield className="text-cyan-400 mx-auto opacity-50" size={64} />
                <p className="text-cyan-400/60 font-black text-xs uppercase tracking-widest">Ethical AI: Privacy Mode Active</p>
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

        const color = det.severity === 'critical' ? 'border-red-500' : 
                      det.severity === 'high' ? 'border-orange-500' : 'border-yellow-500';

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute border-2 ${color} z-10 shadow-[0_0_15px_rgba(239,68,68,0.3)]`}
            style={{
              left: `${x1}%`,
              top: `${y1}%`,
              width: `${width}%`,
              height: `${height}%`,
            }}
          >
            <span className={`absolute -top-6 left-0 px-2 py-0.5 text-[10px] font-bold text-white uppercase rounded shadow-lg ${color.replace('border', 'bg')}`}>
              {det.label} {Math.round(det.confidence * 100)}%
            </span>
          </motion.div>
        );
      })}

      {/* Connection Status & Privacy Toggle */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
            {isStreaming ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                <Wifi className="text-green-400" size={16} />
            </motion.div>
            ) : (
            <WifiOff className="text-red-400" size={16} />
            )}
            <span className="text-[10px] font-black text-white bg-black/60 px-2 py-1 rounded-full border border-white/10 tracking-widest">
            {isStreaming ? "LIVE_NODE_ALPHA" : "OFFLINE"}
            </span>
        </div>

        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                privacyMode ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-black/60 text-gray-300 border-white/10 hover:border-cyan-500/50'
            }`}
        >
            {privacyMode ? <Shield size={14} /> : <ShieldOff size={14} />}
            <span className="text-[10px] font-bold uppercase tracking-wider">Privacy Mode</span>
        </motion.button>
      </div>

      {/* Severity Alert Banner */}
      {result?.highest_severity && (result.highest_severity === 'critical' || result.highest_severity === 'high') && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-6 right-6 bg-red-600/90 backdrop-blur-xl p-4 rounded-2xl border border-red-400/50 flex items-center gap-4 z-30 shadow-2xl"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <AlertTriangle className="text-white" size={20} />
          </div>
          <div>
            <p className="text-white font-black text-xs uppercase tracking-widest">Neural Trigger: {result.detections[0]?.label}</p>
            <p className="text-red-100 text-[10px] font-medium opacity-80 uppercase">Immediate tactical response required in Node Alpha.</p>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-40 p-6 text-center">
          <WifiOff className="text-red-500 mb-4" size={48} />
          <p className="text-white font-bold tracking-tight">{error}</p>
        </div>
      )}

      {/* Camera ID Overlay */}
      <div className="absolute bottom-6 right-6 pointer-events-none">
          <p className="text-white/20 font-mono text-[10px] tracking-[0.2em]">SEC_NODE // 0x47B2</p>
      </div>
    </div>
  );
}
  );
}
