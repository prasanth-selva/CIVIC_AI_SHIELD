"""
SafeWatch — FrameSampler
Smart frame sampler with motion-aware adaptive skip-rate.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Dict, Generator, Optional, Tuple

import cv2
import numpy as np
from loguru import logger

from capture.camera_stream import CameraStream


@dataclass
class FrameMeta:
    frame: np.ndarray
    camera_id: str
    timestamp: float
    frame_number: int
    has_motion: bool


class FrameSampler:
    """
    Wraps a CameraStream and yields frames at a reduced rate.
    Uses background subtraction to detect motion; frames with significant
    motion bypass the skip counter and are always processed.
    """

    _MIN_MOTION_AREA: int = 500          # px² — noise floor
    _MOTION_HISTORY_LEN: int = 10        # frames averaged for motion score

    def __init__(
        self,
        stream: CameraStream,
        frame_skip: int = 5,
        resolution: Tuple[int, int] = (640, 480),
    ) -> None:
        self._stream = stream
        self._frame_skip = frame_skip
        self._resolution = resolution
        self._camera_id = stream.camera_id

        # Background subtractor — MOG2 balances speed and accuracy
        self._bg_sub = cv2.createBackgroundSubtractorMOG2(
            history=200, varThreshold=50, detectShadows=False
        )

        self._frame_counter: int = 0
        self._skip_counter: int = 0
        self._motion_scores: list = []

        logger.info(
            f"[{self._camera_id}] FrameSampler ready | "
            f"skip={frame_skip} | res={resolution}"
        )

    # ─────────────────────────── public API ─────────────────────────

    def get_frame(self) -> Generator[FrameMeta, None, None]:
        """
        Generator that yields FrameMeta objects.
        Always yields motion frames; skips N frames when no motion.
        """
        while True:
            raw = self._stream.read()
            if raw is None:
                time.sleep(0.01)
                continue

            self._frame_counter += 1
            frame = self._resize(raw)
            has_motion = self._detect_motion(frame)

            if has_motion:
                # Always capture motion frames
                self._skip_counter = 0
                yield FrameMeta(
                    frame=frame,
                    camera_id=self._camera_id,
                    timestamp=time.time(),
                    frame_number=self._frame_counter,
                    has_motion=True,
                )
            else:
                self._skip_counter += 1
                if self._skip_counter >= self._frame_skip:
                    self._skip_counter = 0
                    yield FrameMeta(
                        frame=frame,
                        camera_id=self._camera_id,
                        timestamp=time.time(),
                        frame_number=self._frame_counter,
                        has_motion=False,
                    )

    def update_skip_rate(self, n: int) -> None:
        """Dynamically update the frame-skip rate (useful for CPU load management)."""
        if n < 1:
            n = 1
        self._frame_skip = n
        logger.debug(f"[{self._camera_id}] Frame skip updated → {n}")

    # ─────────────────────────── internals ──────────────────────────

    def _resize(self, frame: np.ndarray) -> np.ndarray:
        h, w = frame.shape[:2]
        target_w, target_h = self._resolution
        if w != target_w or h != target_h:
            return cv2.resize(frame, (target_w, target_h), interpolation=cv2.INTER_LINEAR)
        return frame

    def _detect_motion(self, frame: np.ndarray) -> bool:
        """Apply background subtraction and return True if motion area is significant."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        fg_mask = self._bg_sub.apply(gray)

        # Morphological cleanup to remove noise
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel)

        contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        motion_area = sum(cv2.contourArea(c) for c in contours)

        self._motion_scores.append(motion_area)
        if len(self._motion_scores) > self._MOTION_HISTORY_LEN:
            self._motion_scores.pop(0)

        return motion_area > self._MIN_MOTION_AREA

    def __repr__(self) -> str:
        return (
            f"FrameSampler(camera='{self._camera_id}', "
            f"skip={self._frame_skip}, res={self._resolution})"
        )
