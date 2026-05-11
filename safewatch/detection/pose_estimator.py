"""
SafeWatch — PoseEstimator
MediaPipe-based pose estimation with per-person crop processing.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import cv2
import mediapipe as mp
import numpy as np
from loguru import logger

from detection.person_detector import Person


# Named joint indices in MediaPipe 33-landmark model
KEYPOINT_MAP: Dict[str, int] = {
    "nose": 0,
    "left_eye_inner": 1,
    "left_eye": 2,
    "left_eye_outer": 3,
    "right_eye_inner": 4,
    "right_eye": 5,
    "right_eye_outer": 6,
    "left_ear": 7,
    "right_ear": 8,
    "mouth_left": 9,
    "mouth_right": 10,
    "left_shoulder": 11,
    "right_shoulder": 12,
    "left_elbow": 13,
    "right_elbow": 14,
    "left_wrist": 15,
    "right_wrist": 16,
    "left_pinky": 17,
    "right_pinky": 18,
    "left_index": 19,
    "right_index": 20,
    "left_thumb": 21,
    "right_thumb": 22,
    "left_hip": 23,
    "right_hip": 24,
    "left_knee": 25,
    "right_knee": 26,
    "left_ankle": 27,
    "right_ankle": 28,
    "left_heel": 29,
    "right_heel": 30,
    "left_foot_index": 31,
    "right_foot_index": 32,
}


@dataclass
class Landmark:
    x: float   # normalised [0-1] within crop bbox
    y: float
    z: float
    visibility: float


@dataclass
class PoseResult:
    person_id: int
    landmarks: List[Optional[Landmark]]   # 33 landmarks; None if missing
    keypoints: Dict[str, Optional[Landmark]]
    bbox: Tuple[int, int, int, int]
    confidence: float

    def __repr__(self) -> str:
        kp_count = sum(1 for v in self.landmarks if v is not None)
        return (
            f"PoseResult(pid={self.person_id}, conf={self.confidence:.2f}, "
            f"landmarks={kp_count}/33)"
        )


class PoseEstimator:
    """
    Runs MediaPipe Pose on per-person crops extracted from the full frame.
    Returns normalised landmark coordinates relative to the crop bbox.
    """

    _PADDING: float = 0.15   # expand bbox by 15% for better landmark detection

    def __init__(self, model_complexity: int = 0, min_confidence: float = 0.5) -> None:
        self._complexity = model_complexity
        self._min_conf = min_confidence
        self._mp_pose = mp.solutions.pose
        self._pose = self._mp_pose.Pose(
            static_image_mode=False,
            model_complexity=model_complexity,
            enable_segmentation=False,
            min_detection_confidence=min_confidence,
            min_tracking_confidence=min_confidence,
        )
        self._mp_draw = mp.solutions.drawing_utils
        logger.info(
            f"PoseEstimator ready | complexity={model_complexity} | "
            f"min_conf={min_confidence}"
        )

    # ─────────────────────────── public API ─────────────────────────

    def estimate(self, frame: np.ndarray, persons: List[Person]) -> List[PoseResult]:
        """
        For each detected person, crop their region and run pose estimation.
        Returns a PoseResult per person (empty list if no persons).
        """
        results: List[PoseResult] = []
        h, w = frame.shape[:2]

        for person in persons:
            crop, offset = self._crop_person(frame, person, w, h)
            if crop is None:
                continue

            crop_rgb = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
            mp_result = self._pose.process(crop_rgb)

            if not mp_result.pose_landmarks:
                continue

            lms: List[Optional[Landmark]] = []
            for lm in mp_result.pose_landmarks.landmark:
                lms.append(
                    Landmark(
                        x=lm.x, y=lm.y, z=lm.z, visibility=lm.visibility
                    )
                )

            # Pad to 33 if any are missing
            while len(lms) < 33:
                lms.append(None)

            keypoints: Dict[str, Optional[Landmark]] = {
                name: lms[idx] if idx < len(lms) else None
                for name, idx in KEYPOINT_MAP.items()
            }

            avg_vis = float(
                np.mean(
                    [lm.visibility for lm in lms if lm is not None and lm.visibility is not None]
                )
            ) if lms else 0.0

            results.append(
                PoseResult(
                    person_id=person.id,
                    landmarks=lms,
                    keypoints=keypoints,
                    bbox=person.bbox,
                    confidence=avg_vis,
                )
            )

        return results

    def draw_skeleton(self, frame: np.ndarray, pose_results: List[PoseResult]) -> np.ndarray:
        """Draw MediaPipe skeleton on frame for all pose results."""
        out = frame.copy()
        h, w = out.shape[:2]

        CONNECTIONS = self._mp_pose.POSE_CONNECTIONS
        for pr in pose_results:
            # Convert normalised crop coords → full-frame pixel coords
            x1, y1, x2, y2 = pr.bbox
            bw = x2 - x1
            bh = y2 - y1
            pts: Dict[int, Tuple[int, int]] = {}
            for idx, lm in enumerate(pr.landmarks):
                if lm is None or lm.visibility < 0.3:
                    continue
                px = int(x1 + lm.x * bw)
                py = int(y1 + lm.y * bh)
                pts[idx] = (px, py)
                cv2.circle(out, (px, py), 4, (0, 255, 128), -1)

            for conn in CONNECTIONS:
                a, b = conn
                if a in pts and b in pts:
                    cv2.line(out, pts[a], pts[b], (0, 200, 255), 2, cv2.LINE_AA)

        return out

    # ─────────────────────────── utilities ──────────────────────────

    def get_body_angle(
        self,
        pose: PoseResult,
        joint1: str,
        joint2: str,
        joint3: str,
    ) -> Optional[float]:
        """
        Return the angle (degrees) at joint2 formed by joint1–joint2–joint3.
        Returns None if any landmark is missing or low visibility.
        """
        lm1 = pose.keypoints.get(joint1)
        lm2 = pose.keypoints.get(joint2)
        lm3 = pose.keypoints.get(joint3)
        if lm1 is None or lm2 is None or lm3 is None:
            return None
        if min(lm1.visibility, lm2.visibility, lm3.visibility) < 0.3:
            return None

        v1 = np.array([lm1.x - lm2.x, lm1.y - lm2.y])
        v2 = np.array([lm3.x - lm2.x, lm3.y - lm2.y])
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-9)
        cos_angle = float(np.clip(cos_angle, -1.0, 1.0))
        return math.degrees(math.acos(cos_angle))

    def get_joint_velocity(
        self,
        pose: PoseResult,
        joint: str,
        previous_pose: Optional[PoseResult],
        dt: float = 1.0 / 15,
    ) -> Optional[float]:
        """
        Estimate velocity of a joint in normalised units per second.
        Returns None if either pose is missing the joint.
        """
        if previous_pose is None:
            return None
        curr = pose.keypoints.get(joint)
        prev = previous_pose.keypoints.get(joint)
        if curr is None or prev is None:
            return None
        if curr.visibility < 0.3 or prev.visibility < 0.3:
            return None
        dx = curr.x - prev.x
        dy = curr.y - prev.y
        dist = math.sqrt(dx * dx + dy * dy)
        return dist / max(dt, 1e-6)

    # ─────────────────────────── internals ──────────────────────────

    def _crop_person(
        self,
        frame: np.ndarray,
        person: Person,
        fw: int,
        fh: int,
    ) -> Tuple[Optional[np.ndarray], Tuple[int, int]]:
        """Crop person bbox with padding; return (crop, (x_offset, y_offset))."""
        x1, y1, x2, y2 = person.bbox
        pad_x = int((x2 - x1) * self._PADDING)
        pad_y = int((y2 - y1) * self._PADDING)
        cx1 = max(0, x1 - pad_x)
        cy1 = max(0, y1 - pad_y)
        cx2 = min(fw, x2 + pad_x)
        cy2 = min(fh, y2 + pad_y)
        crop = frame[cy1:cy2, cx1:cx2]
        if crop.size == 0:
            return None, (0, 0)
        return crop, (cx1, cy1)

    def __repr__(self) -> str:
        return (
            f"PoseEstimator(complexity={self._complexity}, "
            f"min_conf={self._min_conf})"
        )
