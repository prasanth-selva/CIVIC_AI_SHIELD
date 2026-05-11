"""
SafeWatch — FightDetector
Detects physical fights between two or more people.
"""
from __future__ import annotations
from typing import Any, Dict, List
import numpy as np
from loguru import logger
from detection.person_detector import Person
from detection.pose_estimator import PoseResult
from classifier.skeleton_analyzer import SkeletonAnalyzer
from classifier.velocity_tracker import VelocityTracker
from threats.threat_event import ThreatEvent


class FightDetector:
    def __init__(self, config: Dict[str, Any]) -> None:
        self._cfg = config
        self._skeleton = SkeletonAnalyzer()
        logger.info("FightDetector ready.")

    def detect(
        self,
        persons: List[Person],
        poses: List[PoseResult],
        velocity_tracker: VelocityTracker,
        frame_shape: tuple = (480, 640),
    ) -> List[ThreatEvent]:
        cfg = self._cfg
        if not cfg.get("enabled", True):
            return []
        if len(persons) < cfg.get("min_persons", 2):
            return []

        threshold = cfg.get("confidence_threshold", 0.82)
        vel_thresh = cfg.get("velocity_threshold", 45.0)
        frame_h, frame_w = frame_shape[:2]
        prox_thresh = cfg.get("overlap_threshold", 0.3) * frame_w

        pose_map = {p.person_id: p for p in poses}
        events: List[ThreatEvent] = []

        for i in range(len(persons)):
            for j in range(i + 1, len(persons)):
                p1, p2 = persons[i], persons[j]
                cx1, cy1 = p1.center
                cx2, cy2 = p2.center
                dist = float(np.sqrt((cx1 - cx2) ** 2 + (cy1 - cy2) ** 2))
                if dist > prox_thresh:
                    continue

                score = 0.0
                # Relative velocity
                rel_vel = velocity_tracker.get_relative_velocity(p1.id, p2.id)
                if rel_vel > vel_thresh:
                    score += 0.3
                elif rel_vel > vel_thresh * 0.5:
                    score += 0.1

                # Wrist velocity of both persons
                for pid in (p1.id, p2.id):
                    wv = max(
                        velocity_tracker.get_velocity(pid, "left_wrist"),
                        velocity_tracker.get_velocity(pid, "right_wrist"),
                    )
                    if wv > vel_thresh:
                        score += 0.2

                # Arm raise
                for pid in (p1.id, p2.id):
                    pose = pose_map.get(pid)
                    if pose:
                        arm = self._skeleton.get_arm_raise_level(pose)
                        if arm is not None and arm > 0.5:
                            score += 0.15

                # Proximity bonus
                if dist < prox_thresh * 0.5:
                    score += 0.15

                score = min(score, 1.0)
                if score >= threshold:
                    x1 = min(p1.bbox[0], p2.bbox[0])
                    y1 = min(p1.bbox[1], p2.bbox[1])
                    x2 = max(p1.bbox[2], p2.bbox[2])
                    y2 = max(p1.bbox[3], p2.bbox[3])
                    sev = "CRITICAL" if score > 0.90 else "HIGH"
                    events.append(ThreatEvent(
                        threat_type="fight",
                        confidence=round(score, 3),
                        persons_involved=[p1.id, p2.id],
                        location_bbox=(x1, y1, x2, y2),
                        description=f"Physical fight detected between Person {p1.id} and Person {p2.id}.",
                        severity=sev,
                    ))
        return events

    def __repr__(self) -> str:
        return "FightDetector()"
