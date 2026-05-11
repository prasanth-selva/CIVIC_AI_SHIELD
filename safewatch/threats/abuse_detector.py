"""
SafeWatch — AbuseDetector
Detects sustained repeated strikes over extended time periods.
"""
from __future__ import annotations
from collections import deque
from typing import Any, Deque, Dict, List, Tuple
import numpy as np
from loguru import logger
from detection.person_detector import Person
from detection.pose_estimator import PoseResult
from classifier.velocity_tracker import VelocityTracker
from threats.threat_event import ThreatEvent


class AbuseDetector:
    _WINDOW: int = 30

    def __init__(self, config: Dict[str, Any]) -> None:
        self._cfg = config
        # (pid1, pid2) → deque of wrist-velocity spikes per window
        self._strike_history: Dict[Tuple[int, int], Deque[float]] = {}
        self._frame_counter: Dict[Tuple[int, int], int] = {}
        logger.info("AbuseDetector ready.")

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

        threshold = self._cfg.get("confidence_threshold", 0.80)
        frame_w = frame_shape[1]
        prox_px = 0.25 * frame_w
        events: List[ThreatEvent] = []

        for i in range(len(persons)):
            for j in range(i + 1, len(persons)):
                p1, p2 = persons[i], persons[j]
                dist = float(np.linalg.norm(
                    np.array(p1.center) - np.array(p2.center)
                ))
                if dist > prox_px:
                    continue

                pair = (min(p1.id, p2.id), max(p1.id, p2.id))
                if pair not in self._strike_history:
                    self._strike_history[pair] = deque(maxlen=120)
                    self._frame_counter[pair] = 0

                self._frame_counter[pair] += 1

                # Detect strike spike for each person
                for pid in (p1.id, p2.id):
                    wv = max(
                        velocity_tracker.get_velocity(pid, "left_wrist"),
                        velocity_tracker.get_velocity(pid, "right_wrist"),
                    )
                    self._strike_history[pair].append(wv)

                # Count spikes above 50 px/s in history
                history = list(self._strike_history[pair])
                spikes = sum(1 for v in history if v > 50)
                duration = self._frame_counter[pair]

                # Need sustained pattern: >5 spikes over 120+ frames
                if duration >= 120 and spikes >= 5:
                    spike_rate = spikes / max(duration, 1)
                    score = min(threshold + spike_rate * 2.0, 0.97)

                    x1 = min(p1.bbox[0], p2.bbox[0])
                    y1 = min(p1.bbox[1], p2.bbox[1])
                    x2 = max(p1.bbox[2], p2.bbox[2])
                    y2 = max(p1.bbox[3], p2.bbox[3])

                    sev = "CRITICAL" if score > 0.90 else "HIGH"
                    events.append(ThreatEvent(
                        threat_type="abuse",
                        confidence=round(score, 3),
                        persons_involved=[p1.id, p2.id],
                        location_bbox=(x1, y1, x2, y2),
                        description=(
                            f"Sustained abuse pattern: {spikes} strikes detected "
                            f"over {duration} frames between "
                            f"Person {p1.id} and Person {p2.id}."
                        ),
                        severity=sev,
                    ))
        return events

    def __repr__(self) -> str:
        return "AbuseDetector()"
