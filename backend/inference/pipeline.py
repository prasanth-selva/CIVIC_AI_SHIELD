import asyncio
import time
import logging
import cv2
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from queue import Queue
from threading import Thread
from dataclasses import dataclass, field
from .detector import ThreatDetector, DetectionResult
from .decision_engine import DecisionEngine, AlertEvent
from .intel_engine import get_aswig_engine, get_timeline_manager
from ..config import settings

logger = logging.getLogger(__name__)

@dataclass
class FrameBuffer:
    """Circular buffer for frame storage to support incident replay"""
    capacity: int = 300 # ~10-15 seconds at 20-30 FPS
    frames: List[np.ndarray] = field(default_factory=list)
    timestamps: List[float] = field(default_factory=list)
    detections: List[Optional[DetectionResult]] = field(default_factory=list)
    _index: int = 0

    def add(self, frame: np.ndarray, timestamp: float, detection: Optional[DetectionResult] = None):
        if len(self.frames) < self.capacity:
            self.frames.append(frame)
            self.timestamps.append(timestamp)
            self.detections.append(detection)
        else:
            self.frames[self._index] = frame
            self.timestamps[self._index] = timestamp
            self.detections[self._index] = detection
            self._index = (self._index + 1) % self.capacity

    def get_recent(self, count: int) -> List[Dict[str, Any]]:
        """Get recent frames for replay"""
        result = []
        n = len(self.frames)
        for i in range(min(count, n)):
            idx = (self._index - 1 - i) % n
            result.append({
                "frame": self.frames[idx],
                "timestamp": self.timestamps[idx],
                "detection": self.detections[idx]
            })
        return result

class AsyncInferencePipeline:
    """
    Military-grade asynchronous inference pipeline.
    Implements Point 4: GPU-optimized frame processing, async queue, frame buffering.
    Enhanced with Autonomous Intelligence (Point 1, 2, 3).
    """
    def __init__(self, detector: ThreatDetector, decision_engine: DecisionEngine):
        self.detector = detector
        self.decision_engine = decision_engine
        self.intel_engine = get_aswig_engine()
        self.timeline_manager = get_timeline_manager()
        self.input_queue = asyncio.Queue(maxsize=30)
        self.output_queue = asyncio.Queue(maxsize=100)
        self.frame_buffers: Dict[str, FrameBuffer] = {}
        self._running = False
        self._workers: List[asyncio.Task] = []
        
        # Stats for Intelligence Panel (Point 8)
        self.stats = {
            "inference_latency": 0.0,
            "queue_depth": 0,
            "processed_frames": 0,
            "dropped_frames": 0,
            "active_nodes": 0,
            "last_intelligence": {}
        }

    async def start(self):
        if self._running:
            return
        self._running = True
        # Create worker tasks
        for _ in range(2): # Dual-stream parallel processing
            self._workers.append(asyncio.create_task(self._inference_worker()))
        logger.info("🛡️ Async Inference Pipeline Activated")

    async def stop(self):
        self._running = False
        for task in self._workers:
            task.cancel()
        await asyncio.gather(*self._workers, return_exceptions=True)
        self._workers = []

    async def enqueue_frame(self, camera_id: str, camera_name: str, frame: np.ndarray, timestamp: float):
        """Add frame to processing queue"""
        if self.input_queue.full():
            self.stats["dropped_frames"] += 1
            try:
                self.input_queue.get_nowait() # Drop oldest
            except asyncio.QueueEmpty:
                pass
        
        await self.input_queue.put({
            "camera_id": camera_id,
            "camera_name": camera_name,
            "frame": frame,
            "timestamp": timestamp
        })
        self.stats["queue_depth"] = self.input_queue.qsize()

    async def _inference_worker(self):
        """Worker task for running inference in separate threads to avoid blocking loop"""
        while self._running:
            try:
                item = await self.input_queue.get()
                camera_id = item["camera_id"]
                camera_name = item["camera_name"]
                frame = item["frame"]
                timestamp = item["timestamp"]

                # Run inference in a thread pool to avoid blocking the async loop
                # Point 4: Threaded processing
                loop = asyncio.get_event_loop()
                start_time = time.perf_counter()
                
                result = await loop.run_in_executor(
                    None, 
                    self.detector.detect, 
                    frame
                )
                
                latency = (time.perf_counter() - start_time) * 1000
                self.stats["inference_latency"] = 0.9 * self.stats["inference_latency"] + 0.1 * latency
                self.stats["processed_frames"] += 1

                # Update frame buffer (Point 1: Timeline/Replay Support)
                if camera_id not in self.frame_buffers:
                    self.frame_buffers[camera_id] = FrameBuffer()
                    self.stats["active_nodes"] = len(self.frame_buffers)
                
                self.frame_buffers[camera_id].add(frame, timestamp, result)

                # Process through decision engine
                alerts = self.decision_engine.process_detections(
                    camera_id=camera_id,
                    camera_name=camera_name,
                    result=result,
                    frame=frame if settings.telegram.send_image else None
                )

                # Feature 1 & 2: Autonomous Intelligence Analysis
                intel_report = self.intel_engine.analyze_incident(camera_id, alerts, result)
                if intel_report:
                    self.stats["last_intelligence"][camera_id] = {
                        "escalation": intel_report.escalation_risk,
                        "probability": intel_report.incident_probability,
                        "status": intel_report.status.value,
                        "recommendation": {
                            "action": intel_report.recommendation.action,
                            "priority": intel_report.recommendation.priority,
                            "reasoning": intel_report.recommendation.reasoning,
                            "confidence": intel_report.recommendation.confidence
                        }
                    }

                # Feature 3: Record Timeline Events
                if alerts:
                    for alert in alerts:
                        self.timeline_manager.add_event(camera_id, "ALERT", alert.to_dict())
                elif result.detections:
                    self.timeline_manager.add_event(camera_id, "DETECTION", {
                        "count": len(result.detections),
                        "labels": [d.label for d in result.detections]
                    })

                # Put results in output queue for WebSocket or API
                if not self.output_queue.full():
                    await self.output_queue.put({
                        "camera_id": camera_id,
                        "result": result.to_dict(),
                        "alerts": [a.to_dict() for a in alerts],
                        "intelligence": self.stats["last_intelligence"].get(camera_id),
                        "timestamp": timestamp,
                        "latency": latency
                    })

                self.input_queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Inference pipeline worker error: {e}")
                await asyncio.sleep(0.1)

    def get_replay_data(self, camera_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch historical frames and detections for replay (Point 1)"""
        if camera_id not in self.frame_buffers:
            return []
        
        raw_data = self.frame_buffers[camera_id].get_recent(limit)
        formatted = []
        for item in raw_data:
            # Encode frame to base64 for transport
            _, buffer = cv2.imencode('.jpg', item["frame"], [cv2.IMWRITE_JPEG_QUALITY, 80])
            b64_frame = base64.b64encode(buffer).decode('utf-8')
            
            formatted.append({
                "timestamp": item["timestamp"],
                "frame": b64_frame,
                "detections": item["detection"].to_dict() if item["detection"] else None
            })
        return formatted

# Global Pipeline Instance
_pipeline: Optional[AsyncInferencePipeline] = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        from .detector import ThreatDetector
        from .decision_engine import DecisionEngine
        detector = ThreatDetector()
        detector.initialize()
        engine = DecisionEngine()
        _pipeline = AsyncInferencePipeline(detector, engine)
    return _pipeline
import base64
