"""
Frame Preprocessor Module
Handles frame extraction, resizing, normalization for inference
"""

import cv2
import numpy as np
from typing import Tuple, Optional
import logging

from ..config import settings

logger = logging.getLogger(__name__)


class FramePreprocessor:
    """
    Preprocess video frames for AI inference
    Handles resize, normalization, and format conversion
    """
    
    def __init__(
        self,
        target_size: Tuple[int, int] = None,
        normalize: bool = True,
        keep_aspect: bool = True,
    ):
        """
        Initialize preprocessor
        
        Args:
            target_size: (width, height) for resizing, None for original
            normalize: Whether to normalize pixel values to 0-1
            keep_aspect: Maintain aspect ratio when resizing
        """
        self.target_size = target_size or (
            settings.video.resize_width,
            settings.video.resize_height,
        )
        self.normalize = normalize
        self.keep_aspect = keep_aspect
        
        # Stats
        self._processed_count = 0
    
    def preprocess(
        self,
        frame: np.ndarray,
        for_display: bool = False,
    ) -> np.ndarray:
        """
        Preprocess a single frame
        
        Args:
            frame: BGR frame from OpenCV
            for_display: If True, skip normalization (for visualization)
            
        Returns:
            Preprocessed frame
        """
        if frame is None:
            raise ValueError("Input frame is None")
        
        processed = frame.copy()
        
        # Resize
        if self.target_size and (self.target_size[0] > 0 and self.target_size[1] > 0):
            processed = self._resize(processed)
        
        # Normalize for inference (not display)
        if self.normalize and not for_display:
            processed = processed.astype(np.float32) / 255.0
        
        self._processed_count += 1
        return processed
    
    def _resize(self, frame: np.ndarray) -> np.ndarray:
        """Resize frame while optionally maintaining aspect ratio"""
        h, w = frame.shape[:2]
        target_w, target_h = self.target_size
        
        if self.keep_aspect:
            # Calculate scale to fit within target size
            scale = min(target_w / w, target_h / h)
            new_w = int(w * scale)
            new_h = int(h * scale)
            
            # Resize
            resized = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
            
            # Letterbox padding to target size
            pad_w = (target_w - new_w) // 2
            pad_h = (target_h - new_h) // 2
            
            padded = np.zeros((target_h, target_w, 3), dtype=frame.dtype)
            padded[pad_h:pad_h + new_h, pad_w:pad_w + new_w] = resized
            
            return padded
        else:
            return cv2.resize(frame, (target_w, target_h), interpolation=cv2.INTER_LINEAR)
    
    def preprocess_for_yolo(self, frame: np.ndarray) -> np.ndarray:
        """
        Preprocess specifically for YOLO models
        
        Args:
            frame: BGR frame from OpenCV
            
        Returns:
            Frame ready for YOLO inference (no change needed for ultralytics)
        """
        # Ultralytics YOLO handles preprocessing internally
        # Just resize to optimal size for inference speed
        model_size = settings.detection.input_size
        
        if frame.shape[0] != model_size or frame.shape[1] != model_size:
            frame = self._letterbox(frame, (model_size, model_size))
        
        return frame
    
    def _letterbox(
        self,
        frame: np.ndarray,
        new_shape: Tuple[int, int],
        color: Tuple[int, int, int] = (114, 114, 114),
    ) -> np.ndarray:
        """
        Resize and pad image while meeting stride-multiple constraints
        """
        shape = frame.shape[:2]  # current shape [height, width]
        
        # Scale ratio (new / old)
        r = min(new_shape[0] / shape[0], new_shape[1] / shape[1])
        
        # Compute padding
        new_unpad = int(round(shape[1] * r)), int(round(shape[0] * r))
        dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]
        
        # Divide padding into 2 sides
        dw /= 2
        dh /= 2
        
        if shape[::-1] != new_unpad:
            frame = cv2.resize(frame, new_unpad, interpolation=cv2.INTER_LINEAR)
        
        top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
        left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
        
        frame = cv2.copyMakeBorder(
            frame, top, bottom, left, right,
            cv2.BORDER_CONSTANT, value=color
        )
        
        return frame
    
    def extract_roi(
        self,
        frame: np.ndarray,
        bbox: Tuple[int, int, int, int],
        padding: int = 10,
    ) -> Optional[np.ndarray]:
        """
        Extract region of interest from frame
        
        Args:
            frame: Source frame
            bbox: (x1, y1, x2, y2) bounding box
            padding: Pixels to pad around bbox
            
        Returns:
            Cropped region or None if invalid
        """
        h, w = frame.shape[:2]
        x1, y1, x2, y2 = bbox
        
        # Add padding with bounds checking
        x1 = max(0, x1 - padding)
        y1 = max(0, y1 - padding)
        x2 = min(w, x2 + padding)
        y2 = min(h, y2 + padding)
        
        if x2 <= x1 or y2 <= y1:
            return None
        
        return frame[y1:y2, x1:x2].copy()
    
    def enhance_for_detection(self, frame: np.ndarray) -> np.ndarray:
        """
        Apply image enhancements for better detection
        Useful for low-light or poor quality feeds
        
        Args:
            frame: Input frame
            
        Returns:
            Enhanced frame
        """
        # Convert to LAB color space
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE to L channel
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        
        # Merge and convert back
        enhanced = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
        
        return enhanced
    
    @property
    def processed_count(self) -> int:
        """Number of frames processed"""
        return self._processed_count
    
    def reset_stats(self):
        """Reset processing statistics"""
        self._processed_count = 0
