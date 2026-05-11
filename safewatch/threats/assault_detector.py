"""
SafeWatch — AssaultDetector
Detects one-sided physical assault (attacker/victim role assignment).
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


class AssaultDetector:
    def __init__(self, config: Dict[str, Any]) -> None:
        self._cfg = config
        self._skeleton = SkeletonAnalyzer()
        logger.info("AssaultDetector ready.")

    def detect(
        self,
        persons: List[Person],
        poses: List[PoseResult],
        velocity_tracker: VelocityTracker,
        frame_shape: tuple = (480, 640),
    ) -> List[ThreatEvent]:
        if not self._cfg.get("enabled", True):
            return []
        if len(persons) < 2:
            return []

        threshold = self._cfg.get("confidence_threshold", 0.85)
        strike_vel = self._cfg.get("strike_velocity_threshold", 60.0)
        frame_w = frame_shape[1]
        prox_px = 0.25 * frame_w

        pose_map = {p.person_id: p for p in poses}
        events: List[ThreatEvent] = []

        for i in range(len(persons)):
            for j in range(i + 1, len(persons)):
                p1, p2 = persons[i], persons[j]
                dist = float(np.linalg.norm(
                    np.array(p1.center) - np.array(p2.center)
                ))
                if dist > prox_px:
                    continue

                vel1 = velocity_tracker.get_average_joint_velocity(p1.id)
                vel2 = velocity_tracker.get_average_joint_velocity(p2.id)

                wrist_vel1 = max(
                    velocity_tracker.get_velocity(p1.id, "left_wrist"),
                    velocity_tracker.get_velocity(p1.id, "right_wrist"),
                )
                wrist_vel2 = max(
                    velocity_tracker.get_velocity(p2.id, "left_wrist"),
                    velocity_tracker.get_velocity(p2.id, "right_wrist"),
                )

                # Determine attacker and victim by wrist velocity asymmetry
                if abs(wrist_vel1 - wrist_vel2) < 10:
                    continue  # Symmetric — more likely a fight

                attacker, victim = (p1, p2) if wrist_vel1 > wrist_vel2 else (p2, p1)
                attacker_wrist_vel = max(wrist_vel1, wrist_vel2)
                victim_vel = min(vel1, vel2)

                score = 0.0
                if attacker_wrist_vel > strike_vel:
                    score += 0.4
                elif attacker_wrist_vel > strike_vel * 0.7:
                    score += 0.2

                # Victim is relatively still (defensive / helpless)
                if victim_vel < 15:
                    score += 0.25

                # Arm raise of attacker
                pose_attacker = pose_map.get(attacker.id)
                if pose_attacker:
                    arm = self._skeleton.get_arm_raise_level(pose_attacker)
                    if arm is not None and arm > 0.5:
                        score += 0.2

                score = min(score, 1.0)
                if score >= threshold:
                    x1 = min(attacker.bbox[0], victim.bbox[0])
                    y1 = min(attacker.bbox[1], victim.bbox[1])
                    x2 = max(attacker.bbox[2], victim.bbox[2])
                    y2 = max(attacker.bbox[3], victim.bbox[3])
                    events.append(ThreatEvent(
                        threat_type="assault",
                        confidence=round(score, 3),
                        persons_involved=[attacker.id, victim.id],
                        location_bbox=(x1, y1, x2, y2),
                        description=(
                            f"Physical assault: Person {attacker.id} attacking "
                            f"Person {victim.id}."
                        ),
                        severity="CRITICAL",
                    ))
        return events

    def __repr__(self) -> str:
        return "AssaultDetector()"
