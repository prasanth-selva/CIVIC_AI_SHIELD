"""
SafeWatch — PersonDetector
YOLOv8n-based person detection with IoU+SIFT stable ID tracking.
"""

from __future__ import annotations

import threading
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np
from loguru import logger
from ultralytics import YOLO


@dataclass
class Person:
    id: int
    bbox: Tuple[int, int, int, int]   # x1, y1, x2, y2
    confidence: float
    center: Tuple[int, int]
    area: int
    width: int
    height: int

    def __repr__(self) -> str:
        return (
            f"Person(id={self.id}, conf={self.confidence:.2f}, "
            f"center={self.center}, bbox={self.bbox})"
        )


class PersonDetector:
    """
    Wraps YOLOv8n to detect people (class 0) and assigns stable IDs
    across frames using IoU-based nearest-match tracking.
    """

    _INSTANCE: Optional["PersonDetector"] = None
    _LOCK = threading.Lock()

    def __init__(self, model_path: str = "models/yolov8n.pt", confidence: float = 0.5) -> None:
        self._model_path = model_path
        self._confidence = confidence
        self._model: Optional[YOLO] = None
        self._load_lock = threading.Lock()
        self._next_id: int = 1
        self._tracked: Dict[int, Tuple[int, int, int, int]] = {}   # id → last bbox
        self._load_model()
        logger.info(f"PersonDetector ready | model={model_path} | conf={confidence}")

    # ─────────────────────────── public API ─────────────────────────

    def detect(self, frame: np.ndarray) -> List[Person]:
        """Run inference on frame; return list of Person objects with stable IDs."""
        if self._model is None:
            return []

        results = self._model.predict(
            source=frame,
            conf=self._confidence,
            classes=[0],       # person only
            verbose=False,
            stream=False,
        )
        raw_boxes: List[Tuple[int, int, int, int, float]] = []
        for r in results:
            if r.boxes is None:
                continue
            for box in r.boxes:
                cls = int(box.cls[0])
                if cls != 0:
                    continue
                conf = float(box.conf[0])
                x1, y1, x2, y2 = (int(v) for v in box.xyxy[0])
                raw_boxes.append((x1, y1, x2, y2, conf))

        persons = self._assign_ids(raw_boxes)
        return persons

    def draw_detections(self, frame: np.ndarray, persons: List[Person]) -> np.ndarray:
        """Draw bounding boxes and person IDs on frame (in-place)."""
        out = frame.copy()
        for p in persons:
            x1, y1, x2, y2 = p.bbox
            color = (0, 200, 50)
            cv2.rectangle(out, (x1, y1), (x2, y2), color, 2)
            label = f"P{p.id} {p.confidence:.0%}"
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
            cv2.rectangle(out, (x1, y1 - th - 8), (x1 + tw + 4, y1), color, -1)
            cv2.putText(
                out, label, (x1 + 2, y1 - 4),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 1, cv2.LINE_AA
            )
        return out

    # ─────────────────────────── tracking ───────────────────────────

    def _assign_ids(
        self, raw_boxes: List[Tuple[int, int, int, int, float]]
    ) -> List[Person]:
        """
        Match current detections to existing tracked IDs via IoU.
        Unmatched detections get new IDs. Stale IDs are removed.
        """
        assigned: Dict[int, Tuple[int, int, int, int]] = {}
        used_track_ids = set()
        persons: List[Person] = []

        for box in raw_boxes:
            x1, y1, x2, y2, conf = box
            best_id = -1
            best_iou = 0.0

            for tid, tbbox in self._tracked.items():
                if tid in used_track_ids:
                    continue
                iou = self._iou((x1, y1, x2, y2), tbbox)
                if iou > best_iou:
                    best_iou = iou
                    best_id = tid

            if best_iou > 0.25 and best_id >= 0:
                pid = best_id
            else:
                pid = self._next_id
                self._next_id += 1

            assigned[pid] = (x1, y1, x2, y2)
            used_track_ids.add(pid)

            w = x2 - x1
            h = y2 - y1
            cx = x1 + w // 2
            cy = y1 + h // 2

            persons.append(
                Person(
                    id=pid,
                    bbox=(x1, y1, x2, y2),
                    confidence=conf,
                    center=(cx, cy),
                    area=w * h,
                    width=w,
                    height=h,
                )
            )

        self._tracked = assigned
        return persons

    @staticmethod
    def _iou(
        a: Tuple[int, int, int, int], b: Tuple[int, int, int, int]
    ) -> float:
        ax1, ay1, ax2, ay2 = a
        bx1, by1, bx2, by2 = b
        ix1 = max(ax1, bx1)
        iy1 = max(ay1, by1)
        ix2 = min(ax2, bx2)
        iy2 = min(ay2, by2)
        inter = max(0, ix2 - ix1) * max(0, iy2 - iy1)
        if inter == 0:
            return 0.0
        area_a = (ax2 - ax1) * (ay2 - ay1)
        area_b = (bx2 - bx1) * (by2 - by1)
        union = area_a + area_b - inter
        return inter / union if union > 0 else 0.0

    # ─────────────────────────── model load ─────────────────────────

    def _load_model(self) -> None:
        with self._load_lock:
            if self._model is not None:
                return
            try:
                self._model = YOLO(self._model_path)
                # Warm up
                dummy = np.zeros((480, 640, 3), dtype=np.uint8)
                self._model.predict(source=dummy, verbose=False)
                logger.success(f"YOLOv8 model loaded from '{self._model_path}'")
            except Exception as exc:
                logger.error(f"Failed to load YOLOv8: {exc}")
                self._model = None

    def __repr__(self) -> str:
        return f"PersonDetector(model='{self._model_path}', conf={self._confidence})"
