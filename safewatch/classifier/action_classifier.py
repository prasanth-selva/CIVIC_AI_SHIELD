"""
SafeWatch — ActionClassifier
ONNX-based action classifier with rule-based fallback.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
from loguru import logger

from detection.pose_estimator import PoseResult
from classifier.skeleton_analyzer import SkeletonAnalyzer
from classifier.velocity_tracker import VelocityTracker

ACTION_CLASSES = [
    "normal", "fight", "fall", "assault",
    "harassment", "abuse", "panic", "unconscious", "other"
]


@dataclass
class ActionResult:
    action_class: str
    confidence: float
    top3_predictions: List[Tuple[str, float]]

    def __repr__(self) -> str:
        return f"ActionResult(class='{self.action_class}', conf={self.confidence:.2f})"


class ActionClassifier:
    """
    Loads action_classifier.onnx if present; otherwise uses rule-based fallback.
    Input: sequence of last 30 PoseResult frames for one person.
    Output: ActionResult with predicted class and confidence.
    """

    _SEQ_LEN: int = 30
    _NUM_LANDMARKS: int = 33
    _COORDS_PER_LM: int = 3   # x, y, z

    def __init__(self, model_path: str = "models/action_classifier.onnx") -> None:
        self._model_path = Path(model_path)
        self._session = None
        self._use_onnx = False
        self._skeleton = SkeletonAnalyzer()
        self._try_load_onnx()
        mode = "ONNX" if self._use_onnx else "rule-based fallback"
        logger.info(f"ActionClassifier ready | mode={mode}")

    # ─────────────────────────── public API ─────────────────────────

    def classify(
        self,
        pose_sequence: List[PoseResult],
        skeleton_features: Optional[Dict] = None,
        velocity_tracker: Optional[VelocityTracker] = None,
    ) -> ActionResult:
        """
        Classify action from a sequence of PoseResult frames.
        If fewer than _SEQ_LEN frames provided, pads with zeros.
        """
        if self._use_onnx and self._session is not None:
            return self._onnx_classify(pose_sequence)
        return self._rule_based_classify(pose_sequence, velocity_tracker)

    def prepare_input(self, pose_sequence: List[PoseResult]) -> np.ndarray:
        """
        Normalise landmark coordinates to zero-mean per sequence.
        Returns ndarray of shape (1, seq_len, 33*3).
        """
        feat_dim = self._NUM_LANDMARKS * self._COORDS_PER_LM
        arr = np.zeros((self._SEQ_LEN, feat_dim), dtype=np.float32)

        for i, pose in enumerate(pose_sequence[-self._SEQ_LEN:]):
            row = []
            for lm in pose.landmarks:
                if lm is not None:
                    row.extend([lm.x, lm.y, lm.z])
                else:
                    row.extend([0.0, 0.0, 0.0])
            arr[i] = np.array(row[:feat_dim], dtype=np.float32)

        # Normalise: subtract mean x/y across sequence
        arr -= arr.mean(axis=0, keepdims=True)
        return arr[np.newaxis, :, :]   # (1, 30, 99)

    # ─────────────────────────── ONNX inference ─────────────────────

    def _onnx_classify(self, pose_sequence: List[PoseResult]) -> ActionResult:
        try:
            import onnxruntime as ort
            inp = self.prepare_input(pose_sequence)
            input_name = self._session.get_inputs()[0].name
            raw = self._session.run(None, {input_name: inp})[0][0]
            probs = self._softmax(raw)
            top_idx = int(np.argmax(probs))
            top3 = sorted(
                [(ACTION_CLASSES[i], float(probs[i])) for i in range(len(ACTION_CLASSES))],
                key=lambda x: x[1], reverse=True
            )[:3]
            return ActionResult(
                action_class=ACTION_CLASSES[top_idx],
                confidence=float(probs[top_idx]),
                top3_predictions=top3,
            )
        except Exception as exc:
            logger.warning(f"ONNX inference failed: {exc}. Using fallback.")
            return self._rule_based_classify(pose_sequence, None)

    # ─────────────────────────── rule-based fallback ─────────────────

    def _rule_based_classify(
        self,
        pose_sequence: List[PoseResult],
        velocity_tracker: Optional[VelocityTracker],
    ) -> ActionResult:
        if not pose_sequence:
            return ActionResult("normal", 0.5, [("normal", 0.5)])

        latest = pose_sequence[-1]
        scores: Dict[str, float] = {c: 0.0 for c in ACTION_CLASSES}
        scores["normal"] = 0.3

        # ─── Fall / Unconscious checks ───
        orientation = self._skeleton.get_body_orientation(latest)
        lean = self._skeleton.get_body_lean_angle(latest)
        head_pos = self._skeleton.get_head_position_relative_to_hips(latest)

        if orientation == "lying":
            scores["fall"] += 0.5
            scores["unconscious"] += 0.3
        if lean is not None and lean > 45:
            scores["fall"] += 0.3

        if head_pos is not None and head_pos < 0.1:
            scores["unconscious"] += 0.4

        # ─── Fight / Assault: arm raise ───
        arm_raise = self._skeleton.get_arm_raise_level(latest)
        if arm_raise is not None and arm_raise > 0.6:
            scores["fight"] += 0.3
            scores["assault"] += 0.2

        # ─── Velocity-based signals ───
        if velocity_tracker is not None:
            pid = latest.person_id
            wrist_vel = max(
                velocity_tracker.get_velocity(pid, "left_wrist"),
                velocity_tracker.get_velocity(pid, "right_wrist"),
            )
            if wrist_vel > 60:
                scores["fight"] += 0.4
                scores["assault"] += 0.3
            elif wrist_vel > 30:
                scores["fight"] += 0.2

            avg_vel = velocity_tracker.get_average_joint_velocity(pid)
            if avg_vel < 2.0 and orientation == "lying":
                scores["unconscious"] += 0.5

        # ─── Panic: crouching + fast motion ───
        if orientation == "crouching":
            scores["panic"] += 0.2

        # Normalise to probabilities
        total = sum(scores.values()) or 1.0
        probs = {c: v / total for c, v in scores.items()}
        best_class = max(probs, key=lambda c: probs[c])
        top3 = sorted(probs.items(), key=lambda x: x[1], reverse=True)[:3]

        return ActionResult(
            action_class=best_class,
            confidence=probs[best_class],
            top3_predictions=top3,
        )

    # ─────────────────────────── helpers ────────────────────────────

    def _try_load_onnx(self) -> None:
        if not self._model_path.exists():
            logger.warning(
                f"ONNX model not found at '{self._model_path}'. "
                "Using rule-based fallback."
            )
            return
        try:
            import onnxruntime as ort
            self._session = ort.InferenceSession(
                str(self._model_path),
                providers=["CPUExecutionProvider"],
            )
            self._use_onnx = True
            logger.success(f"ONNX model loaded: {self._model_path}")
        except Exception as exc:
            logger.error(f"Failed to load ONNX: {exc}. Fallback active.")

    @staticmethod
    def _softmax(x: np.ndarray) -> np.ndarray:
        e = np.exp(x - np.max(x))
        return e / e.sum()

    def __repr__(self) -> str:
        mode = "onnx" if self._use_onnx else "rule-based"
        return f"ActionClassifier(mode={mode}, path='{self._model_path}')"
