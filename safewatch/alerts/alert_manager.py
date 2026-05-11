"""
SafeWatch — AlertManager
Coordinates ThreatEngine → SnapshotBuilder → TelegramBot with cooldowns and queuing.
"""
from __future__ import annotations

import asyncio
import queue
import threading
import time
from typing import Any, Dict, List, Optional

import numpy as np
from loguru import logger

from alerts.snapshot_builder import SnapshotBuilder
from alerts.telegram_bot import SafeWatchTelegramBot
from database.incident_logger import IncidentLogger
from threats.threat_event import ThreatEvent
from threats.threat_engine import ThreatReport


class AlertManager:
    """Routes threat reports to the correct agents with cooldown and queueing."""

    def __init__(
        self,
        config: Dict[str, Any],
        incident_logger: IncidentLogger,
        telegram_bot: SafeWatchTelegramBot,
        cameras_cfg: List[Dict[str, Any]],
    ) -> None:
        self._cfg = config
        self._logger = incident_logger
        self._bot = telegram_bot
        self._snapshot_builder = SnapshotBuilder(
            recordings_dir=config.get("recording", {}).get("output_dir", "recordings/")
        )

        # Map camera_id → list of agent_ids
        self._cam_agents: Dict[str, List[str]] = {
            cam["id"]: cam.get("agents", []) for cam in cameras_cfg
        }
        self._cam_names: Dict[str, str] = {
            cam["id"]: cam.get("name", cam["id"]) for cam in cameras_cfg
        }

        cooldown = config.get("telegram", {}).get("alert_cooldown_seconds", 30)
        self._cooldown_sec: float = float(cooldown)
        self._last_alert: Dict[str, float] = {}   # "cam:type" → timestamp
        self._lock = threading.Lock()

        # Background worker for async Telegram sends
        self._alert_queue: queue.Queue = queue.Queue(maxsize=100)
        self._worker = threading.Thread(target=self._worker_loop, daemon=True, name="alert-worker")
        self._worker.start()
        logger.info("AlertManager ready.")

    # ─────────────────────────── public API ─────────────────────────

    def process_threat_report(
        self, report: ThreatReport, raw_frame: np.ndarray
    ) -> None:
        """Entry point: process a ThreatReport, log and send alerts."""
        for threat in report.threats_detected:
            now = time.time()
            cooldown_key = f"{report.camera_id}:{threat.threat_type}"

            with self._lock:
                last = self._last_alert.get(cooldown_key, 0.0)
                if now - last < self._cooldown_sec:
                    continue
                self._last_alert[cooldown_key] = now

            # Build snapshot
            snapshot: bytes = b""
            snapshot_path = ""
            try:
                snapshot = self._snapshot_builder.build(
                    raw_frame, threat, report.camera_id,
                    report.timestamp, self._cam_names.get(report.camera_id, "")
                )
                p = self._snapshot_builder.save_snapshot(snapshot, report.camera_id, report.timestamp)
                snapshot_path = str(p)
            except Exception as exc:
                logger.warning(f"Snapshot build failed: {exc}")

            # Log to DB
            try:
                inc_id = self._logger.log_threat(
                    threat, report.camera_id, snapshot_path=snapshot_path
                )
            except Exception as exc:
                logger.warning(f"Incident log failed: {exc}")
                inc_id = -1

            # Queue alert for async Telegram send
            agents = self._cam_agents.get(report.camera_id, [])
            for agent_id in agents:
                self._alert_queue.put_nowait({
                    "threat": threat,
                    "camera_id": report.camera_id,
                    "camera_name": self._cam_names.get(report.camera_id, ""),
                    "snapshot": snapshot,
                    "agent_id": agent_id,
                    "incident_id": inc_id,
                })

    def get_active_alerts(self) -> List[Dict[str, Any]]:
        return self._logger.get_recent(n=20)

    def acknowledge_alert(self, alert_id: int) -> None:
        self._logger.acknowledge(alert_id)

    # ─────────────────────────── worker ─────────────────────────────

    def _worker_loop(self) -> None:
        """Background thread: drains the queue and sends Telegram alerts."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        while True:
            try:
                item = self._alert_queue.get(timeout=1.0)
            except queue.Empty:
                continue

            try:
                loop.run_until_complete(
                    self._bot.send_threat_alert(
                        threat_event=item["threat"],
                        camera_id=item["camera_id"],
                        camera_name=item["camera_name"],
                        snapshot=item["snapshot"],
                        agent_id=item["agent_id"],
                    )
                )
                if item.get("incident_id", -1) > 0:
                    self._logger.mark_alert_sent(item["incident_id"])
            except Exception as exc:
                logger.error(f"Alert worker error: {exc}")

    def __repr__(self) -> str:
        return f"AlertManager(queue_size={self._alert_queue.qsize()})"
