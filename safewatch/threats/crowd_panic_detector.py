"""
SafeWatch — CrowdPanicDetector
Detects crowd dispersal / panic using optical flow divergence.
"""
from __future__ import annotations
from typing import Any, Dict, List, Optional
from loguru import logger
from detection.person_detector import Person
from detection.pose_estimator import PoseResult
from detection.optical_flow import FlowResult
from threats.threat_event import ThreatEvent


class CrowdPanicDetector:
    def __init__(self, config: Dict[str, Any]) -> None:
        self._cfg = config
        logger.info("CrowdPanicDetector ready.")

    def detect(
        self,
        persons: List[Person],
        poses: List[PoseResult],
        flow_result: Optional[FlowResult],
        frame_shape: tuple = (480, 640),
    ) -> List[ThreatEvent]:
        if not self._cfg.get("enabled", True):
            return []

        min_persons = self._cfg.get("min_persons", 5)
        div_thresh = self._cfg.get("flow_divergence_threshold", 8.0)
        threshold = self._cfg.get("confidence_threshold", 0.72)

        if len(persons) < min_persons:
            return []
        if flow_result is None:
            return []

        div = flow_result.divergence_score
        if div < div_thresh:
            return []

        score = min(threshold + (div - div_thresh) / 10.0, 0.98)
        sev = "CRITICAL" if len(persons) > 10 else "HIGH"

        return [ThreatEvent(
            threat_type="crowd_panic",
            confidence=round(score, 3),
            persons_involved=[p.id for p in persons],
            location_bbox=(0, 0, frame_shape[1], frame_shape[0]),
            description=(
                f"Crowd panic detected: {len(persons)} people, "
                f"flow divergence={div:.1f}."
            ),
            severity=sev,
        )]

    def __repr__(self) -> str:
        return "CrowdPanicDetector()"
