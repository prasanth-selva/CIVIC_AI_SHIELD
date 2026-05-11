"""
SafeWatch — AccidentDetector
Detects multi-person accidents using co-incident falls and flow spikes.
"""
from __future__ import annotations
from collections import deque
from typing import Any, Deque, Dict, List, Optional
from loguru import logger
from detection.person_detector import Person
from detection.pose_estimator import PoseResult
from detection.optical_flow import FlowResult
from threats.threat_event import ThreatEvent


class AccidentDetector:
    _WINDOW: int = 30  # frames

    def __init__(self, config: Dict[str, Any]) -> None:
        self._cfg = config
        self._fall_history: Deque[int] = deque(maxlen=self._WINDOW)
        self._flow_history: Deque[float] = deque(maxlen=self._WINDOW)
        logger.info("AccidentDetector ready.")

    def detect(
        self,
        persons: List[Person],
        poses: List[PoseResult],
        flow_result: Optional[FlowResult],
        recent_fall_pids: List[int],
        frame_shape: tuple = (480, 640),
    ) -> List[ThreatEvent]:
        if not self._cfg.get("enabled", True):
            return []

        threshold = self._cfg.get("confidence_threshold", 0.78)
        self._fall_history.append(len(recent_fall_pids))
        self._flow_history.append(
            flow_result.mean_magnitude if flow_result else 0.0
        )

        total_falls = sum(self._fall_history)
        max_flow = max(self._flow_history) if self._flow_history else 0.0

        # 2+ falls in window AND high flow spike
        if total_falls < 2:
            return []

        score = min(0.70 + total_falls * 0.05 + max_flow / 200.0, 0.98)
        if score < threshold:
            return []

        sev = "CRITICAL" if total_falls >= 3 else "HIGH"
        return [ThreatEvent(
            threat_type="accident",
            confidence=round(score, 3),
            persons_involved=recent_fall_pids,
            location_bbox=(0, 0, frame_shape[1], frame_shape[0]),
            description=(
                f"Accident detected: {total_falls} people fell in {self._WINDOW} frames."
            ),
            severity=sev,
        )]

    def __repr__(self) -> str:
        return "AccidentDetector()"
