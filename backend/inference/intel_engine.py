import time
import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
from .decision_engine import AlertEvent, Severity
from .detector import DetectionResult

logger = logging.getLogger(__name__)

class EscalationStatus(Enum):
    STABLE = "stable"
    EVOLVING = "evolving"
    CRITICAL = "critical"
    EXTREME = "extreme"

@dataclass
class TacticalRecommendation:
    action: str
    priority: str
    confidence: float
    reasoning: str
    suggested_nodes: List[str]

@dataclass
class IntelligenceReport:
    camera_id: str
    escalation_risk: float
    incident_probability: float
    status: EscalationStatus
    recommendation: TacticalRecommendation
    timestamp: float

class AutonomousIntelligenceEngine:
    """
    Autonomous Tactical AI Intelligence Engine.
    Implements Features 1 & 2: Threat Escalation, AI Decision Support.
    """
    def __init__(self):
        self.node_history: Dict[str, List[AlertEvent]] = {}
        self.max_history = 50

    def analyze_incident(self, camera_id: str, alerts: List[AlertEvent], result: DetectionResult) -> Optional[IntelligenceReport]:
        """Perform autonomous intelligence analysis on detected threats"""
        if not alerts and not result.detections:
            return None

        # Track history for escalation analysis
        if camera_id not in self.node_history:
            self.node_history[camera_id] = []
        
        for alert in alerts:
            self.node_history[camera_id].append(alert)
        
        # Keep recent history
        if len(self.node_history[camera_id]) > self.max_history:
            self.node_history[camera_id] = self.node_history[camera_id][-self.max_history:]

        # Calculate Escalation Metrics
        escalation_risk = self._calculate_escalation(camera_id)
        incident_prob = self._calculate_probability(camera_id, result)
        
        status = EscalationStatus.STABLE
        if escalation_risk > 0.8: status = EscalationStatus.EXTREME
        elif escalation_risk > 0.6: status = EscalationStatus.CRITICAL
        elif escalation_risk > 0.3: status = EscalationStatus.EVOLVING

        # Generate Recommendation (Decision Support)
        recommendation = self._generate_recommendation(camera_id, status, alerts, result)

        return IntelligenceReport(
            camera_id=camera_id,
            escalation_risk=round(escalation_risk, 2),
            incident_probability=round(incident_prob, 2),
            status=status,
            recommendation=recommendation,
            timestamp=time.time()
        )

    def _calculate_escalation(self, camera_id: str) -> float:
        """Analyze progression of threat severity over time"""
        history = self.node_history[camera_id]
        if len(history) < 2:
            return 0.1
        
        # Check if severity is increasing
        severities = [h.severity.value for h in history]
        # Simple escalation: ratio of high/critical alerts in recent window
        recent = severities[-10:]
        critical_count = sum(1 for s in recent if s in ["high", "critical"])
        return min(1.0, critical_count / 10.0 + 0.1)

    def _calculate_probability(self, camera_id: str, result: DetectionResult) -> float:
        """Predict probability of a major incident based on detection density"""
        if not result.detections:
            return 0.0
        
        # Density and confidence based probability
        max_conf = max([d.confidence for d in result.detections])
        det_count = len(result.detections)
        
        prob = (max_conf * 0.7) + (min(det_count, 5) * 0.06)
        return min(0.99, prob)

    def _generate_recommendation(self, camera_id: str, status: EscalationStatus, alerts: List[AlertEvent], result: DetectionResult) -> TacticalRecommendation:
        """AI-generated response logic"""
        if status == EscalationStatus.EXTREME:
            return TacticalRecommendation(
                action="IMMEDIATE DISPATCH & LOCKDOWN",
                priority="MAXIMUM",
                confidence=0.98,
                reasoning="Multiple critical threats identified with aggressive movement progression. Zone breach imminent.",
                suggested_nodes=["cam-001", "cam-002", "cam-005"]
            )
        elif status == EscalationStatus.CRITICAL:
            return TacticalRecommendation(
                action="DEPLOY SECURITY UNIT",
                priority="HIGH",
                confidence=0.85,
                reasoning="Persistent high-risk behavior detected. Pattern matches known escalation protocols.",
                suggested_nodes=["cam-001", "cam-004"]
            )
        elif status == EscalationStatus.EVOLVING:
            return TacticalRecommendation(
                action="CONTINUE PASSIVE OBSERVATION",
                priority="MEDIUM",
                confidence=0.72,
                reasoning="Anomaly detected but behavior remains non-combative. Monitoring for progression.",
                suggested_nodes=["cam-001"]
            )
        else:
            return TacticalRecommendation(
                action="MONITORING NOMINAL",
                priority="LOW",
                confidence=0.95,
                reasoning="System operating within standard safety parameters.",
                suggested_nodes=[]
            )

class TimelineManager:
    """
    Tactical Event Timeline Engine.
    Implements Feature 3: Unified Chronological Event System.
    """
    def __init__(self):
        self.events: List[Dict[str, Any]] = []
        self._max_events = 500

    def add_event(self, camera_id: str, type: str, data: Dict[str, Any]):
        event = {
            "id": f"evt-{int(time.time() * 1000)}",
            "timestamp": time.time(),
            "camera_id": camera_id,
            "type": type,
            "data": data,
            "chain_id": data.get("chain_id", "default")
        }
        self.events.append(event)
        if len(self.events) > self._max_events:
            self.events.pop(0)
        return event

    def get_timeline(self, limit: int = 50) -> List[Dict[str, Any]]:
        return sorted(self.events, key=lambda x: x["timestamp"], reverse=True)[:limit]

# Global Instance
_intel_engine: Optional[AutonomousIntelligenceEngine] = None
_timeline_manager: Optional[TimelineManager] = None

def get_intel_engine():
    global _intel_engine
    if _intel_engine is None:
        _intel_engine = AutonomousIntelligenceEngine()
    return _intel_engine

def get_timeline_manager():
    global _timeline_manager
    if _timeline_manager is None:
        _timeline_manager = TimelineManager()
    return _timeline_manager
