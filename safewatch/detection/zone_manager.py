"""
SafeWatch — ZoneManager
Polygon-based restricted zone management with pointPolygonTest queries.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np
import yaml
from loguru import logger

from detection.person_detector import Person


class Zone:
    """A named polygon zone with associated threat type."""

    COLORS: Dict[str, Tuple[int, int, int]] = {
        "restricted": (0, 0, 255),
        "entrance": (255, 165, 0),
        "outdoor": (0, 200, 255),
        "safe": (0, 255, 0),
        "critical": (128, 0, 255),
    }

    def __init__(
        self,
        name: str,
        polygon: List[Tuple[int, int]],
        zone_type: str = "restricted",
    ) -> None:
        self.name = name
        self.polygon = np.array(polygon, dtype=np.int32)
        self.zone_type = zone_type
        self.color = self.COLORS.get(zone_type, (0, 0, 255))

    def contains_point(self, point: Tuple[int, int]) -> bool:
        """Return True if point is inside or on the polygon boundary."""
        if len(self.polygon) < 3:
            return False
        result = cv2.pointPolygonTest(self.polygon, (float(point[0]), float(point[1])), False)
        return result >= 0

    def __repr__(self) -> str:
        return f"Zone(name='{self.name}', type='{self.zone_type}', pts={len(self.polygon)})"


class ZoneManager:
    """Manages all named zones for all cameras."""

    def __init__(self, config_path: str = "config.yaml") -> None:
        self._config_path = Path(config_path)
        self._zones: Dict[str, Zone] = {}
        self._load_zones_from_config()
        logger.info(f"ZoneManager ready | {len(self._zones)} zones loaded.")

    # ─────────────────────────── public API ─────────────────────────

    def add_zone(
        self,
        name: str,
        polygon_points: List[Tuple[int, int]],
        zone_type: str = "restricted",
    ) -> None:
        """Add or replace a named zone."""
        zone = Zone(name=name, polygon=polygon_points, zone_type=zone_type)
        self._zones[name] = zone
        logger.info(f"Zone added/updated: {zone}")

    def remove_zone(self, name: str) -> bool:
        """Remove a zone by name. Returns True if removed."""
        if name in self._zones:
            del self._zones[name]
            logger.info(f"Zone removed: {name}")
            return True
        return False

    def is_in_zone(self, point: Tuple[int, int], zone_name: str) -> bool:
        """Return True if point lies within the named zone."""
        zone = self._zones.get(zone_name)
        if zone is None:
            return False
        return zone.contains_point(point)

    def get_violations(
        self, persons: List[Person], zone_name: str
    ) -> List[Person]:
        """Return persons whose center is inside the named zone."""
        zone = self._zones.get(zone_name)
        if zone is None:
            return []
        return [p for p in persons if zone.contains_point(p.center)]

    def get_all_violations(self, persons: List[Person]) -> Dict[str, List[Person]]:
        """Return violations for every zone."""
        return {
            name: self.get_violations(persons, name) for name in self._zones
        }

    def draw_zones(self, frame: np.ndarray) -> np.ndarray:
        """Draw all zone polygons with labels on frame (in-place copy)."""
        out = frame.copy()
        for name, zone in self._zones.items():
            overlay = out.copy()
            cv2.fillPoly(overlay, [zone.polygon], zone.color)
            cv2.addWeighted(overlay, 0.15, out, 0.85, 0, out)
            cv2.polylines(out, [zone.polygon], True, zone.color, 2)
            # Label at centroid
            cx = int(zone.polygon[:, 0].mean())
            cy = int(zone.polygon[:, 1].mean())
            cv2.putText(
                out,
                f"[{zone.zone_type.upper()}] {name}",
                (cx - 40, cy),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                zone.color,
                1,
                cv2.LINE_AA,
            )
        return out

    def save_zones(self) -> None:
        """Persist current zones back to config.yaml under threats.trespass.zones."""
        try:
            with self._config_path.open("r") as f:
                cfg = yaml.safe_load(f) or {}

            zones_data = []
            for name, zone in self._zones.items():
                zones_data.append(
                    {
                        "name": name,
                        "type": zone.zone_type,
                        "polygon": zone.polygon.tolist(),
                    }
                )

            cfg.setdefault("threats", {}).setdefault("trespass", {})["zones"] = zones_data

            with self._config_path.open("w") as f:
                yaml.dump(cfg, f, default_flow_style=False, allow_unicode=True)

            logger.info(f"Zones saved to {self._config_path}")
        except Exception as exc:
            logger.error(f"Failed to save zones: {exc}")

    def list_zones(self) -> List[str]:
        return list(self._zones.keys())

    # ─────────────────────────── internals ──────────────────────────

    def _load_zones_from_config(self) -> None:
        if not self._config_path.exists():
            return
        try:
            with self._config_path.open("r") as f:
                cfg = yaml.safe_load(f) or {}
            zones_data = (
                cfg.get("threats", {}).get("trespass", {}).get("zones", [])
            )
            for zd in zones_data:
                name = zd.get("name", "unnamed")
                pts = [tuple(p) for p in zd.get("polygon", [])]
                zt = zd.get("type", "restricted")
                if len(pts) >= 3:
                    self.add_zone(name, pts, zt)  # type: ignore[arg-type]
        except Exception as exc:
            logger.warning(f"Could not load zones from config: {exc}")

    def __repr__(self) -> str:
        return f"ZoneManager(zones={list(self._zones.keys())})"
