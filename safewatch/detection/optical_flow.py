"""
SafeWatch — OpticalFlowAnalyzer
Lucas-Kanade sparse optical flow for motion magnitude and crowd divergence.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

import cv2
import numpy as np
from loguru import logger


@dataclass
class FlowResult:
    mean_magnitude: float
    max_magnitude: float
    flow_vectors: np.ndarray          # shape (N, 2) — dx, dy per tracked point
    divergence_score: float
    motion_regions: List[Tuple[int, int, int, int]]   # list of (x,y,w,h) rects
    sudden_motion: bool
    sudden_motion_magnitude: float

    def __repr__(self) -> str:
        return (
            f"FlowResult(mean={self.mean_magnitude:.2f}, "
            f"max={self.max_magnitude:.2f}, div={self.divergence_score:.2f}, "
            f"sudden={self.sudden_motion})"
        )


class OpticalFlowAnalyzer:
    """
    Computes Lucas-Kanade sparse optical flow between consecutive frames.
    Resets tracking points every 30 frames for stability.
    """

    _MAX_CORNERS: int = 200
    _QUALITY: float = 0.01
    _MIN_DIST: float = 10.0
    _RESET_INTERVAL: int = 30
    _SUDDEN_MOTION_THRESHOLD: float = 15.0   # mean magnitude px/frame

    _LK_PARAMS = dict(
        winSize=(15, 15),
        maxLevel=3,
        criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 20, 0.03),
    )

    _FEATURE_PARAMS = dict(
        maxCorners=200,
        qualityLevel=0.01,
        minDistance=10,
        blockSize=7,
    )

    def __init__(self) -> None:
        self._prev_gray: Optional[np.ndarray] = None
        self._prev_pts: Optional[np.ndarray] = None
        self._frame_idx: int = 0
        logger.info("OpticalFlowAnalyzer ready (Lucas-Kanade).")

    # ─────────────────────────── public API ─────────────────────────

    def analyze(self, prev_frame: np.ndarray, curr_frame: np.ndarray) -> FlowResult:
        """
        Compute optical flow between two consecutive BGR frames.
        Returns a FlowResult with magnitude, divergence, and motion region data.
        """
        prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
        curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)

        self._frame_idx += 1
        if (
            self._prev_pts is None
            or len(self._prev_pts) < 10
            or self._frame_idx % self._RESET_INTERVAL == 0
        ):
            self._prev_pts = cv2.goodFeaturesToTrack(
                prev_gray, **self._FEATURE_PARAMS
            )

        if self._prev_pts is None or len(self._prev_pts) == 0:
            return self._empty_result()

        next_pts, status, _ = cv2.calcOpticalFlowPyrLK(
            prev_gray, curr_gray, self._prev_pts, None, **self._LK_PARAMS
        )

        if next_pts is None or status is None:
            self._prev_pts = None
            return self._empty_result()

        good_prev = self._prev_pts[status.ravel() == 1]
        good_next = next_pts[status.ravel() == 1]

        if len(good_prev) == 0:
            self._prev_pts = None
            return self._empty_result()

        flow_vecs = good_next.reshape(-1, 2) - good_prev.reshape(-1, 2)
        magnitudes = np.linalg.norm(flow_vecs, axis=1)
        mean_mag = float(magnitudes.mean())
        max_mag = float(magnitudes.max())

        div_score = self._compute_divergence(flow_vecs)
        regions = self._find_motion_regions(good_next, magnitudes, curr_frame.shape)
        sudden = self.detect_sudden_motion(
            FlowResult(mean_mag, max_mag, flow_vecs, div_score, regions, False, mean_mag)
        )

        # Update tracked points for next call
        self._prev_pts = good_next.reshape(-1, 1, 2)

        return FlowResult(
            mean_magnitude=mean_mag,
            max_magnitude=max_mag,
            flow_vectors=flow_vecs,
            divergence_score=div_score,
            motion_regions=regions,
            sudden_motion=sudden,
            sudden_motion_magnitude=mean_mag,
        )

    def detect_sudden_motion(self, flow_result: FlowResult) -> bool:
        """Return True if mean motion magnitude exceeds sudden-motion threshold."""
        return flow_result.mean_magnitude > self._SUDDEN_MOTION_THRESHOLD

    def detect_crowd_divergence(self, flow_result: FlowResult) -> bool:
        """Return True if divergence score indicates crowd panic / dispersal."""
        return flow_result.divergence_score > 6.0

    # ─────────────────────────── internals ──────────────────────────

    def _compute_divergence(self, flow_vecs: np.ndarray) -> float:
        """
        Divergence score: if vectors point in many different directions,
        score is high (crowd panic). Uses circular variance of angles.
        """
        if len(flow_vecs) < 5:
            return 0.0
        angles = np.arctan2(flow_vecs[:, 1], flow_vecs[:, 0])
        # Circular variance — high = spread in all directions
        mean_sin = float(np.mean(np.sin(angles)))
        mean_cos = float(np.mean(np.cos(angles)))
        r = math.sqrt(mean_sin ** 2 + mean_cos ** 2)
        circular_var = 1.0 - r   # [0, 1]; 0=uniform, 1=fully dispersed
        # Scale to 0–10 range
        return circular_var * 10.0

    def _find_motion_regions(
        self,
        points: np.ndarray,
        magnitudes: np.ndarray,
        frame_shape: Tuple,
        threshold: float = 5.0,
    ) -> List[Tuple[int, int, int, int]]:
        """Return bounding boxes around clusters of high-motion points."""
        if len(points) == 0:
            return []
        high_motion_pts = points[magnitudes > threshold]
        if len(high_motion_pts) == 0:
            return []
        # Simple: one bounding box around all high-motion points
        xs = high_motion_pts[:, 0]
        ys = high_motion_pts[:, 1]
        x, y = int(xs.min()), int(ys.min())
        w = int(xs.max()) - x
        h = int(ys.max()) - y
        return [(x, y, w, h)]

    @staticmethod
    def _empty_result() -> FlowResult:
        return FlowResult(
            mean_magnitude=0.0,
            max_magnitude=0.0,
            flow_vectors=np.zeros((0, 2), dtype=np.float32),
            divergence_score=0.0,
            motion_regions=[],
            sudden_motion=False,
            sudden_motion_magnitude=0.0,
        )

    def __repr__(self) -> str:
        return f"OpticalFlowAnalyzer(frame_idx={self._frame_idx})"
