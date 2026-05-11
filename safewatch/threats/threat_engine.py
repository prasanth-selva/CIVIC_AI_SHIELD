"""
SafeWatch — ThreatEngine
Central coordinator: runs all threat detectors in parallel and aggregates results.
"""
from __future__ import annotations

import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import cv2
import numpy as np
from loguru import logger

from detection.person_detector import Person
from detection.pose_estimator import PoseResult
from detection.optical_flow import FlowResult
from detection.zone_manager import ZoneManager
from classifier.velocity_tracker import VelocityTracker

from threats.threat_event import ThreatEvent
from threats.fight_detector import FightDetector
from threats.fall_detector import FallDetector
from threats.harassment_detector import HarassmentDetector
from threats.assault_detector import AssaultDetector
from threats.unconscious_detector import UnconsciousDetector
from threats.trespass_detector import TrespassDetector
from threats.crowd_panic_detector import CrowdPanicDetector
from threats.accident_detector import AccidentDetector
from threats.abuse_detector import AbuseDetector

_RISK_ORDER = ["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]

_BORDER_COLORS = {
    "SAFE": (0, 200, 50),
    "LOW": (0, 220, 220),
    "MEDIUM": (0, 140, 255),
    "HIGH": (0, 60, 255),
    "CRITICAL": (180, 0, 255),
}


@dataclass
class ThreatReport:
    camera_id: str
    timestamp: float
    threats_detected: List[ThreatEvent]
    annotated_frame: np.ndarray
    overall_risk_level: str

    def __repr__(self) -> str:
        return (
            f"ThreatReport(cam='{self.camera_id}', "
            f"threats={len(self.threats_detected)}, "
            f"risk='{self.overall_risk_level}')"
        )


class ThreatEngine:
    """Central coordinator for all threat detectors."""

    def __init__(self, config: Dict[str, Any], zone_manager: ZoneManager) -> None:
        threats_cfg = config.get("threats", {})
        self._fight = FightDetector(threats_cfg.get("fight", {}))
        self._fall = FallDetector(threats_cfg.get("fall", {}))
        self._harassment = HarassmentDetector(threats_cfg.get("harassment", {}))
        self._assault = AssaultDetector(threats_cfg.get("assault", {}))
        self._unconscious = UnconsciousDetector(threats_cfg.get("unconscious", {}))
        self._trespass = TrespassDetector(threats_cfg.get("trespass", {}), zone_manager)
        self._crowd_panic = CrowdPanicDetector(threats_cfg.get("crowd_panic", {}))
        self._accident = AccidentDetector(threats_cfg.get("accident", {}))
        self._abuse = AbuseDetector(threats_cfg.get("abuse", {}))

        self._cooldowns: Dict[str, float] = {}  # "cam_id:threat_type" → last alert time
        self._cooldown_sec: float = 10.0
        self._lock = threading.Lock()
        logger.info("ThreatEngine initialised with 9 detectors.")

    # ─────────────────────────── public API ─────────────────────────

    def analyze(
        self,
        frame: np.ndarray,
        camera_id: str,
        timestamp: float,
        persons: List[Person],
        poses: List[PoseResult],
        flow_result: Optional[FlowResult],
        velocity_tracker: VelocityTracker,
    ) -> ThreatReport:
        frame_shape = frame.shape
        all_threats: List[ThreatEvent] = []

        # Run all detectors in parallel
        with ThreadPoolExecutor(max_workers=6) as pool:
            futures = {
                pool.submit(self._fight.detect, persons, poses, velocity_tracker, frame_shape): "fight",
                pool.submit(self._fall.detect, persons, poses, velocity_tracker, frame_shape): "fall",
                pool.submit(self._harassment.detect, persons, poses, velocity_tracker, frame_shape): "harassment",
                pool.submit(self._assault.detect, persons, poses, velocity_tracker, frame_shape): "assault",
                pool.submit(self._unconscious.detect, persons, poses, velocity_tracker, frame_shape): "unconscious",
                pool.submit(self._abuse.detect, persons, poses, velocity_tracker, frame_shape): "abuse",
            }
            # Zone-based (needs zone_manager) and flow-based run directly
            try:
                all_threats += self._trespass.detect(persons, poses, frame_shape)
            except Exception as e:
                logger.warning(f"TrespassDetector error: {e}")
            try:
                all_threats += self._crowd_panic.detect(persons, poses, flow_result, frame_shape)
            except Exception as e:
                logger.warning(f"CrowdPanicDetector error: {e}")

            # Collect recent fall pids for accident detector
            for fut, name in futures.items():
                try:
                    result = fut.result(timeout=1.0)
                    all_threats += result
                except Exception as e:
                    logger.warning(f"{name} detector error: {e}")

        fall_pids = [
            pid
            for t in all_threats
            if t.threat_type == "fall"
            for pid in t.persons_involved
        ]
        try:
            all_threats += self._accident.detect(persons, poses, flow_result, fall_pids, frame_shape)
        except Exception as e:
            logger.warning(f"AccidentDetector error: {e}")

        # Apply per-threat cooldowns
        filtered = self._apply_cooldowns(all_threats, camera_id, timestamp)
        risk = self.get_risk_level(filtered)
        annotated = self._draw_overlays(frame.copy(), filtered, risk)

        return ThreatReport(
            camera_id=camera_id,
            timestamp=timestamp,
            threats_detected=filtered,
            annotated_frame=annotated,
            overall_risk_level=risk,
        )

    def get_risk_level(self, threats: List[ThreatEvent]) -> str:
        if not threats:
            return "SAFE"
        sev_map = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
        max_sev = max((sev_map.get(t.severity, 0) for t in threats), default=0)
        return ["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"][max_sev]

    # ─────────────────────────── internals ──────────────────────────

    def _apply_cooldowns(
        self, threats: List[ThreatEvent], camera_id: str, now: float
    ) -> List[ThreatEvent]:
        result = []
        with self._lock:
            for t in threats:
                key = f"{camera_id}:{t.threat_type}"
                last = self._cooldowns.get(key, 0.0)
                if now - last >= self._cooldown_sec:
                    self._cooldowns[key] = now
                    result.append(t)
        return result

    def _draw_overlays(
        self, frame: np.ndarray, threats: List[ThreatEvent], risk: str
    ) -> np.ndarray:
        color = _BORDER_COLORS.get(risk, (0, 200, 50))
        thickness = 6 if risk in ("HIGH", "CRITICAL") else 3
        h, w = frame.shape[:2]
        cv2.rectangle(frame, (0, 0), (w - 1, h - 1), color, thickness)

        for i, t in enumerate(threats[:3]):
            label = f"⚠ {t.threat_type.upper()} {t.confidence:.0%}"
            cv2.putText(
                frame, label, (10, 30 + i * 28),
                cv2.FONT_HERSHEY_SIMPLEX, 0.75, color, 2, cv2.LINE_AA
            )
            if len(t.location_bbox) == 4:
                x1, y1, x2, y2 = t.location_bbox
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

        # Risk badge top-right
        badge = f" {risk} "
        (bw, bh), _ = cv2.getTextSize(badge, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
        cv2.rectangle(frame, (w - bw - 12, 4), (w - 4, bh + 10), color, -1)
        cv2.putText(
            frame, badge, (w - bw - 8, bh + 6),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2, cv2.LINE_AA
        )
        return frame

    def __repr__(self) -> str:
        return "ThreatEngine(detectors=9)"
