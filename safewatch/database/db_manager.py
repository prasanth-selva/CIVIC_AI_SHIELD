"""
SafeWatch — DatabaseManager
Manages all SQLite operations for incidents, logs, and camera status.
"""

from __future__ import annotations

import sqlite3
import threading
from contextlib import contextmanager
from datetime import datetime, date
from pathlib import Path
from typing import Any, Dict, Generator, List, Optional

from loguru import logger


class DatabaseManager:
    """Thread-safe SQLite database manager for SafeWatch."""

    SCHEMA_SQL = """
    CREATE TABLE IF NOT EXISTS incidents (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        camera_id        TEXT    NOT NULL,
        timestamp        DATETIME NOT NULL,
        threat_type      TEXT    NOT NULL,
        confidence       REAL    NOT NULL,
        severity         TEXT    NOT NULL,
        persons_involved INTEGER DEFAULT 0,
        description      TEXT    DEFAULT '',
        snapshot_path    TEXT    DEFAULT '',
        recording_path   TEXT    DEFAULT '',
        alert_sent       INTEGER DEFAULT 0,
        acknowledged     INTEGER DEFAULT 0,
        created_at       DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_logs (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp  DATETIME NOT NULL,
        level      TEXT     NOT NULL,
        message    TEXT     NOT NULL,
        camera_id  TEXT     DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS camera_status (
        camera_id          TEXT     PRIMARY KEY,
        last_seen          DATETIME,
        status             TEXT     DEFAULT 'unknown',
        fps                REAL     DEFAULT 0.0,
        frames_processed   INTEGER  DEFAULT 0,
        threats_today      INTEGER  DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_incidents_camera   ON incidents(camera_id);
    CREATE INDEX IF NOT EXISTS idx_incidents_ts       ON incidents(timestamp);
    CREATE INDEX IF NOT EXISTS idx_incidents_type     ON incidents(threat_type);
    CREATE INDEX IF NOT EXISTS idx_system_logs_ts     ON system_logs(timestamp);
    """

    def __init__(self, db_path: str = "logs/safewatch.db") -> None:
        self._path = Path(db_path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._init_db()
        logger.info(f"DatabaseManager initialised → {self._path.resolve()}")

    # ─────────────────────────── internal ───────────────────────────

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.executescript(self.SCHEMA_SQL)
            conn.commit()

    @contextmanager
    def _connect(self) -> Generator[sqlite3.Connection, None, None]:
        conn = sqlite3.connect(str(self._path), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        try:
            yield conn
        finally:
            conn.close()

    # ─────────────────────────── incidents ──────────────────────────

    def log_incident(self, data: Dict[str, Any]) -> int:
        """Insert one incident row. Returns the new row ID."""
        now = datetime.utcnow().isoformat(sep=" ", timespec="seconds")
        sql = """
            INSERT INTO incidents
                (camera_id, timestamp, threat_type, confidence, severity,
                 persons_involved, description, snapshot_path, recording_path,
                 alert_sent, acknowledged, created_at)
            VALUES
                (:camera_id, :timestamp, :threat_type, :confidence, :severity,
                 :persons_involved, :description, :snapshot_path, :recording_path,
                 :alert_sent, :acknowledged, :created_at)
        """
        row = {
            "camera_id":        data.get("camera_id", ""),
            "timestamp":        data.get("timestamp", now),
            "threat_type":      data.get("threat_type", "unknown"),
            "confidence":       float(data.get("confidence", 0.0)),
            "severity":         data.get("severity", "LOW"),
            "persons_involved": int(data.get("persons_involved", 0)),
            "description":      data.get("description", ""),
            "snapshot_path":    data.get("snapshot_path", ""),
            "recording_path":   data.get("recording_path", ""),
            "alert_sent":       int(data.get("alert_sent", 0)),
            "acknowledged":     int(data.get("acknowledged", 0)),
            "created_at":       now,
        }
        with self._lock:
            with self._connect() as conn:
                cur = conn.execute(sql, row)
                conn.commit()
                return cur.lastrowid  # type: ignore[return-value]

    def get_incidents(
        self,
        camera_id: Optional[str] = None,
        threat_type: Optional[str] = None,
        severity: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 200,
    ) -> List[Dict[str, Any]]:
        """Fetch incidents with optional filters."""
        clauses: List[str] = []
        params: Dict[str, Any] = {}

        if camera_id:
            clauses.append("camera_id = :camera_id")
            params["camera_id"] = camera_id
        if threat_type:
            clauses.append("threat_type = :threat_type")
            params["threat_type"] = threat_type
        if severity:
            clauses.append("severity = :severity")
            params["severity"] = severity
        if start_date:
            clauses.append("timestamp >= :start_date")
            params["start_date"] = start_date
        if end_date:
            clauses.append("timestamp <= :end_date")
            params["end_date"] = end_date

        where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
        sql = f"SELECT * FROM incidents {where} ORDER BY timestamp DESC LIMIT :limit"
        params["limit"] = limit

        with self._connect() as conn:
            rows = conn.execute(sql, params).fetchall()
            return [dict(r) for r in rows]

    def get_recent_incidents(self, n: int = 20) -> List[Dict[str, Any]]:
        """Return the N most recent incidents."""
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM incidents ORDER BY timestamp DESC LIMIT ?", (n,)
            ).fetchall()
            return [dict(r) for r in rows]

    def get_daily_stats(self, target_date: Optional[str] = None) -> Dict[str, Any]:
        """Return threat counts grouped by type and camera for a given date."""
        if target_date is None:
            target_date = date.today().isoformat()

        with self._connect() as conn:
            by_type = conn.execute(
                """SELECT threat_type, COUNT(*) as cnt
                   FROM incidents
                   WHERE DATE(timestamp) = ?
                   GROUP BY threat_type""",
                (target_date,),
            ).fetchall()

            by_camera = conn.execute(
                """SELECT camera_id, COUNT(*) as cnt
                   FROM incidents
                   WHERE DATE(timestamp) = ?
                   GROUP BY camera_id""",
                (target_date,),
            ).fetchall()

            total = conn.execute(
                "SELECT COUNT(*) as cnt FROM incidents WHERE DATE(timestamp) = ?",
                (target_date,),
            ).fetchone()

        return {
            "date": target_date,
            "total": total["cnt"] if total else 0,
            "by_type": {r["threat_type"]: r["cnt"] for r in by_type},
            "by_camera": {r["camera_id"]: r["cnt"] for r in by_camera},
        }

    def update_incident_alert_sent(self, incident_id: int) -> None:
        with self._lock:
            with self._connect() as conn:
                conn.execute(
                    "UPDATE incidents SET alert_sent = 1 WHERE id = ?", (incident_id,)
                )
                conn.commit()

    def acknowledge_incident(self, incident_id: int) -> None:
        with self._lock:
            with self._connect() as conn:
                conn.execute(
                    "UPDATE incidents SET acknowledged = 1 WHERE id = ?",
                    (incident_id,),
                )
                conn.commit()

    # ─────────────────────────── system logs ────────────────────────

    def log_system(self, level: str, message: str, camera_id: str = "") -> None:
        now = datetime.utcnow().isoformat(sep=" ", timespec="seconds")
        with self._lock:
            with self._connect() as conn:
                conn.execute(
                    "INSERT INTO system_logs (timestamp, level, message, camera_id) VALUES (?,?,?,?)",
                    (now, level, message, camera_id),
                )
                conn.commit()

    def get_system_logs(self, n: int = 100, level: Optional[str] = None) -> List[Dict[str, Any]]:
        if level:
            sql = "SELECT * FROM system_logs WHERE level=? ORDER BY timestamp DESC LIMIT ?"
            params: tuple = (level, n)
        else:
            sql = "SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT ?"
            params = (n,)
        with self._connect() as conn:
            rows = conn.execute(sql, params).fetchall()
            return [dict(r) for r in rows]

    # ─────────────────────────── camera status ──────────────────────

    def update_camera_status(self, camera_id: str, status_data: Dict[str, Any]) -> None:
        now = datetime.utcnow().isoformat(sep=" ", timespec="seconds")
        sql = """
            INSERT INTO camera_status
                (camera_id, last_seen, status, fps, frames_processed, threats_today)
            VALUES
                (:camera_id, :last_seen, :status, :fps, :frames_processed, :threats_today)
            ON CONFLICT(camera_id) DO UPDATE SET
                last_seen        = excluded.last_seen,
                status           = excluded.status,
                fps              = excluded.fps,
                frames_processed = excluded.frames_processed,
                threats_today    = excluded.threats_today
        """
        row = {
            "camera_id":        camera_id,
            "last_seen":        now,
            "status":           status_data.get("status", "unknown"),
            "fps":              float(status_data.get("fps", 0.0)),
            "frames_processed": int(status_data.get("frames_processed", 0)),
            "threats_today":    int(status_data.get("threats_today", 0)),
        }
        with self._lock:
            with self._connect() as conn:
                conn.execute(sql, row)
                conn.commit()

    def get_camera_status(self, camera_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if camera_id:
            with self._connect() as conn:
                row = conn.execute(
                    "SELECT * FROM camera_status WHERE camera_id = ?", (camera_id,)
                ).fetchone()
                return [dict(row)] if row else []
        with self._connect() as conn:
            rows = conn.execute("SELECT * FROM camera_status").fetchall()
            return [dict(r) for r in rows]

    # ─────────────────────────── utilities ──────────────────────────

    def export_to_csv(
        self, output_path: str, start_date: Optional[str] = None, end_date: Optional[str] = None
    ) -> Path:
        import csv

        rows = self.get_incidents(start_date=start_date, end_date=end_date, limit=100_000)
        out = Path(output_path)
        out.parent.mkdir(parents=True, exist_ok=True)
        if not rows:
            logger.warning("No incidents to export.")
            out.write_text("")
            return out
        with out.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)
        logger.info(f"Exported {len(rows)} incidents → {out}")
        return out

    def __repr__(self) -> str:
        return f"DatabaseManager(path='{self._path}')"
