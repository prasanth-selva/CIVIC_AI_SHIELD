"""
Real-Time Detector Module
Main pipeline for continuous threat detection from video sources
"""

import cv2
import time
import argparse
import threading
from pathlib import Path
from typing import Optional, Dict, Any, Callable
import logging

from ..config import settings
from .video_input import VideoCapture, FrameData
from .preprocessor import FramePreprocessor
from .detector import ThreatDetector, DetectionResult
from .decision_engine import DecisionEngine, AlertEvent
from ..telegram_alert import TelegramBot, AlertManager
from ..utils.incident_logger import get_incident_logger
from ..utils.system_monitor import get_system_monitor

logger = logging.getLogger(__name__)


class RealtimeDetector:
    """
    Main real-time detection pipeline
    Orchestrates video capture, detection, decision making, and alerting
    """
    
    def __init__(
        self,
        source: any,
        source_name: str = "Camera 1",
        camera_id: str = "cam-001",
        model_path: Path = None,
        telegram_token: str = None,
        telegram_chat_id: str = None,
        display: bool = False,
        save_frames: bool = True,
    ):
        """
        Initialize real-time detector
        
        Args:
            source: Video source (0 for webcam, RTSP URL, or file path)
            source_name: Human-readable camera name
            camera_id: Unique camera identifier
            model_path: Path to YOLO model
            telegram_token: Telegram bot token
            telegram_chat_id: Telegram chat ID
            display: Show visualization window
            save_frames: Save alert frames to disk
        """
        self.source = source
        self.source_name = source_name
        self.camera_id = camera_id
        self.display = display
        self.save_frames = save_frames
        
        # Initialize components
        self.video_capture = VideoCapture(
            source=source,
            source_name=source_name,
        )
        
        self.preprocessor = FramePreprocessor()
        
        self.detector = ThreatDetector(
            model_path=model_path or settings.detection.model_path,
        )
        
        self.decision_engine = DecisionEngine()
        
        self.telegram_bot = TelegramBot(
            bot_token=telegram_token,
            default_chat_id=telegram_chat_id,
        )
        
        self.alert_manager = AlertManager(telegram_bot=self.telegram_bot)
        
        self.incident_logger = get_incident_logger()
        self.system_monitor = get_system_monitor()
        
        # State
        self._running = False
        self._paused = False
        self._frame_count = 0
        self._last_result: Optional[DetectionResult] = None
        
        # Callbacks
        self._on_detection: Optional[Callable[[DetectionResult], None]] = None
        self._on_alert: Optional[Callable[[AlertEvent], None]] = None
    
    def set_on_detection(self, callback: Callable[[DetectionResult], None]):
        """Set callback for every detection result"""
        self._on_detection = callback
    
    def set_on_alert(self, callback: Callable[[AlertEvent], None]):
        """Set callback for triggered alerts"""
        self._on_alert = callback
    
    def start(self) -> bool:
        """
        Start the detection pipeline
        
        Returns:
            True if started successfully
        """
        if self._running:
            logger.warning("Detection already running")
            return True
        
        # Initialize detector
        if not self.detector.initialize():
            logger.error("Failed to initialize detector")
            return False
        
        # Start video capture
        if not self.video_capture.start():
            logger.error("Failed to start video capture")
            return False
        
        # Start alert manager
        self.alert_manager.start()
        
        # Start system monitoring
        self.system_monitor.start_monitoring()
        
        self._running = True
        logger.info(f"Real-time detection started for {self.source_name}")
        
        return True
    
    def stop(self):
        """Stop the detection pipeline"""
        self._running = False
        
        self.video_capture.stop()
        self.alert_manager.stop()
        self.system_monitor.stop_monitoring()
        
        if self.display:
            cv2.destroyAllWindows()
        
        logger.info(f"Real-time detection stopped for {self.source_name}")
    
    def run(self):
        """Main detection loop - blocking"""
        if not self.start():
            return
        
        try:
            for frame_data in self.video_capture.frames():
                if not self._running:
                    break
                
                if self._paused:
                    time.sleep(0.1)
                    continue
                
                self._process_frame(frame_data)
                
                # Handle display window events
                if self.display:
                    key = cv2.waitKey(1) & 0xFF
                    if key == ord('q'):
                        break
                    elif key == ord('p'):
                        self._paused = not self._paused
        
        except KeyboardInterrupt:
            logger.info("Detection interrupted by user")
        finally:
            self.stop()
    
    def run_async(self) -> threading.Thread:
        """Run detection in a background thread"""
        thread = threading.Thread(target=self.run, daemon=True)
        thread.start()
        return thread
    
    def _process_frame(self, frame_data: FrameData):
        """Process a single frame"""
        self._frame_count += 1
        frame = frame_data.frame
        
        # Preprocess
        processed = self.preprocessor.preprocess_for_yolo(frame)
        
        # Detect
        result = self.detector.detect(processed, frame_id=frame_data.frame_id)
        self._last_result = result
        
        # Record metrics
        self.system_monitor.record_inference(result.inference_time)
        
        # Decision engine
        alerts = self.decision_engine.process_detections(
            camera_id=self.camera_id,
            camera_name=self.source_name,
            result=result,
            frame=frame if settings.telegram.send_image else None,
        )
        
        # Process alerts
        for alert in alerts:
            self._handle_alert(alert, frame)
        
        # Callback
        if self._on_detection:
            self._on_detection(result)
        
        # Display
        if self.display:
            self._show_frame(frame, result)
    
    def _handle_alert(self, alert: AlertEvent, frame):
        """Handle a triggered alert"""
        # Save frame
        frame_path = None
        if self.save_frames and settings.logging.save_frames:
            frame_path = self._save_alert_frame(frame, alert)
        
        # Log incident
        self.incident_logger.log_incident(
            threat_type=alert.threat_type,
            severity=alert.severity.value,
            confidence=alert.confidence,
            camera_id=alert.camera_id,
            camera_name=alert.camera_name,
            timestamp=alert.timestamp,
            bbox=alert.bbox,
            consecutive_frames=alert.consecutive_frames,
            alert_sent=True,
            frame_path=str(frame_path) if frame_path else None,
        )
        
        # Queue for Telegram
        self.alert_manager.queue_alert(alert)
        
        # Callback
        if self._on_alert:
            self._on_alert(alert)
    
    def _save_alert_frame(self, frame, alert: AlertEvent) -> Optional[Path]:
        """Save alert frame to disk"""
        try:
            frames_dir = settings.logging.frames_dir
            frames_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp_str = time.strftime("%Y%m%d_%H%M%S", time.localtime(alert.timestamp))
            filename = f"{alert.camera_id}_{alert.threat_type}_{timestamp_str}.jpg"
            filepath = frames_dir / filename
            
            # Draw detection on frame
            annotated = self.detector.draw_detections(
                frame,
                [d for d in self._last_result.detections if d.label == alert.threat_type],
            )
            
            cv2.imwrite(str(filepath), annotated)
            return filepath
            
        except Exception as e:
            logger.error(f"Failed to save alert frame: {e}")
            return None
    
    def _show_frame(self, frame, result: DetectionResult):
        """Display frame with annotations"""
        # Draw detections
        display_frame = self.detector.draw_detections(frame, result.detections)
        
        # Add info overlay
        info_text = [
            f"FPS: {self.detector.fps:.1f}",
            f"Inference: {result.inference_time:.1f}ms",
            f"Detections: {len(result.detections)}",
        ]
        
        for i, text in enumerate(info_text):
            cv2.putText(
                display_frame, text,
                (10, 25 + i * 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                (0, 255, 0), 2
            )
        
        # Get camera status
        status = self.decision_engine.get_camera_status(self.camera_id)
        status_color = {
            "safe": (0, 255, 0),
            "monitoring": (0, 255, 255),
            "alert": (0, 0, 255),
        }.get(status["status"], (255, 255, 255))
        
        cv2.putText(
            display_frame, f"Status: {status['status'].upper()}",
            (10, display_frame.shape[0] - 20),
            cv2.FONT_HERSHEY_SIMPLEX, 0.8,
            status_color, 2
        )
        
        cv2.imshow(f"Civic AI Shield - {self.source_name}", display_frame)
    
    def get_status(self) -> Dict[str, Any]:
        """Get current detector status"""
        camera_status = self.decision_engine.get_camera_status(self.camera_id)
        
        return {
            "running": self._running,
            "paused": self._paused,
            "frame_count": self._frame_count,
            "source": str(self.source),
            "source_name": self.source_name,
            "camera_id": self.camera_id,
            "camera_status": camera_status,
            "detector": {
                "initialized": self.detector.is_initialized,
                "fps": self.detector.fps,
                "avg_inference_ms": self.detector.avg_inference_time,
            },
            "alerts": self.alert_manager.stats,
            "system": self.system_monitor.get_current_metrics(),
        }
    
    @property
    def is_running(self) -> bool:
        return self._running
    
    @property
    def frame_count(self) -> int:
        return self._frame_count


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(description="Civic AI Shield - Real-Time Threat Detection")
    parser.add_argument("--source", type=str, default="0",
                       help="Video source: webcam index, RTSP URL, or video file")
    parser.add_argument("--name", type=str, default="Camera 1",
                       help="Camera name for alerts")
    parser.add_argument("--camera-id", type=str, default="cam-001",
                       help="Unique camera identifier")
    parser.add_argument("--model", type=str, default=None,
                       help="Path to YOLO model (default: uses config)")
    parser.add_argument("--display", action="store_true",
                       help="Show visualization window")
    parser.add_argument("--no-save", action="store_true",
                       help="Don't save alert frames")
    parser.add_argument("--test-mode", action="store_true",
                       help="Test mode - exit after 30 seconds")
    
    args = parser.parse_args()
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    
    # Parse source
    source = args.source
    if source.isdigit():
        source = int(source)
    
    # Create detector
    detector = RealtimeDetector(
        source=source,
        source_name=args.name,
        camera_id=args.camera_id,
        model_path=Path(args.model) if args.model else None,
        display=args.display,
        save_frames=not args.no_save,
    )
    
    print(f"\n🛡️ Civic AI Shield - Women Safety Threat Detection")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"📹 Source: {args.source}")
    print(f"📍 Camera: {args.name} ({args.camera_id})")
    print(f"🖥️  Display: {'Enabled' if args.display else 'Disabled'}")
    print(f"💾 Save Frames: {'Enabled' if not args.no_save else 'Disabled'}")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"Press 'q' to quit, 'p' to pause\n")
    
    if args.test_mode:
        # Test mode - run for 30 seconds
        thread = detector.run_async()
        time.sleep(30)
        detector.stop()
        print("\n✅ Test completed successfully!")
    else:
        # Normal mode - run until interrupted
        detector.run()
    
    print("\n👋 Detection stopped. Stay safe!")


if __name__ == "__main__":
    main()
