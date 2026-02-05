"""
Decision Engine Module
Validates detections and determines when to trigger alerts
"""

import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from enum import Enum
import logging

from ..config import settings, Severity
from .detector import Detection, DetectionResult

logger = logging.getLogger(__name__)


class AlertStatus(Enum):
    """Alert trigger status"""
    NO_THREAT = "no_threat"
    MONITORING = "monitoring"
    ALERT_PENDING = "alert_pending"
    ALERT_TRIGGERED = "alert_triggered"
    COOLDOWN = "cooldown"


@dataclass
class AlertEvent:
    """Alert event to be sent via notification channels"""
    threat_type: str
    severity: Severity
    confidence: float
    camera_id: str
    camera_name: str
    timestamp: float
    bbox: Tuple[int, int, int, int]
    frame: any = None  # Optional captured frame
    consecutive_frames: int = 1
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for logging/API"""
        return {
            "threat_type": self.threat_type,
            "severity": self.severity.value,
            "confidence": round(self.confidence, 3),
            "camera_id": self.camera_id,
            "camera_name": self.camera_name,
            "timestamp": self.timestamp,
            "bbox": {
                "x1": self.bbox[0],
                "y1": self.bbox[1],
                "x2": self.bbox[2],
                "y2": self.bbox[3],
            },
            "consecutive_frames": self.consecutive_frames,
        }


@dataclass
class DetectionTracker:
    """Tracks detections for a specific threat type"""
    threat_type: str
    detections: List[Tuple[float, float]] = field(default_factory=list)  # (timestamp, confidence)
    last_alert_time: float = 0.0
    consecutive_count: int = 0
    
    def add_detection(self, timestamp: float, confidence: float):
        """Add a new detection"""
        self.detections.append((timestamp, confidence))
        # Keep only recent detections within window
        window = settings.decision.detection_window
        self.detections = [
            (t, c) for t, c in self.detections
            if timestamp - t <= window
        ]
        self.consecutive_count += 1
    
    def reset(self):
        """Reset tracker on no detection"""
        self.consecutive_count = 0
        # Don't reset detections - keep for smoothing
    
    def get_smoothed_confidence(self) -> float:
        """Get exponentially smoothed confidence"""
        if not self.detections:
            return 0.0
        
        alpha = settings.decision.smoothing_factor
        smoothed = self.detections[0][1]
        
        for _, conf in self.detections[1:]:
            smoothed = alpha * conf + (1 - alpha) * smoothed
        
        return smoothed
    
    def is_in_cooldown(self, current_time: float) -> bool:
        """Check if alert is in cooldown period"""
        cooldown = settings.decision.alert_cooldown
        return current_time - self.last_alert_time < cooldown


class DecisionEngine:
    """
    Decides when to trigger alerts based on detection patterns
    Implements N-frame validation and false positive reduction
    """
    
    def __init__(self):
        """Initialize decision engine"""
        # Per-camera, per-threat tracking
        self._trackers: Dict[str, Dict[str, DetectionTracker]] = defaultdict(dict)
        
        # Alert history
        self._alert_history: List[AlertEvent] = []
        self._max_history = 1000
        
        # Stats
        self._alerts_triggered = 0
        self._false_positives_prevented = 0
    
    def process_detections(
        self,
        camera_id: str,
        camera_name: str,
        result: DetectionResult,
        frame: any = None,
    ) -> List[AlertEvent]:
        """
        Process detection results and determine if alerts should be triggered
        
        Args:
            camera_id: Unique camera identifier
            camera_name: Human-readable camera name
            result: Detection result from detector
            frame: Optional frame for alert image
            
        Returns:
            List of AlertEvents to send
        """
        alerts = []
        current_time = time.time()
        
        # Get camera trackers
        camera_trackers = self._trackers[camera_id]
        
        # Track which threats are currently detected
        current_threats = set()
        
        for detection in result.detections:
            threat_type = detection.label
            current_threats.add(threat_type)
            
            # Get or create tracker
            if threat_type not in camera_trackers:
                camera_trackers[threat_type] = DetectionTracker(threat_type=threat_type)
            
            tracker = camera_trackers[threat_type]
            
            # Skip if in cooldown
            if tracker.is_in_cooldown(current_time):
                continue
            
            # Add detection to tracker
            tracker.add_detection(current_time, detection.confidence)
            
            # Check if we should trigger alert
            status = self._evaluate_alert_status(tracker, detection)
            
            if status == AlertStatus.ALERT_TRIGGERED:
                alert = AlertEvent(
                    threat_type=threat_type,
                    severity=detection.severity,
                    confidence=tracker.get_smoothed_confidence(),
                    camera_id=camera_id,
                    camera_name=camera_name,
                    timestamp=current_time,
                    bbox=detection.bbox,
                    frame=frame,
                    consecutive_frames=tracker.consecutive_count,
                )
                
                alerts.append(alert)
                tracker.last_alert_time = current_time
                self._alerts_triggered += 1
                
                # Add to history
                self._add_to_history(alert)
                
                logger.info(
                    f"Alert triggered: {threat_type} on {camera_name} "
                    f"(confidence: {alert.confidence:.1%}, frames: {tracker.consecutive_count})"
                )
        
        # Reset trackers for threats not currently detected
        for threat_type, tracker in camera_trackers.items():
            if threat_type not in current_threats:
                if tracker.consecutive_count > 0:
                    self._false_positives_prevented += 1
                tracker.reset()
        
        return alerts
    
    def _evaluate_alert_status(
        self,
        tracker: DetectionTracker,
        detection: Detection,
    ) -> AlertStatus:
        """
        Evaluate whether an alert should be triggered
        
        Args:
            tracker: Detection tracker for this threat
            detection: Current detection
            
        Returns:
            Alert status
        """
        min_frames = settings.decision.min_consecutive_frames
        
        # Check consecutive frame requirement
        if tracker.consecutive_count < min_frames:
            return AlertStatus.MONITORING
        
        # Get smoothed confidence
        smoothed_conf = tracker.get_smoothed_confidence()
        
        # Check if confidence is stable enough
        from ..config import get_confidence_threshold
        threshold = get_confidence_threshold(detection.label)
        
        if smoothed_conf < threshold:
            return AlertStatus.MONITORING
        
        # All conditions met - trigger alert
        return AlertStatus.ALERT_TRIGGERED
    
    def _add_to_history(self, alert: AlertEvent):
        """Add alert to history with size limit"""
        self._alert_history.append(alert)
        if len(self._alert_history) > self._max_history:
            self._alert_history.pop(0)
    
    def get_camera_status(self, camera_id: str) -> Dict:
        """
        Get current status for a camera
        
        Returns:
            Status dictionary with active threats and monitoring info
        """
        if camera_id not in self._trackers:
            return {
                "status": "safe",
                "active_threats": [],
                "monitoring": [],
            }
        
        camera_trackers = self._trackers[camera_id]
        current_time = time.time()
        
        active_threats = []
        monitoring = []
        
        for threat_type, tracker in camera_trackers.items():
            if tracker.consecutive_count >= settings.decision.min_consecutive_frames:
                active_threats.append({
                    "threat_type": threat_type,
                    "confidence": tracker.get_smoothed_confidence(),
                    "consecutive_frames": tracker.consecutive_count,
                    "in_cooldown": tracker.is_in_cooldown(current_time),
                })
            elif tracker.consecutive_count > 0:
                monitoring.append({
                    "threat_type": threat_type,
                    "confidence": tracker.get_smoothed_confidence(),
                    "frames": tracker.consecutive_count,
                })
        
        if active_threats:
            status = "alert"
        elif monitoring:
            status = "monitoring"
        else:
            status = "safe"
        
        return {
            "status": status,
            "active_threats": active_threats,
            "monitoring": monitoring,
        }
    
    def get_recent_alerts(
        self,
        camera_id: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict]:
        """Get recent alerts, optionally filtered by camera"""
        alerts = self._alert_history
        
        if camera_id:
            alerts = [a for a in alerts if a.camera_id == camera_id]
        
        # Return most recent
        return [a.to_dict() for a in alerts[-limit:]]
    
    def reset_camera(self, camera_id: str):
        """Reset all tracking for a camera"""
        if camera_id in self._trackers:
            del self._trackers[camera_id]
    
    def reset_all(self):
        """Reset all tracking"""
        self._trackers.clear()
        self._alert_history.clear()
    
    @property
    def stats(self) -> Dict:
        """Get decision engine statistics"""
        return {
            "alerts_triggered": self._alerts_triggered,
            "false_positives_prevented": self._false_positives_prevented,
            "cameras_tracked": len(self._trackers),
            "alert_history_size": len(self._alert_history),
        }
