"""
Alert Manager Module
Manages alert queue, cooldowns, and multi-channel notifications
"""

import time
import threading
from queue import Queue, Empty
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass, field
from collections import defaultdict
import logging

from ..config import settings
from ..inference.decision_engine import AlertEvent
from .telegram_bot import TelegramBot

logger = logging.getLogger(__name__)


@dataclass
class AlertRecord:
    """Record of a sent alert"""
    alert: AlertEvent
    sent_time: float
    channels: List[str]
    success: bool


class AlertManager:
    """
    Manages alert processing, cooldowns, and delivery
    Supports multiple notification channels with priority handling
    """
    
    def __init__(
        self,
        telegram_bot: TelegramBot = None,
    ):
        """
        Initialize alert manager
        
        Args:
            telegram_bot: Configured TelegramBot instance
        """
        self.telegram_bot = telegram_bot or TelegramBot()
        
        # Alert queue for async processing
        self._alert_queue: Queue[AlertEvent] = Queue()
        
        # Cooldown tracking per camera per threat
        self._cooldowns: Dict[str, Dict[str, float]] = defaultdict(dict)
        
        # Alert history
        self._history: List[AlertRecord] = []
        self._max_history = 500
        
        # Processing thread
        self._running = False
        self._thread: Optional[threading.Thread] = None
        
        # Custom handlers
        self._handlers: List[Callable[[AlertEvent], None]] = []
        
        # Stats
        self._alerts_processed = 0
        self._alerts_sent = 0
        self._alerts_suppressed = 0
    
    def start(self):
        """Start alert processing thread"""
        if self._running:
            return
        
        self._running = True
        self._thread = threading.Thread(target=self._process_loop, daemon=True)
        self._thread.start()
        logger.info("Alert manager started")
    
    def stop(self):
        """Stop alert processing"""
        self._running = False
        if self._thread:
            self._thread.join(timeout=2.0)
            self._thread = None
        logger.info("Alert manager stopped")
    
    def add_handler(self, handler: Callable[[AlertEvent], None]):
        """
        Add custom alert handler
        
        Args:
            handler: Callable that receives AlertEvent
        """
        self._handlers.append(handler)
    
    def queue_alert(self, alert: AlertEvent) -> bool:
        """
        Queue an alert for processing
        
        Args:
            alert: AlertEvent to process
            
        Returns:
            True if queued, False if suppressed by cooldown
        """
        # Check cooldown
        if self._is_in_cooldown(alert.camera_id, alert.threat_type):
            self._alerts_suppressed += 1
            logger.debug(
                f"Alert suppressed (cooldown): {alert.threat_type} on {alert.camera_name}"
            )
            return False
        
        # Add to queue
        self._alert_queue.put(alert)
        return True
    
    def process_alert(self, alert: AlertEvent) -> bool:
        """
        Process an alert immediately (synchronous)
        
        Args:
            alert: AlertEvent to process
            
        Returns:
            True if sent successfully
        """
        self._alerts_processed += 1
        channels_used = []
        success = False
        
        # Send via Telegram
        if self.telegram_bot and self.telegram_bot.is_configured:
            sent = self.telegram_bot.send_alert(
                threat_type=alert.threat_type,
                severity=alert.severity.value,
                camera_name=alert.camera_name,
                confidence=alert.confidence,
                timestamp=alert.timestamp,
                image=alert.frame,
            )
            if sent:
                channels_used.append("telegram")
                success = True
        
        # Call custom handlers
        for handler in self._handlers:
            try:
                handler(alert)
                channels_used.append("custom")
            except Exception as e:
                logger.error(f"Custom handler error: {e}")
        
        # Update cooldown
        self._set_cooldown(alert.camera_id, alert.threat_type)
        
        # Record
        record = AlertRecord(
            alert=alert,
            sent_time=time.time(),
            channels=channels_used,
            success=success,
        )
        self._add_to_history(record)
        
        if success:
            self._alerts_sent += 1
            logger.info(
                f"Alert sent: {alert.threat_type} on {alert.camera_name} "
                f"via {', '.join(channels_used)}"
            )
        
        return success
    
    def _process_loop(self):
        """Background thread for processing queued alerts"""
        while self._running:
            try:
                alert = self._alert_queue.get(timeout=0.5)
                self.process_alert(alert)
            except Empty:
                continue
            except Exception as e:
                logger.error(f"Alert processing error: {e}")
    
    def _is_in_cooldown(self, camera_id: str, threat_type: str) -> bool:
        """Check if alert type is in cooldown for camera"""
        camera_cooldowns = self._cooldowns.get(camera_id, {})
        last_alert_time = camera_cooldowns.get(threat_type, 0)
        return time.time() - last_alert_time < settings.decision.alert_cooldown
    
    def _set_cooldown(self, camera_id: str, threat_type: str):
        """Set cooldown for camera/threat combination"""
        self._cooldowns[camera_id][threat_type] = time.time()
    
    def _add_to_history(self, record: AlertRecord):
        """Add record to history with size limit"""
        self._history.append(record)
        if len(self._history) > self._max_history:
            self._history.pop(0)
    
    def get_history(
        self,
        camera_id: str = None,
        threat_type: str = None,
        limit: int = 50,
    ) -> List[Dict]:
        """
        Get alert history
        
        Args:
            camera_id: Filter by camera
            threat_type: Filter by threat type
            limit: Maximum records to return
            
        Returns:
            List of alert records as dicts
        """
        records = self._history
        
        if camera_id:
            records = [r for r in records if r.alert.camera_id == camera_id]
        
        if threat_type:
            records = [r for r in records if r.alert.threat_type == threat_type]
        
        # Return most recent
        recent = records[-limit:]
        
        return [
            {
                **r.alert.to_dict(),
                "sent_time": r.sent_time,
                "channels": r.channels,
                "success": r.success,
            }
            for r in recent
        ]
    
    def clear_cooldown(self, camera_id: str = None, threat_type: str = None):
        """
        Clear cooldowns
        
        Args:
            camera_id: Clear for specific camera (all if None)
            threat_type: Clear for specific threat (all if None)
        """
        if camera_id is None:
            self._cooldowns.clear()
        elif threat_type is None:
            self._cooldowns.pop(camera_id, None)
        else:
            camera_cooldowns = self._cooldowns.get(camera_id, {})
            camera_cooldowns.pop(threat_type, None)
    
    @property
    def queue_size(self) -> int:
        """Current queue size"""
        return self._alert_queue.qsize()
    
    @property
    def stats(self) -> Dict:
        """Get manager statistics"""
        return {
            "alerts_processed": self._alerts_processed,
            "alerts_sent": self._alerts_sent,
            "alerts_suppressed": self._alerts_suppressed,
            "queue_size": self.queue_size,
            "history_size": len(self._history),
            "active_cooldowns": sum(len(c) for c in self._cooldowns.values()),
            "telegram_stats": self.telegram_bot.stats if self.telegram_bot else None,
        }
    
    def __enter__(self):
        self.start()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()
