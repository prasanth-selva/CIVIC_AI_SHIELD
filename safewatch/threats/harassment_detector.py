"""
SafeWatch — HarassmentDetector
Detects sustained close-proximity interactions between two people.
"""
from __future__ import annotations
from typing import Any, Dict, List, Tuple
import numpy as np
from loguru import logger
from detection.person_detector import Person
from detection.pose_estimator import PoseResult
from classifier.skeleton_analyzer import SkeletonAnalyzer
from classifier.velocity_tracker import VelocityTracker
from threats.threat_event import ThreatEvent


class HarassmentDetector:
    def __init__(self, config: Dict[str, Any]) -> None:
        self._cfg = config
        self._skeleton = SkeletonAnalyzer()
        # (pid1, pid2) → frame count of sustained proximity
        self._pair_duration: Dict[Tuple[int, int], int] = {}
        logger.info("HarassmentDetector ready.")

    def detect(
        self,
        persons: List[Person],
        poses: List[PoseResult],
        velocity_tracker: VelocityTracker,
        frame_shape: tuple = (480, 640),
    ) -> List[ThreatEvent]:
        if not self._cfg.get("enabled", True):
            return []

        threshold = self._cfg.get("confidence_threshold", 0.75)
        prox_thresh_ratio = self._cfg.get("proximity_threshold", 0.15)
        duration_frames = self._cfg.get("duration_frames", 60)
        frame_w = frame_shape[1]
        prox_px = prox_thresh_ratio * frame_w

        pose_map = {p.person_id: p for p in poses}
        events: List[ThreatEvent] = []
        active_pairs = set()

        for i in range(len(persons)):
            for j in range(i + 1, len(persons)):
                p1, p2 = persons[i], persons[j]
                dist = float(np.linalg.norm(
                    np.array(p1.center) - np.array(p2.center)
                ))
                pair_key = (min(p1.id, p2.id), max(p1.id, p2.id))

                if dist < prox_px:
                    active_pairs.add(pair_key)
                    self._pair_duration[pair_key] = self._pair_duration.get(pair_key, 0) + 1
                    count = self._pair_duration[pair_key]

                    if count >= duration_frames:
                        # Check asymmetry: one person stationary, other moving
                        vel1 = velocity_tracker.get_average_joint_velocity(p1.id)
                        vel2 = velocity_tracker.get_average_joint_velocity(p2.id)
                        score = min(threshold + (count - duration_frames) / 120.0, 0.95)

                        sev = "HIGH" if score > 0.85 else "MEDIUM"
                        x1 = min(p1.bbox[0], p2.bbox[0])
                        y1 = min(p1.bbox[1], p2.bbox[1])
                        x2 = max(p1.bbox[2], p2.bbox[2])
                        y2 = max(p1.bbox[3], p2.bbox[3])

                        events.append(ThreatEvent(
                            threat_type="harassment",
                            confidence=round(score, 3),
                            persons_involved=[p1.id, p2.id],
                            location_bbox=(x1, y1, x2, y2),
                            description=(
                                f"Sustained close proximity ({count} frames) "
                                f"between Person {p1.id} and Person {p2.id}."
                            ),
                            severity=sev,
                        ))

        # Decay pairs no longer in proximity
        stale = [k for k in self._pair_duration if k not in active_pairs]
        for k in stale:
            self._pair_duration[k] = max(0, self._pair_duration[k] - 2)
            if self._pair_duration[k] == 0:
                del self._pair_duration[k]

        return events

    def __repr__(self) -> str:
        return "HarassmentDetector()"
