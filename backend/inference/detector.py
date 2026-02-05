"""
Threat Detector Module
YOLOv8-based detection for multiple threat classes
"""

import cv2
import numpy as np
from pathlib import Path
from typing import List, Tuple, Optional, Dict, Any
from dataclasses import dataclass
import logging
import time

from ..config import settings, get_confidence_threshold, get_threat_severity, Severity

logger = logging.getLogger(__name__)


@dataclass
class Detection:
    """Single detection result"""
    label: str
    confidence: float
    bbox: Tuple[int, int, int, int]  # x1, y1, x2, y2
    class_id: int
    severity: Severity
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API response"""
        return {
            "label": self.label,
            "confidence": round(self.confidence, 3),
            "bbox": {
                "x1": self.bbox[0],
                "y1": self.bbox[1],
                "x2": self.bbox[2],
                "y2": self.bbox[3],
            },
            "class_id": self.class_id,
            "severity": self.severity.value,
        }


@dataclass
class DetectionResult:
    """Collection of detections from a single frame"""
    detections: List[Detection]
    inference_time: float  # milliseconds
    frame_id: int
    timestamp: float
    
    @property
    def has_threats(self) -> bool:
        """Check if any high-severity threats detected"""
        return any(
            d.severity in (Severity.HIGH, Severity.CRITICAL)
            for d in self.detections
        )
    
    @property
    def highest_severity(self) -> Optional[Severity]:
        """Get highest severity level from detections"""
        if not self.detections:
            return None
        severities = [d.severity for d in self.detections]
        severity_order = [Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL]
        for s in reversed(severity_order):
            if s in severities:
                return s
        return Severity.LOW
    
    def get_threats(self, min_severity: Severity = Severity.MEDIUM) -> List[Detection]:
        """Get detections above minimum severity"""
        severity_order = [Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL]
        min_idx = severity_order.index(min_severity)
        return [
            d for d in self.detections
            if severity_order.index(d.severity) >= min_idx
        ]


class ThreatDetector:
    """
    YOLO-based threat detection for women safety
    Supports multiple threat classes with configurable thresholds
    """
    
    def __init__(
        self,
        model_path: Path = None,
        use_gpu: bool = None,
        confidence_threshold: float = None,
    ):
        """
        Initialize threat detector
        
        Args:
            model_path: Path to YOLO model weights
            use_gpu: Whether to use GPU (auto-detect if None)
            confidence_threshold: Default confidence threshold
        """
        self.model_path = model_path or settings.detection.model_path
        self.use_gpu = use_gpu if use_gpu is not None else settings.detection.use_gpu
        self.default_threshold = confidence_threshold or settings.detection.default_threshold
        
        self._model = None
        self._device = None
        self._class_names: Dict[int, str] = {}
        self._initialized = False
        
        # Performance stats
        self._inference_times: List[float] = []
        self._max_times_stored = 100
    
    def initialize(self) -> bool:
        """
        Load model and prepare for inference
        
        Returns:
            True if successful, False otherwise
        """
        if self._initialized:
            return True
        
        try:
            from ultralytics import YOLO
            import torch
            
            # Determine device
            if self.use_gpu and torch.cuda.is_available():
                self._device = f"cuda:{settings.detection.gpu_device}"
                logger.info(f"Using GPU: {torch.cuda.get_device_name(0)}")
            else:
                self._device = "cpu"
                logger.info("Using CPU for inference")
            
            # Load model
            model_path_str = str(self.model_path)
            
            if self.model_path.exists():
                logger.info(f"Loading custom model: {self.model_path}")
                self._model = YOLO(model_path_str)
            else:
                # Fallback to pretrained model
                logger.warning(
                    f"Custom model not found at {self.model_path}. "
                    f"Using pretrained {settings.detection.fallback_model}"
                )
                self._model = YOLO(settings.detection.fallback_model)
            
            # Move to device
            self._model.to(self._device)
            
            # Get class names
            if hasattr(self._model, "names"):
                self._class_names = self._model.names
            
            # Warmup inference
            dummy = np.zeros((640, 640, 3), dtype=np.uint8)
            self._model.predict(dummy, verbose=False)
            
            self._initialized = True
            logger.info(f"Detector initialized with {len(self._class_names)} classes")
            return True
            
        except ImportError as e:
            logger.error(f"Failed to import ultralytics: {e}")
            return False
        except Exception as e:
            logger.error(f"Failed to initialize detector: {e}")
            return False
    
    def detect(
        self,
        frame: np.ndarray,
        frame_id: int = 0,
    ) -> DetectionResult:
        """
        Run detection on a single frame
        
        Args:
            frame: BGR frame from OpenCV
            frame_id: Frame identifier
            
        Returns:
            DetectionResult with all detections
        """
        if not self._initialized:
            if not self.initialize():
                return DetectionResult(
                    detections=[],
                    inference_time=0,
                    frame_id=frame_id,
                    timestamp=time.time(),
                )
        
        start_time = time.perf_counter()
        
        # Run inference
        results = self._model.predict(
            frame,
            verbose=False,
            conf=self.default_threshold * 0.5,  # Lower initial threshold
        )
        
        inference_time = (time.perf_counter() - start_time) * 1000
        self._update_stats(inference_time)
        
        # Parse results
        detections = self._parse_results(results)
        
        return DetectionResult(
            detections=detections,
            inference_time=inference_time,
            frame_id=frame_id,
            timestamp=time.time(),
        )
    
    def detect_batch(
        self,
        frames: List[np.ndarray],
        start_frame_id: int = 0,
    ) -> List[DetectionResult]:
        """
        Run detection on multiple frames
        
        Args:
            frames: List of BGR frames
            start_frame_id: Starting frame ID
            
        Returns:
            List of DetectionResults
        """
        if not self._initialized:
            if not self.initialize():
                return []
        
        start_time = time.perf_counter()
        
        # Batch inference
        results = self._model.predict(
            frames,
            verbose=False,
            conf=self.default_threshold * 0.5,
        )
        
        total_time = (time.perf_counter() - start_time) * 1000
        per_frame_time = total_time / len(frames) if frames else 0
        
        # Parse each result
        detection_results = []
        for i, result in enumerate(results):
            detections = self._parse_single_result(result)
            detection_results.append(DetectionResult(
                detections=detections,
                inference_time=per_frame_time,
                frame_id=start_frame_id + i,
                timestamp=time.time(),
            ))
        
        return detection_results
    
    def _parse_results(self, results) -> List[Detection]:
        """Parse YOLO results into Detection objects"""
        detections = []
        
        for result in results:
            detections.extend(self._parse_single_result(result))
        
        return detections
    
    def _parse_single_result(self, result) -> List[Detection]:
        """Parse a single YOLO result"""
        detections = []
        
        if not hasattr(result, "boxes") or result.boxes is None:
            return detections
        
        for box in result.boxes:
            class_id = int(box.cls[0]) if hasattr(box, "cls") else 0
            confidence = float(box.conf[0]) if hasattr(box, "conf") else 0.0
            
            # Get label
            label = self._class_names.get(class_id, f"class_{class_id}")
            
            # Apply class-specific threshold
            threshold = get_confidence_threshold(label)
            if confidence < threshold:
                continue
            
            # Get bounding box
            if hasattr(box, "xyxy"):
                xyxy = box.xyxy[0].tolist()
                bbox = tuple(int(x) for x in xyxy)
            else:
                bbox = (0, 0, 0, 0)
            
            # Get severity
            severity = get_threat_severity(label)
            
            detections.append(Detection(
                label=label,
                confidence=confidence,
                bbox=bbox,
                class_id=class_id,
                severity=severity,
            ))
        
        return detections
    
    def _update_stats(self, inference_time: float):
        """Update performance statistics"""
        self._inference_times.append(inference_time)
        if len(self._inference_times) > self._max_times_stored:
            self._inference_times.pop(0)
    
    @property
    def avg_inference_time(self) -> float:
        """Average inference time in milliseconds"""
        if not self._inference_times:
            return 0.0
        return sum(self._inference_times) / len(self._inference_times)
    
    @property
    def fps(self) -> float:
        """Estimated frames per second"""
        avg_time = self.avg_inference_time
        if avg_time <= 0:
            return 0.0
        return 1000.0 / avg_time
    
    @property
    def class_names(self) -> Dict[int, str]:
        """Get class name mapping"""
        return self._class_names
    
    @property
    def is_initialized(self) -> bool:
        """Check if model is loaded"""
        return self._initialized
    
    def draw_detections(
        self,
        frame: np.ndarray,
        detections: List[Detection],
        draw_labels: bool = True,
        draw_confidence: bool = True,
    ) -> np.ndarray:
        """
        Draw bounding boxes and labels on frame
        
        Args:
            frame: Input frame
            detections: List of Detection objects
            draw_labels: Whether to draw class labels
            draw_confidence: Whether to draw confidence scores
            
        Returns:
            Frame with annotations
        """
        result = frame.copy()
        
        # Color mapping by severity
        colors = {
            Severity.LOW: (0, 255, 0),       # Green
            Severity.MEDIUM: (0, 255, 255),   # Yellow
            Severity.HIGH: (0, 165, 255),     # Orange
            Severity.CRITICAL: (0, 0, 255),   # Red
        }
        
        for det in detections:
            color = colors.get(det.severity, (255, 255, 255))
            x1, y1, x2, y2 = det.bbox
            
            # Draw box
            cv2.rectangle(result, (x1, y1), (x2, y2), color, 2)
            
            # Draw label
            if draw_labels or draw_confidence:
                label_parts = []
                if draw_labels:
                    label_parts.append(det.label.upper())
                if draw_confidence:
                    label_parts.append(f"{det.confidence:.0%}")
                label = " ".join(label_parts)
                
                # Background for text
                (text_w, text_h), baseline = cv2.getTextSize(
                    label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1
                )
                cv2.rectangle(
                    result,
                    (x1, y1 - text_h - 10),
                    (x1 + text_w + 4, y1),
                    color, -1
                )
                cv2.putText(
                    result, label,
                    (x1 + 2, y1 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                    (255, 255, 255), 1
                )
        
        return result
