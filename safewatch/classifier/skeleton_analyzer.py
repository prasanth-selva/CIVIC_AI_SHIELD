"""
SafeWatch — SkeletonAnalyzer
Extracts high-level behavioral features from MediaPipe PoseResult objects.
"""

from __future__ import annotations

import math
from typing import Dict, Optional, Tuple

import numpy as np
from loguru import logger

from detection.pose_estimator import PoseResult, Landmark


class SkeletonAnalyzer:
    """
    Computes semantic body-state features from a PoseResult.
    All methods handle missing / low-confidence landmarks gracefully.
    """

    _VIS_THRESHOLD: float = 0.3

    # ──────────────────────────────────────────────────────────────────
    # Body orientation
    # ──────────────────────────────────────────────────────────────────

    def get_body_orientation(self, pose: PoseResult) -> str:
        """
        Return coarse body orientation:
        "standing" | "sitting" | "lying" | "crouching" | "unknown"
        Uses shoulder/hip/knee Y-coordinate relationships.
        """
        lsh = pose.keypoints.get("left_shoulder")
        rsh = pose.keypoints.get("right_shoulder")
        lhi = pose.keypoints.get("left_hip")
        rhi = pose.keypoints.get("right_hip")
        lkn = pose.keypoints.get("left_knee")
        rkn = pose.keypoints.get("right_knee")

        if not self._visible_all(lsh, rsh, lhi, rhi):
            return "unknown"

        sh_y = (lsh.y + rsh.y) / 2.0   # type: ignore[union-attr]
        hi_y = (lhi.y + rhi.y) / 2.0   # type: ignore[union-attr]

        # In normalised coords, y increases downward
        if hi_y - sh_y < 0.05:
            # Shoulders close to hip level → person is horizontal / lying
            return "lying"

        if lkn and rkn and self._visible_all(lkn, rkn):
            kn_y = (lkn.y + rkn.y) / 2.0
            hip_to_knee = kn_y - hi_y
            shoulder_to_hip = hi_y - sh_y

            if hip_to_knee < 0.05:
                return "crouching"
            if shoulder_to_hip > 0.3 and hip_to_knee > 0.15:
                return "standing"
            return "sitting"

        return "standing"

    # ──────────────────────────────────────────────────────────────────
    # Arm raise level
    # ──────────────────────────────────────────────────────────────────

    def get_arm_raise_level(self, pose: PoseResult) -> Optional[float]:
        """
        Return average arm raise level 0.0 (arms down) → 1.0 (arms fully raised).
        Based on wrist Y relative to shoulder Y.
        """
        lsh = pose.keypoints.get("left_shoulder")
        rsh = pose.keypoints.get("right_shoulder")
        lwr = pose.keypoints.get("left_wrist")
        rwr = pose.keypoints.get("right_wrist")

        levels = []
        for sh, wr in [(lsh, lwr), (rsh, rwr)]:
            if self._visible_all(sh, wr):
                # y decreases upward in the image
                delta = sh.y - wr.y   # type: ignore[union-attr]
                # Normalise: ~0.3 normalised units from shoulder to head
                level = float(np.clip(delta / 0.3, 0.0, 1.0))
                levels.append(level)

        if not levels:
            return None
        return float(np.mean(levels))

    # ──────────────────────────────────────────────────────────────────
    # Body lean angle
    # ──────────────────────────────────────────────────────────────────

    def get_body_lean_angle(self, pose: PoseResult) -> Optional[float]:
        """
        Return degrees from vertical for the torso centre-line.
        0° = perfectly upright, 90° = horizontal.
        """
        lsh = pose.keypoints.get("left_shoulder")
        rsh = pose.keypoints.get("right_shoulder")
        lhi = pose.keypoints.get("left_hip")
        rhi = pose.keypoints.get("right_hip")

        if not self._visible_all(lsh, rsh, lhi, rhi):
            return None

        sh_x = (lsh.x + rsh.x) / 2.0   # type: ignore[union-attr]
        sh_y = (lsh.y + rsh.y) / 2.0   # type: ignore[union-attr]
        hi_x = (lhi.x + rhi.x) / 2.0   # type: ignore[union-attr]
        hi_y = (lhi.y + rhi.y) / 2.0   # type: ignore[union-attr]

        dx = sh_x - hi_x
        dy = hi_y - sh_y   # positive = shoulder above hip (normal upright)

        angle_rad = math.atan2(abs(dx), max(dy, 1e-6))
        return math.degrees(angle_rad)

    # ──────────────────────────────────────────────────────────────────
    # Torso rotation
    # ──────────────────────────────────────────────────────────────────

    def get_torso_rotation(self, pose: PoseResult) -> Optional[float]:
        """
        Approximate torso rotation (yaw) in degrees using
        the relative depth (z) of left vs right shoulder.
        Returns degrees; positive = rotated to the right.
        """
        lsh = pose.keypoints.get("left_shoulder")
        rsh = pose.keypoints.get("right_shoulder")
        if not self._visible_all(lsh, rsh):
            return None
        dz = lsh.z - rsh.z   # type: ignore[union-attr]
        dx = rsh.x - lsh.x   # type: ignore[union-attr]
        angle_rad = math.atan2(dz, max(dx, 1e-6))
        return math.degrees(angle_rad)

    # ──────────────────────────────────────────────────────────────────
    # Head relative to hips
    # ──────────────────────────────────────────────────────────────────

    def get_head_position_relative_to_hips(self, pose: PoseResult) -> Optional[float]:
        """
        Return normalised y-offset of nose above hips.
        Typical standing person ≈ 0.5–0.7.
        Low value (<0.2) suggests person is collapsed / lying.
        """
        nose = pose.keypoints.get("nose")
        lhi = pose.keypoints.get("left_hip")
        rhi = pose.keypoints.get("right_hip")
        if not self._visible_all(nose, lhi, rhi):
            return None
        hi_y = (lhi.y + rhi.y) / 2.0   # type: ignore[union-attr]
        # In image coords y=0 is top, so nose.y < hi_y means nose is above hips
        return float(hi_y - nose.y)   # type: ignore[union-attr]

    # ──────────────────────────────────────────────────────────────────
    # Horizontal check
    # ──────────────────────────────────────────────────────────────────

    def is_person_horizontal(self, pose: PoseResult, threshold: float = 25.0) -> bool:
        """
        Return True if body lean angle > threshold degrees from vertical
        (i.e., person is lying / nearly horizontal).
        """
        angle = self.get_body_lean_angle(pose)
        if angle is None:
            return False
        return angle > threshold

    # ──────────────────────────────────────────────────────────────────
    # Centre of mass
    # ──────────────────────────────────────────────────────────────────

    def get_center_of_mass(self, pose: PoseResult) -> Optional[Tuple[float, float]]:
        """
        Return approximate centre of mass as normalised (x, y) using
        the midpoint of shoulder and hip midpoints.
        """
        lsh = pose.keypoints.get("left_shoulder")
        rsh = pose.keypoints.get("right_shoulder")
        lhi = pose.keypoints.get("left_hip")
        rhi = pose.keypoints.get("right_hip")
        if not self._visible_all(lsh, rsh, lhi, rhi):
            return None
        x = (lsh.x + rsh.x + lhi.x + rhi.x) / 4.0   # type: ignore[union-attr]
        y = (lsh.y + rsh.y + lhi.y + rhi.y) / 4.0   # type: ignore[union-attr]
        return (x, y)

    # ──────────────────────────────────────────────────────────────────
    # Limb extension ratio
    # ──────────────────────────────────────────────────────────────────

    def get_limb_extension(self, pose: PoseResult, limb: str) -> Optional[float]:
        """
        Return extension ratio 0.0 (fully bent) → 1.0 (fully extended).
        limb in {"left_arm", "right_arm", "left_leg", "right_leg"}
        """
        limb_joints: Dict[str, Tuple[str, str, str]] = {
            "left_arm":  ("left_shoulder", "left_elbow", "left_wrist"),
            "right_arm": ("right_shoulder", "right_elbow", "right_wrist"),
            "left_leg":  ("left_hip", "left_knee", "left_ankle"),
            "right_leg": ("right_hip", "right_knee", "right_ankle"),
        }
        joints = limb_joints.get(limb)
        if joints is None:
            return None

        j1 = pose.keypoints.get(joints[0])
        j2 = pose.keypoints.get(joints[1])
        j3 = pose.keypoints.get(joints[2])
        if not self._visible_all(j1, j2, j3):
            return None

        # Angle at middle joint; 180° = fully extended
        v1 = np.array([j1.x - j2.x, j1.y - j2.y])   # type: ignore[union-attr]
        v2 = np.array([j3.x - j2.x, j3.y - j2.y])   # type: ignore[union-attr]
        cos_a = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-9)
        angle_deg = math.degrees(math.acos(float(np.clip(cos_a, -1.0, 1.0))))
        return float(np.clip(angle_deg / 180.0, 0.0, 1.0))

    # ──────────────────────────────────────────────────────────────────
    # Internal helpers
    # ──────────────────────────────────────────────────────────────────

    def _visible_all(self, *landmarks: Optional[Landmark]) -> bool:
        return all(
            lm is not None and lm.visibility >= self._VIS_THRESHOLD
            for lm in landmarks
        )

    def __repr__(self) -> str:
        return "SkeletonAnalyzer()"
