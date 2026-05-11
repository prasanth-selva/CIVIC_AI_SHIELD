"""
SafeWatch — TrespassDetector
Geometric zone-violation detector using ZoneManager.
"""
from __future__ import annotations
from typing import Any, Dict, List
from loguru import logger
from detection.person_detector import Person
from detection.pose_estimator import PoseResult
from detection.zone_manager import ZoneManager
from threats.threat_event import ThreatEvent


class TrespassDetector:
    def __init__(self, config: Dict[str, Any], zone_manager: ZoneManager) -> None:
        self._cfg = config
        self._zones = zone_manager
        self._dwell_counter: Dict[str, Dict[int, int]] = {}  # zone→pid→frames
        logger.info("TrespassDetector ready.")

    def detect(
        self,
        persons: List[Person],
        poses: List[PoseResult],
        frame_shape: tuple = (480, 640),
    ) -> List[ThreatEvent]:
        if not self._cfg.get("enabled", True):
            return []

        threshold = self._cfg.get("confidence_threshold", 0.95)
        events: List[ThreatEvent] = []

        for zone_name in self._zones.list_zones():
            if zone_name not in self._dwell_counter:
                self._dwell_counter[zone_name] = {}

            violators = self._zones.get_violations(persons, zone_name)
            violator_ids = {p.id for p in violators}

            # Decay non-violators
            stale = [pid for pid in self._dwell_counter[zone_name] if pid not in violator_ids]
            for pid in stale:
                del self._dwell_counter[zone_name][pid]

            for person in violators:
                pid = person.id
                self._dwell_counter[zone_name][pid] = (
                    self._dwell_counter[zone_name].get(pid, 0) + 1
                )
                dwell = self._dwell_counter[zone_name][pid]

                # Immediate alert for critical zones or extended dwell (>75 frames ~5s)
                if dwell == 1 or dwell == 75:
                    sev = "HIGH" if dwell > 1 else "MEDIUM"
                    events.append(ThreatEvent(
                        threat_type="trespass",
                        confidence=threshold,
                        persons_involved=[pid],
                        location_bbox=person.bbox,
                        description=(
                            f"Person {pid} is inside restricted zone '{zone_name}' "
                            f"(dwell: {dwell} frames)."
                        ),
                        severity=sev,
                    ))
        return events

    def __repr__(self) -> str:
        return "TrespassDetector()"
