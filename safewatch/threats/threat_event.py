"""
SafeWatch — ThreatEvent & shared threat dataclass.
All threat detectors import from here.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import List


@dataclass
class ThreatEvent:
    threat_type: str
    confidence: float
    persons_involved: List[int]
    location_bbox: tuple        # (x1, y1, x2, y2) or empty tuple
    description: str
    severity: str               # "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

    def __repr__(self) -> str:
        return (
            f"ThreatEvent(type='{self.threat_type}', "
            f"conf={self.confidence:.2f}, sev='{self.severity}')"
        )
