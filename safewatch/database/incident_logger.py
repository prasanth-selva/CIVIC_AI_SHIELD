"""
SafeWatch — IncidentLogger
High-level wrapper around DatabaseManager for threat incident lifecycle.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

from loguru import logger

from database.db_manager import DatabaseManager


class IncidentLogger:
    """Log and retrieve threat incidents with convenience helpers."""

    def __init__(self, db: DatabaseManager) -> None:
        self._db = db
        logger.info("IncidentLogger ready.")

    # ──────────────────── logging ────────────────────

    def log_threat(
        self,
        threat_event: Any,
        camera_id: str,
        snapshot_path: str = "",
        recording_path: str = "",
    ) -> int:
        """
        Persist a ThreatEvent to the database.
        Returns the new incident ID.
        """
        ts = datetime.utcnow().isoformat(sep=" ", timespec="seconds")

        data: Dict[str, Any] = {
            "camera_id":        camera_id,
            "timestamp":        ts,
            "threat_type":      getattr(threat_event, "threat_type", "unknown"),
            "confidence":       float(getattr(threat_event, "confidence", 0.0)),
            "severity":         getattr(threat_event, "severity", "LOW"),
            "persons_involved": len(getattr(threat_event, "persons_involved", [])),
            "description":      getattr(threat_event, "description", ""),
            "snapshot_path":    snapshot_path,
            "recording_path":   recording_path,
            "alert_sent":       0,
            "acknowledged":     0,
        }

        incident_id = self._db.log_incident(data)
        logger.info(
            f"Incident #{incident_id} logged | "
            f"{data['threat_type']} | {data['severity']} | cam={camera_id}"
        )
        return incident_id

    # ──────────────────── retrieval ──────────────────

    def get_threat_stats(self, last_hours: int = 24) -> Dict[str, int]:
        """Return counts per threat_type for the last N hours."""
        since = (datetime.utcnow() - timedelta(hours=last_hours)).isoformat(
            sep=" ", timespec="seconds"
        )
        rows = self._db.get_incidents(start_date=since, limit=10_000)
        stats: Dict[str, int] = {}
        for row in rows:
            tt = row.get("threat_type", "unknown")
            stats[tt] = stats.get(tt, 0) + 1
        return stats

    def get_timeline(self, camera_id: str, target_date: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Return all incidents for a specific camera on a given date,
        ordered oldest first.
        """
        if target_date is None:
            target_date = datetime.utcnow().date().isoformat()

        start = f"{target_date} 00:00:00"
        end = f"{target_date} 23:59:59"
        rows = self._db.get_incidents(
            camera_id=camera_id,
            start_date=start,
            end_date=end,
            limit=10_000,
        )
        return sorted(rows, key=lambda r: r.get("timestamp", ""))

    def get_recent(self, n: int = 20) -> List[Dict[str, Any]]:
        return self._db.get_recent_incidents(n=n)

    def mark_alert_sent(self, incident_id: int) -> None:
        self._db.update_incident_alert_sent(incident_id)

    def acknowledge(self, incident_id: int) -> None:
        self._db.acknowledge_incident(incident_id)

    def export_csv(
        self,
        start_date: str,
        end_date: str,
        output_path: str = "recordings/incidents_export.csv",
    ) -> Path:
        return self._db.export_to_csv(output_path, start_date=start_date, end_date=end_date)

    def __repr__(self) -> str:
        return f"IncidentLogger(db={self._db!r})"
