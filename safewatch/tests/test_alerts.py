"""
SafeWatch — Test Suite: Alerts
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import numpy as np
import pytest
import asyncio


class TestSnapshotBuilder:
    def _make_threat(self):
        from threats.threat_event import ThreatEvent
        return ThreatEvent(
            threat_type="fight",
            confidence=0.92,
            persons_involved=[1, 2],
            location_bbox=(50, 50, 200, 250),
            description="Test fight event",
            severity="HIGH",
        )

    def test_build_returns_bytes(self):
        from alerts.snapshot_builder import SnapshotBuilder
        sb = SnapshotBuilder(recordings_dir="/tmp/sw_test_recordings")
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        threat = self._make_threat()
        result = sb.build(frame, threat, "CAM-01", 1234567890.0, "Test Camera")
        assert isinstance(result, bytes)
        assert len(result) > 0

    def test_build_valid_jpeg(self):
        import cv2
        from alerts.snapshot_builder import SnapshotBuilder
        sb = SnapshotBuilder(recordings_dir="/tmp/sw_test_recordings")
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        threat = self._make_threat()
        data = sb.build(frame, threat, "CAM-01", 1234567890.0)
        arr = np.frombuffer(data, dtype=np.uint8)
        decoded = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        assert decoded is not None
        assert decoded.shape[0] == 480
        assert decoded.shape[1] == 640

    def test_save_snapshot(self, tmp_path):
        from alerts.snapshot_builder import SnapshotBuilder
        sb = SnapshotBuilder(recordings_dir=str(tmp_path))
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        threat = self._make_threat()
        data = sb.build(frame, threat, "CAM-01", 1234567890.0)
        saved = sb.save_snapshot(data, "CAM-01", 1234567890.0)
        assert saved.exists()
        assert saved.stat().st_size > 0


class TestTelegramBot:
    def test_init_disabled_without_token(self):
        from alerts.telegram_bot import SafeWatchTelegramBot
        bot = SafeWatchTelegramBot({"enabled": True, "bot_token": "", "agents": {}})
        assert not bot._enabled

    def test_repr(self):
        from alerts.telegram_bot import SafeWatchTelegramBot
        bot = SafeWatchTelegramBot({"enabled": False, "agents": {}})
        assert "enabled=False" in repr(bot)

    def test_test_connection_returns_false_when_disabled(self):
        from alerts.telegram_bot import SafeWatchTelegramBot
        bot = SafeWatchTelegramBot({"enabled": False, "agents": {}})
        result = asyncio.run(bot.test_connection())
        assert result is False


class TestAlertManager:
    def _make_db_logger(self, tmp_path):
        from database.db_manager import DatabaseManager
        from database.incident_logger import IncidentLogger
        db = DatabaseManager(db_path=str(tmp_path / "test.db"))
        return IncidentLogger(db)

    def test_get_active_alerts_empty(self, tmp_path):
        from alerts.telegram_bot import SafeWatchTelegramBot
        from alerts.alert_manager import AlertManager
        bot = SafeWatchTelegramBot({"enabled": False, "agents": {}})
        logger = self._make_db_logger(tmp_path)
        mgr = AlertManager(
            config={"recording": {"output_dir": str(tmp_path)},
                    "telegram": {"alert_cooldown_seconds": 30}},
            incident_logger=logger,
            telegram_bot=bot,
            cameras_cfg=[],
        )
        alerts = mgr.get_active_alerts()
        assert isinstance(alerts, list)

    def test_acknowledge_alert_no_crash(self, tmp_path):
        from alerts.telegram_bot import SafeWatchTelegramBot
        from alerts.alert_manager import AlertManager
        bot = SafeWatchTelegramBot({"enabled": False, "agents": {}})
        logger = self._make_db_logger(tmp_path)
        mgr = AlertManager(
            config={"recording": {"output_dir": str(tmp_path)},
                    "telegram": {"alert_cooldown_seconds": 30}},
            incident_logger=logger,
            telegram_bot=bot,
            cameras_cfg=[],
        )
        mgr.acknowledge_alert(9999)   # non-existent — should not raise
