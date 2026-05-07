import { useRef, useEffect, useState } from "react";
import { API_BASE } from "../../config";
import { AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";

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
                camera_name: "Local Webcam"
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
  }, [isStreaming]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl border-2 border-cyan-500/30 overflow-hidden group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay for detections */}
      {result && result.detections.map((det, i) => {
        // Map backend bbox to video display size
        // Since we know the capture size is 640x480, we can calculate relative positions
        // This is a simplification; in a real app we'd need more robust scaling
        const x1 = (det.bbox.x1 / 640) * 100;
        const y1 = (det.bbox.y1 / 480) * 100;
        const width = ((det.bbox.x2 - det.bbox.x1) / 640) * 100;
        const height = ((det.bbox.y2 - det.bbox.y1) / 480) * 100;

        const color = det.severity === 'critical' ? 'border-red-500' : 
                      det.severity === 'high' ? 'border-orange-500' : 'border-yellow-500';

        return (
          <div
            key={i}
            className={`absolute border-2 ${color} z-10`}
            style={{
              left: `${x1}%`,
              top: `${y1}%`,
              width: `${width}%`,
              height: `${height}%`,
            }}
          >
            <span className={`absolute -top-6 left-0 px-2 py-0.5 text-[10px] font-bold text-white uppercase rounded ${color.replace('border', 'bg')}`}>
              {det.label} {Math.round(det.confidence * 100)}%
            </span>
          </div>
        );
      })}

      {/* Connection Status */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
        {isStreaming ? (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
            <Wifi className="text-green-400" size={16} />
          </motion.div>
        ) : (
          <WifiOff className="text-red-400" size={16} />
        )}
        <span className="text-xs font-semibold text-gray-300 bg-black/40 px-2 py-1 rounded">
          {isStreaming ? "LIVE" : "OFFLINE"}
        </span>
      </div>

      {/* Severity Alert Banner */}
      {result?.highest_severity && (result.highest_severity === 'critical' || result.highest_severity === 'high') && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-red-600/90 backdrop-blur-md p-3 rounded-xl border border-red-400/50 flex items-center gap-3 z-30"
        >
          <AlertTriangle className="text-white animate-pulse" size={24} />
          <div>
            <p className="text-white font-bold text-sm uppercase">Threat Detected: {result.detections[0]?.label}</p>
            <p className="text-red-100 text-xs">Immediate action recommended for this area.</p>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-40 p-6 text-center">
          <WifiOff className="text-red-500 mb-4" size={48} />
          <p className="text-white font-bold">{error}</p>
        </div>
      )}
    </div>
  );
}
