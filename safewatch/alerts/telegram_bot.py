"""
SafeWatch — SafeWatchTelegramBot
Async Telegram bot using python-telegram-bot v20+ with retry and rate limiting.
"""
from __future__ import annotations

import asyncio
import io
import os
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

from loguru import logger

try:
    from telegram import Bot
    from telegram.error import TelegramError
    _TG_AVAILABLE = True
except ImportError:
    _TG_AVAILABLE = False
    logger.warning("python-telegram-bot not installed. Alerts will be logged only.")

from threats.threat_event import ThreatEvent


class SafeWatchTelegramBot:
    """Async Telegram bot for SafeWatch threat alerts."""

    _RATE_LIMIT_DELAY: float = 0.034   # ~30 msg/sec max

    def __init__(self, config: Dict[str, Any]) -> None:
        self._cfg = config
        self._enabled = config.get("enabled", False) and _TG_AVAILABLE
        token = os.environ.get("TELEGRAM_BOT_TOKEN", config.get("bot_token", ""))
        self._bot: Optional[Any] = None
        self._agents: Dict[str, Dict[str, Any]] = config.get("agents", {})
        self._max_retries: int = config.get("max_retries", 3)
        self._last_send: float = 0.0

        if self._enabled and token:
            try:
                self._bot = Bot(token=token)
                logger.info("TelegramBot initialised.")
            except Exception as exc:
                logger.error(f"TelegramBot init failed: {exc}")
                self._enabled = False
        else:
            logger.warning("TelegramBot disabled (missing token or library).")

    # ─────────────────────────── public API ─────────────────────────

    async def send_threat_alert(
        self,
        threat_event: ThreatEvent,
        camera_id: str,
        camera_name: str,
        snapshot: Optional[bytes],
        agent_id: str,
    ) -> bool:
        if not self._enabled or self._bot is None:
            self._log_alert(threat_event, camera_id, agent_id)
            return False

        agent = self._agents.get(agent_id)
        if agent is None:
            logger.warning(f"Unknown agent_id: {agent_id}")
            return False

        chat_id = os.environ.get(
            f"TELEGRAM_CHAT_ID_{agent_id.upper()}",
            agent.get("chat_id", ""),
        )
        if not chat_id:
            logger.warning(f"No chat_id for agent {agent_id}")
            return False

        ts_str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        text = (
            "🚨 *SAFEWATCH ALERT*\n"
            "━━━━━━━━━━━━━━━━━━\n"
            f"⚠️ *Threat:* {threat_event.threat_type.replace('_',' ').title()}\n"
            f"📍 *Camera:* {camera_name} ({camera_id})\n"
            f"🕐 *Time:* {ts_str}\n"
            f"📊 *Confidence:* {threat_event.confidence:.0%}\n"
            f"🔴 *Severity:* {threat_event.severity}\n"
            f"👥 *Persons:* {len(threat_event.persons_involved)}\n"
            f"📝 *Details:* {threat_event.description}\n"
            "━━━━━━━━━━━━━━━━━━"
        )

        for attempt in range(self._max_retries):
            try:
                await self._rate_limit()
                if snapshot and self._cfg.get("send_snapshot", True):
                    await self._bot.send_photo(
                        chat_id=chat_id,
                        photo=io.BytesIO(snapshot),
                        caption=text,
                        parse_mode="Markdown",
                    )
                else:
                    await self._bot.send_message(
                        chat_id=chat_id,
                        text=text,
                        parse_mode="Markdown",
                    )
                logger.info(f"Alert sent to {agent_id} for {threat_event.threat_type}")
                return True
            except Exception as exc:
                wait = 2 ** attempt
                logger.warning(f"Telegram send attempt {attempt+1} failed: {exc}. Retry in {wait}s")
                await asyncio.sleep(wait)

        logger.error(f"Failed to send alert after {self._max_retries} retries.")
        return False

    async def send_system_alert(self, message: str, all_agents: bool = True) -> None:
        if not self._enabled or self._bot is None:
            logger.info(f"[SYSTEM ALERT] {message}")
            return
        targets = list(self._agents.keys()) if all_agents else []
        for agent_id in targets:
            agent = self._agents[agent_id]
            chat_id = os.environ.get(
                f"TELEGRAM_CHAT_ID_{agent_id.upper()}",
                agent.get("chat_id", ""),
            )
            if chat_id:
                try:
                    await self._rate_limit()
                    await self._bot.send_message(chat_id=chat_id, text=f"ℹ️ *SafeWatch System*\n{message}", parse_mode="Markdown")
                except Exception as exc:
                    logger.warning(f"System alert send failed: {exc}")

    async def send_daily_summary(self, stats: Dict[str, Any], agent_id: str) -> None:
        if not self._enabled or self._bot is None:
            return
        agent = self._agents.get(agent_id, {})
        chat_id = os.environ.get(
            f"TELEGRAM_CHAT_ID_{agent_id.upper()}",
            agent.get("chat_id", ""),
        )
        if not chat_id:
            return

        lines = ["📊 *SafeWatch Daily Summary*\n━━━━━━━━━━━━━━━━━━"]
        for k, v in stats.items():
            lines.append(f"• {k}: {v}")
        text = "\n".join(lines)
        try:
            await self._rate_limit()
            await self._bot.send_message(chat_id=chat_id, text=text, parse_mode="Markdown")
        except Exception as exc:
            logger.warning(f"Daily summary failed: {exc}")

    async def test_connection(self) -> bool:
        if not self._enabled or self._bot is None:
            return False
        try:
            me = await self._bot.get_me()
            logger.success(f"Telegram bot connected: @{me.username}")
            return True
        except Exception as exc:
            logger.error(f"Telegram connection test failed: {exc}")
            return False

    # ─────────────────────────── helpers ────────────────────────────

    async def _rate_limit(self) -> None:
        now = time.time()
        wait = self._RATE_LIMIT_DELAY - (now - self._last_send)
        if wait > 0:
            await asyncio.sleep(wait)
        self._last_send = time.time()

    def _log_alert(self, threat: ThreatEvent, camera_id: str, agent_id: str) -> None:
        logger.warning(
            f"[TELEGRAM DISABLED] Alert: {threat.threat_type} | "
            f"cam={camera_id} | agent={agent_id} | sev={threat.severity}"
        )

    def __repr__(self) -> str:
        return f"SafeWatchTelegramBot(enabled={self._enabled})"
