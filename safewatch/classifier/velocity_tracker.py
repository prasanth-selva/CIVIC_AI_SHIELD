"""
SafeWatch — VelocityTracker
Tracks joint position history and computes velocity / acceleration per person.
"""

from __future__ import annotations

import time
from collections import deque
from typing import Dict, Deque, List, Optional, Tuple

import numpy as np
from loguru import logger

from detection.pose_estimator import PoseResult


_HISTORY_LIMIT: int = 60
_CLEANUP_TIMEOUT: float = 5.0


class _JointHistory:
    def __init__(self) -> None:
        self.times: Deque[float] = deque(maxlen=_HISTORY_LIMIT)
        self.xs: Deque[float] = deque(maxlen=_HISTORY_LIMIT)
        self.ys: Deque[float] = deque(maxlen=_HISTORY_LIMIT)

    def push(self, ts: float, x: float, y: float) -> None:
        self.times.append(ts)
        self.xs.append(x)
        self.ys.append(y)

    def velocity(self) -> Optional[float]:
        if len(self.times) < 2:
            return None
        dt = self.times[-1] - self.times[-2]
        if dt <= 0:
            return None
        dx = self.xs[-1] - self.xs[-2]
        dy = self.ys[-1] - self.ys[-2]
        return float(np.sqrt(dx * dx + dy * dy) / dt)

    def acceleration(self) -> Optional[float]:
        if len(self.times) < 3:
            return None
        dt1 = max(self.times[-2] - self.times[-3], 1e-6)
        v1 = np.sqrt((self.xs[-2]-self.xs[-3])**2 + (self.ys[-2]-self.ys[-3])**2) / dt1
        dt2 = max(self.times[-1] - self.times[-2], 1e-6)
        v2 = np.sqrt((self.xs[-1]-self.xs[-2])**2 + (self.ys[-1]-self.ys[-2])**2) / dt2
        dt = max(self.times[-1] - self.times[-3], 1e-6)
        return float((v2 - v1) / dt)

    def trajectory(self, n: int) -> List[Tuple[float, float]]:
        xs = list(self.xs)[-n:]
        ys = list(self.ys)[-n:]
        return list(zip(xs, ys))


class VelocityTracker:
    """Per-person, per-joint velocity and acceleration tracker."""

    def __init__(self) -> None:
        self._histories: Dict[int, Dict[str, _JointHistory]] = {}
        self._last_seen: Dict[int, float] = {}
        logger.info("VelocityTracker ready.")

    def update(self, person_id: int, pose: PoseResult, timestamp: Optional[float] = None) -> None:
        ts = timestamp if timestamp is not None else time.time()
        self._last_seen[person_id] = ts
        if person_id not in self._histories:
            self._histories[person_id] = {}
        joints = self._histories[person_id]
        for joint_name, lm in pose.keypoints.items():
            if lm is None or lm.visibility < 0.3:
                continue
            if joint_name not in joints:
                joints[joint_name] = _JointHistory()
            x1, y1, x2, y2 = pose.bbox
            bw, bh = max(x2 - x1, 1), max(y2 - y1, 1)
            px = x1 + lm.x * bw
            py = y1 + lm.y * bh
            joints[joint_name].push(ts, px, py)
        self._cleanup(ts)

    def get_velocity(self, person_id: int, joint_name: str) -> float:
        h = self._histories.get(person_id, {}).get(joint_name)
        if h is None:
            return 0.0
        v = h.velocity()
        return v if v is not None else 0.0

    def get_acceleration(self, person_id: int, joint_name: str) -> float:
        h = self._histories.get(person_id, {}).get(joint_name)
        if h is None:
            return 0.0
        a = h.acceleration()
        return a if a is not None else 0.0

    def get_trajectory(self, person_id: int, n_frames: int = 10) -> List[Tuple[float, float]]:
        joints = self._histories.get(person_id, {})
        for jname in ("left_hip", "right_hip", "nose"):
            h = joints.get(jname)
            if h is not None:
                return h.trajectory(n_frames)
        return []

    def get_relative_velocity(self, pid1: int, pid2: int) -> float:
        traj1 = self.get_trajectory(pid1, n_frames=2)
        traj2 = self.get_trajectory(pid2, n_frames=2)
        if len(traj1) < 2 or len(traj2) < 2:
            return 0.0
        dist_prev = float(np.linalg.norm(np.array(traj1[-2]) - np.array(traj2[-2])))
        dist_curr = float(np.linalg.norm(np.array(traj1[-1]) - np.array(traj2[-1])))
        return dist_prev - dist_curr

    def get_average_joint_velocity(self, person_id: int) -> float:
        joints = self._histories.get(person_id, {})
        velocities = [h.velocity() for h in joints.values() if h.velocity() is not None]
        if not velocities:
            return 0.0
        return float(np.mean(velocities))

    def _cleanup(self, now: float) -> None:
        stale = [pid for pid, last in self._last_seen.items() if now - last > _CLEANUP_TIMEOUT]
        for pid in stale:
            self._histories.pop(pid, None)
            self._last_seen.pop(pid, None)

    def __repr__(self) -> str:
        return f"VelocityTracker(tracked_ids={list(self._histories.keys())})"
