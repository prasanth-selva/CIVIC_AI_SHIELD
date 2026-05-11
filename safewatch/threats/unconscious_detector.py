"""
SafeWatch — UnconsciousDetector
State machine: ACTIVE → FALLEN → POSSIBLY_UNCONSCIOUS → UNCONSCIOUS
"""
from __future__ import annotations
from enum import Enum
from typing import Any, Dict, List
import time
from loguru import logger
from detection.person_detector import Person
from detection.pose_estimator import PoseResult
from classifier.skeleton_analyzer import SkeletonAnalyzer
from classifier.velocity_tracker import VelocityTracker
from threats.threat_event import ThreatEvent


class UnconsciousState(Enum):
    ACTIVE = "active"
    FALLEN = "fallen"
    POSSIBLY_UNCONSCIOUS = "possibly_unconscious"
    UNCONSCIOUS = "unconscious"


class UnconsciousDetector:
    def __init__(self, config: Dict[str, Any]) -> None:
        self._cfg = config
        self._skeleton = SkeletonAnalyzer()
        self._states: Dict[int, UnconsciousState] = {}
        self._still_counter: Dict[int, int] = {}
        logger.info("UnconsciousDetector ready.")

    def detect(
        self,
        persons: List[Person],
        poses: List[PoseResult],
        velocity_tracker: VelocityTracker,
        frame_shape: tuple = (480, 640),
    ) -> List[ThreatEvent]:
        if not self._cfg.get("enabled", True):
            return []

        stillness_frames = self._cfg.get("stillness_frames", 90)
        horiz_thresh = self._cfg.get("horizontal_angle_threshold", 25)
        pose_map = {p.person_id: p for p in poses}
        events: List[ThreatEvent] = []

        for person in persons:
            pid = person.id
            pose = pose_map.get(pid)
            if pose is None:
                continue

            is_horiz = self._skeleton.is_person_horizontal(pose, threshold=horiz_thresh)
            avg_vel = velocity_tracker.get_average_joint_velocity(pid)
            is_still = avg_vel < 3.0
            state = self._states.get(pid, UnconsciousState.ACTIVE)

            if state == UnconsciousState.ACTIVE:
                if is_horiz:
                    self._states[pid] = UnconsciousState.FALLEN
                    self._still_counter[pid] = 0
            elif state == UnconsciousState.FALLEN:
                if not is_horiz:
                    self._states[pid] = UnconsciousState.ACTIVE
                elif is_still:
                    self._still_counter[pid] = self._still_counter.get(pid, 0) + 1
                    if self._still_counter[pid] >= stillness_frames // 2:
                        self._states[pid] = UnconsciousState.POSSIBLY_UNCONSCIOUS
            elif state == UnconsciousState.POSSIBLY_UNCONSCIOUS:
                if not is_horiz or not is_still:
                    self._states[pid] = UnconsciousState.FALLEN
                else:
                    self._still_counter[pid] = self._still_counter.get(pid, 0) + 1
                    if self._still_counter[pid] >= stillness_frames:
                        self._states[pid] = UnconsciousState.UNCONSCIOUS
            elif state == UnconsciousState.UNCONSCIOUS:
                if not is_horiz:
                    self._states[pid] = UnconsciousState.ACTIVE
                    self._still_counter.pop(pid, None)

            current = self._states.get(pid, UnconsciousState.ACTIVE)
            if current == UnconsciousState.POSSIBLY_UNCONSCIOUS:
                events.append(ThreatEvent(
                    threat_type="unconscious",
                    confidence=0.80,
                    persons_involved=[pid],
                    location_bbox=person.bbox,
                    description=f"Person {pid} may be unconscious — lying still.",
                    severity="HIGH",
                ))
            elif current == UnconsciousState.UNCONSCIOUS:
                sc = self._still_counter.get(pid, stillness_frames)
                pass_away = sc >= stillness_frames * 2
                events.append(ThreatEvent(
                    threat_type="unconscious" if not pass_away else "pass_away",
                    confidence=0.92,
                    persons_involved=[pid],
                    location_bbox=person.bbox,
                    description=(
                        f"Person {pid} is unconscious — no movement for "
                        f"{sc} frames."
                    ),
                    severity="CRITICAL",
                ))
        return events

    def __repr__(self) -> str:
        return "UnconsciousDetector()"
