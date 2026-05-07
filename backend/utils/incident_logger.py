"""
Incident Logger Module
SQLAlchemy-based incident storage and JSON logging
Supports SQLite and PostgreSQL
"""

import json
import time
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging
import threading

from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func

from ..config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

class IncidentModel(Base):
    __tablename__ = 'incidents'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    threat_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    confidence = Column(Float, nullable=False)
    camera_id = Column(String(50), nullable=False)
    camera_name = Column(String(100))
    timestamp = Column(Float, nullable=False)
    bbox_x1 = Column(Integer)
    bbox_y1 = Column(Integer)
    bbox_x2 = Column(Integer)
    bbox_y2 = Column(Integer)
    consecutive_frames = Column(Integer, default=1)
    alert_sent = Column(Integer, default=0)
    frame_path = Column(String(255))
    metadata_json = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    # Indexes
    __table_args__ = (
        Index('idx_camera_id', 'camera_id'),
        Index('idx_timestamp', 'timestamp'),
        Index('idx_severity', 'severity'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "threat_type": self.threat_type,
            "severity": self.severity,
            "confidence": self.confidence,
            "camera_id": self.camera_id,
            "camera_name": self.camera_name,
            "timestamp": self.timestamp,
            "bbox_x1": self.bbox_x1,
            "bbox_y1": self.bbox_y1,
            "bbox_x2": self.bbox_x2,
            "bbox_y2": self.bbox_y2,
            "consecutive_frames": self.consecutive_frames,
            "alert_sent": bool(self.alert_sent),
            "frame_path": self.frame_path,
            "metadata": json.loads(self.metadata_json) if self.metadata_json else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class IncidentLogger:
    """
    Logs threat detection incidents to Database (SQLAlchemy) and JSON files
    Thread-safe and cross-database compatible
    """
    
    def __init__(
        self,
        db_url: str = None,
        json_log_path: Path = None,
    ):
        """
        Initialize incident logger
        
        Args:
            db_url: SQLAlchemy connection URL
            json_log_path: Path to JSON log file
        """
        self.db_url = db_url or settings.logging.db_url
        self.json_log_path = json_log_path or settings.logging.json_log_path
        
        # Ensure directory for JSON log exists
        self.json_log_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Handle SQLite specifically to ensure directory exists
        if self.db_url.startswith("sqlite"):
            db_path = Path(self.db_url.replace("sqlite:///", ""))
            db_path.parent.mkdir(parents=True, exist_ok=True)
        
        self._lock = threading.Lock()
        
        # Initialize SQLAlchemy
        self.engine = create_engine(self.db_url, pool_pre_ping=True)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Create tables
        Base.metadata.create_all(bind=self.engine)
        logger.info(f"Incident database initialized with URL: {self.db_url}")
    
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
        """Log a threat detection incident"""
        timestamp = timestamp or time.time()
        bbox = bbox or (0, 0, 0, 0)
        
        db = self.SessionLocal()
        try:
            db_incident = IncidentModel(
                threat_type=threat_type,
                severity=severity,
                confidence=confidence,
                camera_id=camera_id,
                camera_name=camera_name,
                timestamp=timestamp,
                bbox_x1=bbox[0],
                bbox_y1=bbox[1],
                bbox_x2=bbox[2],
                bbox_y2=bbox[3],
                consecutive_frames=consecutive_frames,
                alert_sent=int(alert_sent),
                frame_path=frame_path,
                metadata_json=json.dumps(metadata) if metadata else None
            )
            db.add(db_incident)
            db.commit()
            db.refresh(db_incident)
            incident_id = db_incident.id
            
            # Also log to JSON
            self._log_to_json(db_incident.to_dict())
            
            return incident_id
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to log incident: {e}")
            return -1
        finally:
            db.close()
    
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
        """Query incidents with filters"""
        db = self.SessionLocal()
        try:
            query = db.query(IncidentModel)
            
            if camera_id:
                query = query.filter(IncidentModel.camera_id == camera_id)
            if severity:
                query = query.filter(IncidentModel.severity == severity)
            if threat_type:
                query = query.filter(IncidentModel.threat_type == threat_type)
            if start_time:
                query = query.filter(IncidentModel.timestamp >= start_time)
            if end_time:
                query = query.filter(IncidentModel.timestamp <= end_time)
                
            results = query.order_by(IncidentModel.timestamp.desc()).offset(offset).limit(limit).all()
            return [res.to_dict() for res in results]
        finally:
            db.close()
    
    def get_incident_stats(
        self,
        time_window_hours: int = 24,
    ) -> Dict[str, Any]:
        """Get incident statistics"""
        cutoff = time.time() - (time_window_hours * 3600)
        db = self.SessionLocal()
        try:
            # Total count
            total = db.query(IncidentModel).filter(IncidentModel.timestamp >= cutoff).count()
            
            # By severity
            severity_counts = dict(db.query(IncidentModel.severity, func.count(IncidentModel.id)).filter(IncidentModel.timestamp >= cutoff).group_by(IncidentModel.severity).all())
            
            # By threat type
            threat_counts = dict(db.query(IncidentModel.threat_type, func.count(IncidentModel.id)).filter(IncidentModel.timestamp >= cutoff).group_by(IncidentModel.threat_type).all())
            
            # By camera
            camera_counts = dict(db.query(IncidentModel.camera_id, func.count(IncidentModel.id)).filter(IncidentModel.timestamp >= cutoff).group_by(IncidentModel.camera_id).all())
            
            return {
                "time_window_hours": time_window_hours,
                "total_incidents": total,
                "by_severity": severity_counts,
                "by_threat_type": threat_counts,
                "by_camera": camera_counts,
            }
        finally:
            db.close()

    def cleanup_old(self, days: int = None) -> int:
        """Remove incidents older than specified days"""
        days = days or settings.logging.retention_days
        cutoff = time.time() - (days * 86400)
        
        db = self.SessionLocal()
        try:
            deleted = db.query(IncidentModel).filter(IncidentModel.timestamp < cutoff).delete()
            db.commit()
            logger.info(f"Cleaned up {deleted} incidents older than {days} days")
            return deleted
        except Exception as e:
            db.rollback()
            logger.error(f"Failed cleanup: {e}")
            return 0
        finally:
            db.close()
    
    def get_total_count(self) -> int:
        """Get total incident count"""
        db = self.SessionLocal()
        try:
            return db.query(IncidentModel).count()
        finally:
            db.close()

# Global logger instance
_incident_logger: Optional[IncidentLogger] = None

def get_incident_logger() -> IncidentLogger:
    """Get global incident logger instance"""
    global _incident_logger
    if _incident_logger is None:
        _incident_logger = IncidentLogger()
    return _incident_logger
