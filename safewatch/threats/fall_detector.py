"""
SafeWatch — FallDetector
Detects falls using hip-drop velocity and horizontal body check.
State machine: STANDING → FALLING → FALLEN → STATIONARY_FALLEN
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


class FallState(Enum):
    STANDING = "standing"
    FALLING = "falling"
    FALLEN = "fallen"
    STATIONARY_FALLEN = "stationary_fallen"


class FallDetector:
    def __init__(self, config: Dict[str, Any]) -> None:
        self._cfg = config
        self._skeleton = SkeletonAnalyzer()
        self._states: Dict[int, FallState] = {}
        self._fallen_since: Dict[int, float] = {}
        self._prev_hip_y: Dict[int, float] = {}
        self._stillness_counter: Dict[int, int] = {}
        logger.info("FallDetector ready.")

    def detect(
        self,
        persons: List[Person],
        poses: List[PoseResult],
        velocity_tracker: VelocityTracker,
        frame_shape: tuple = (480, 640),
    ) -> List[ThreatEvent]:
        if not self._cfg.get("enabled", True):
            return []

        threshold = self._cfg.get("confidence_threshold", 0.78)
        hip_drop_thresh = self._cfg.get("hip_drop_threshold", 80)
        stillness_frames = self._cfg.get("stillness_frames", 30)
        frame_h = frame_shape[0]

        pose_map = {p.person_id: p for p in poses}
        events: List[ThreatEvent] = []
        now = time.time()

        for person in persons:
            pid = person.id
            pose = pose_map.get(pid)
            if pose is None:
                continue

            # Get hip y in pixel coordinates
            lhi = pose.keypoints.get("left_hip")
            rhi = pose.keypoints.get("right_hip")
            if lhi is None or rhi is None:
                continue
            x1, y1, x2, y2 = pose.bbox
            bh = max(y2 - y1, 1)
            hip_y_px = y1 + ((lhi.y + rhi.y) / 2.0) * bh

            prev_y = self._prev_hip_y.get(pid, hip_y_px)
            hip_drop = hip_y_px - prev_y   # positive = dropped downward
            self._prev_hip_y[pid] = hip_y_px

            is_horizontal = self._skeleton.is_person_horizontal(pose, threshold=self._cfg.get("horizontal_angle_threshold", 25))
            avg_vel = velocity_tracker.get_average_joint_velocity(pid)
            state = self._states.get(pid, FallState.STANDING)

            # State transitions
            if state == FallState.STANDING:
                if hip_drop > hip_drop_thresh or is_horizontal:
                    self._states[pid] = FallState.FALLING
            elif state == FallState.FALLING:
                if is_horizontal:
                    self._states[pid] = FallState.FALLEN
                    self._fallen_since[pid] = now
                    self._stillness_counter[pid] = 0
            elif state in (FallState.FALLEN, FallState.STATIONARY_FALLEN):
                if not is_horizontal:
                    self._states[pid] = FallState.STANDING
                    self._fallen_since.pop(pid, None)
                    self._stillness_counter.pop(pid, None)
                else:
                    if avg_vel < 5.0:
                        self._stillness_counter[pid] = self._stillness_counter.get(pid, 0) + 1
                    else:
                        self._stillness_counter[pid] = 0
                    if self._stillness_counter.get(pid, 0) >= stillness_frames:
                        self._states[pid] = FallState.STATIONARY_FALLEN

            current_state = self._states.get(pid, FallState.STANDING)
            if current_state == FallState.FALLEN:
                if threshold <= 0.78:
                    events.append(ThreatEvent(
                        threat_type="fall",
                        confidence=0.80,
                        persons_involved=[pid],
                        location_bbox=person.bbox,
                        description=f"Person {pid} has fallen and is on the ground.",
                        severity="MEDIUM",
                    ))
            elif current_state == FallState.STATIONARY_FALLEN:
                events.append(ThreatEvent(
                    threat_type="fall",
                    confidence=0.90,
                    persons_involved=[pid],
                    location_bbox=person.bbox,
                    description=f"Person {pid} has fallen and has not moved — possible injury.",
                    severity="HIGH",
                ))
        return events

    def __repr__(self) -> str:
        return "FallDetector()"
