"""
SafeWatch — SnapshotBuilder
Annotates threat frames and produces JPEG bytes for Telegram / storage.
"""
from __future__ import annotations

import io
from datetime import datetime
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from loguru import logger
from PIL import Image, ImageDraw, ImageFont

from threats.threat_event import ThreatEvent

_SEV_COLORS = {
    "LOW":      (0, 200, 200),
    "MEDIUM":   (0, 140, 255),
    "HIGH":     (0, 60, 255),
    "CRITICAL": (180, 0, 255),
}


class SnapshotBuilder:
    """Builds annotated snapshots for alerts."""

    _BORDER = 8
    _BANNER_H = 40
    _FOOTER_H = 32

    def __init__(self, recordings_dir: str = "recordings/") -> None:
        self._out_dir = Path(recordings_dir)
        self._out_dir.mkdir(parents=True, exist_ok=True)

    def build(
        self,
        frame: np.ndarray,
        threat_event: ThreatEvent,
        camera_id: str,
        timestamp: float,
        camera_name: str = "",
    ) -> bytes:
        """Return annotated JPEG bytes suitable for Telegram send_photo."""
        img = frame.copy()
        h, w = img.shape[:2]
        color = _SEV_COLORS.get(threat_event.severity, (255, 255, 255))

        # Coloured border
        cv2.rectangle(img, (0, 0), (w - 1, h - 1), color, self._BORDER)

        # Top banner
        cv2.rectangle(img, (0, 0), (w, self._BANNER_H), color, -1)
        banner_text = (
            f"⚠ {threat_event.threat_type.upper()}  "
            f"{threat_event.confidence:.0%} conf  |  {threat_event.severity}"
        )
        cv2.putText(
            img, banner_text, (10, 28),
            cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2, cv2.LINE_AA
        )

        # Person bounding boxes
        for pid in threat_event.persons_involved:
            pass  # bboxes already drawn by ThreatEngine overlay

        # Location box
        if len(threat_event.location_bbox) == 4:
            x1, y1, x2, y2 = threat_event.location_bbox
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 3)

        # Footer bar
        cv2.rectangle(img, (0, h - self._FOOTER_H), (w, h), (20, 20, 20), -1)
        ts_str = datetime.fromtimestamp(timestamp).strftime("%d/%m/%Y %H:%M:%S")
        cam_label = camera_name or camera_id
        cv2.putText(
            img, f"📷 {cam_label}", (8, h - 10),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1, cv2.LINE_AA
        )
        cv2.putText(
            img, ts_str, (w - 180, h - 10),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1, cv2.LINE_AA
        )
        # Watermark
        cv2.putText(
            img, "SafeWatch", (w // 2 - 45, h - 10),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (100, 100, 100), 1, cv2.LINE_AA
        )

        # Encode to JPEG
        ok, buf = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), 88])
        if not ok:
            logger.error("SnapshotBuilder: JPEG encode failed.")
            return b""
        return buf.tobytes()

    def save_snapshot(self, data: bytes, camera_id: str, timestamp: float) -> Path:
        """Persist snapshot JPEG to recordings/ directory."""
        ts_str = datetime.fromtimestamp(timestamp).strftime("%Y%m%d_%H%M%S")
        fname = self._out_dir / f"{camera_id}_{ts_str}_snapshot.jpg"
        fname.write_bytes(data)
        logger.debug(f"Snapshot saved → {fname}")
        return fname

    def __repr__(self) -> str:
        return f"SnapshotBuilder(out_dir='{self._out_dir}')"
