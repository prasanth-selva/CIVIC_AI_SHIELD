"""
Incident Logger Module
SQLite-based incident storage and JSON logging
"""

import json
import sqlite3
import time
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from contextlib import contextmanager
import logging
import threading

from ..config import settings

logger = logging.getLogger(__name__)


class IncidentLogger:
    """
    Logs threat detection incidents to SQLite and JSON files
    Thread-safe with connection pooling
    """
    
    def __init__(
        self,
        db_path: Path = None,
        json_log_path: Path = None,
    ):
        """
        Initialize incident logger
        
        Args:
            db_path: Path to SQLite database
            json_log_path: Path to JSON log file
        """
        self.db_path = db_path or settings.logging.db_path
        self.json_log_path = json_log_path or settings.logging.json_log_path
        
        # Ensure directories exist
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.json_log_path.parent.mkdir(parents=True, exist_ok=True)
        
        self._lock = threading.Lock()
        self._initialized = False
        
        # Initialize database
        self._init_db()
    
    def _init_db(self):
        """Initialize database schema"""
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS incidents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    threat_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    confidence REAL NOT NULL,
                    camera_id TEXT NOT NULL,
                    camera_name TEXT,
                    timestamp REAL NOT NULL,
                    bbox_x1 INTEGER,
                    bbox_y1 INTEGER,
                    bbox_x2 INTEGER,
                    bbox_y2 INTEGER,
                    consecutive_frames INTEGER DEFAULT 1,
                    alert_sent INTEGER DEFAULT 0,
                    frame_path TEXT,
                    metadata TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create indexes
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_camera_id ON incidents(camera_id)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_timestamp ON incidents(timestamp)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_severity ON incidents(severity)
            """)
            
            conn.commit()
        
        self._initialized = True
        logger.info(f"Incident database initialized at {self.db_path}")
    
    @contextmanager
    def _get_connection(self):
        """Get thread-safe database connection"""
        conn = sqlite3.connect(str(self.db_path), timeout=10.0)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()
    
    def log_incident(
        self,
        threat_type: str,
        severity: str,
        confidence: float,
        camera_id: str,
        camera_name: str = None,
        timestamp: float = None,
        bbox: tuple = None,
        consecutive_frames: int = 1,
        alert_sent: bool = False,
        frame_path: str = None,
        metadata: Dict = None,
    ) -> int:
        """
        Log a threat detection incident
        
        Args:
            threat_type: Type of detected threat
            severity: Alert severity level
            confidence: Detection confidence
            camera_id: Camera identifier
            camera_name: Human-readable camera name
            timestamp: Event timestamp
            bbox: Bounding box (x1, y1, x2, y2)
            consecutive_frames: Number of consecutive detection frames
            alert_sent: Whether alert was sent
            frame_path: Path to saved frame image
            metadata: Additional metadata dict
            
        Returns:
            Incident ID
        """
        timestamp = timestamp or time.time()
        bbox = bbox or (0, 0, 0, 0)
        
        with self._lock:
            with self._get_connection() as conn:
                cursor = conn.execute("""
                    INSERT INTO incidents (
                        threat_type, severity, confidence, camera_id, camera_name,
                        timestamp, bbox_x1, bbox_y1, bbox_x2, bbox_y2,
                        consecutive_frames, alert_sent, frame_path, metadata
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    threat_type, severity, confidence, camera_id, camera_name,
                    timestamp, bbox[0], bbox[1], bbox[2], bbox[3],
                    consecutive_frames, int(alert_sent), frame_path,
                    json.dumps(metadata) if metadata else None,
                ))
                conn.commit()
                incident_id = cursor.lastrowid
        
        # Also log to JSON
        self._log_to_json({
            "id": incident_id,
            "threat_type": threat_type,
            "severity": severity,
            "confidence": confidence,
            "camera_id": camera_id,
            "camera_name": camera_name,
            "timestamp": timestamp,
            "bbox": bbox,
            "consecutive_frames": consecutive_frames,
            "alert_sent": alert_sent,
            "frame_path": frame_path,
            "metadata": metadata,
        })
        
        return incident_id
    
    def _log_to_json(self, incident: Dict):
        """Append incident to JSON log file"""
        try:
            with self._lock:
                with open(self.json_log_path, 'a') as f:
                    f.write(json.dumps(incident) + '\n')
        except Exception as e:
            logger.error(f"Failed to write JSON log: {e}")
    
    def get_incidents(
        self,
        camera_id: str = None,
        severity: str = None,
        threat_type: str = None,
        start_time: float = None,
        end_time: float = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict]:
        """
        Query incidents with filters
        
        Args:
            camera_id: Filter by camera
            severity: Filter by severity
            threat_type: Filter by threat type
            start_time: Start timestamp
            end_time: End timestamp
            limit: Maximum records
            offset: Pagination offset
            
        Returns:
            List of incident dicts
        """
        query = "SELECT * FROM incidents WHERE 1=1"
        params = []
        
        if camera_id:
            query += " AND camera_id = ?"
            params.append(camera_id)
        
        if severity:
            query += " AND severity = ?"
            params.append(severity)
        
        if threat_type:
            query += " AND threat_type = ?"
            params.append(threat_type)
        
        if start_time:
            query += " AND timestamp >= ?"
            params.append(start_time)
        
        if end_time:
            query += " AND timestamp <= ?"
            params.append(end_time)
        
        query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        with self._get_connection() as conn:
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
        
        return [dict(row) for row in rows]
    
    def get_incident_stats(
        self,
        time_window_hours: int = 24,
    ) -> Dict[str, Any]:
        """
        Get incident statistics
        
        Args:
            time_window_hours: Time window for stats
            
        Returns:
            Statistics dict
        """
        cutoff = time.time() - (time_window_hours * 3600)
        
        with self._get_connection() as conn:
            # Total count
            total = conn.execute(
                "SELECT COUNT(*) FROM incidents WHERE timestamp >= ?",
                (cutoff,)
            ).fetchone()[0]
            
            # By severity
            severity_counts = {}
            for row in conn.execute("""
                SELECT severity, COUNT(*) as count 
                FROM incidents 
                WHERE timestamp >= ?
                GROUP BY severity
            """, (cutoff,)):
                severity_counts[row['severity']] = row['count']
            
            # By threat type
            threat_counts = {}
            for row in conn.execute("""
                SELECT threat_type, COUNT(*) as count 
                FROM incidents 
                WHERE timestamp >= ?
                GROUP BY threat_type
            """, (cutoff,)):
                threat_counts[row['threat_type']] = row['count']
            
            # By camera
            camera_counts = {}
            for row in conn.execute("""
                SELECT camera_id, COUNT(*) as count 
                FROM incidents 
                WHERE timestamp >= ?
                GROUP BY camera_id
            """, (cutoff,)):
                camera_counts[row['camera_id']] = row['count']
        
        return {
            "time_window_hours": time_window_hours,
            "total_incidents": total,
            "by_severity": severity_counts,
            "by_threat_type": threat_counts,
            "by_camera": camera_counts,
        }
    
    def cleanup_old(self, days: int = None) -> int:
        """
        Remove incidents older than specified days
        
        Args:
            days: Number of days to retain
            
        Returns:
            Number of deleted records
        """
        days = days or settings.logging.retention_days
        cutoff = time.time() - (days * 86400)
        
        with self._get_connection() as conn:
            cursor = conn.execute(
                "DELETE FROM incidents WHERE timestamp < ?",
                (cutoff,)
            )
            conn.commit()
            deleted = cursor.rowcount
        
        logger.info(f"Cleaned up {deleted} incidents older than {days} days")
        return deleted
    
    def get_total_count(self) -> int:
        """Get total incident count"""
        with self._get_connection() as conn:
            return conn.execute("SELECT COUNT(*) FROM incidents").fetchone()[0]


# Global logger instance
_incident_logger: Optional[IncidentLogger] = None


def get_incident_logger() -> IncidentLogger:
    """Get global incident logger instance"""
    global _incident_logger
    if _incident_logger is None:
        _incident_logger = IncidentLogger()
    return _incident_logger
