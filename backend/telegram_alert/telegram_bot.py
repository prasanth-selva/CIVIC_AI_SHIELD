"""
Telegram Bot Module
Sends real-time threat alerts via Telegram Bot API
"""

import io
import time
import requests
from datetime import datetime
from typing import Optional, Dict, Any
from pathlib import Path
import logging
import cv2
import numpy as np

from ..config import settings

logger = logging.getLogger(__name__)


class TelegramBot:
    """
    Telegram Bot for sending threat detection alerts
    Supports text messages and image attachments
    """
    
    TELEGRAM_API_BASE = "https://api.telegram.org/bot{token}"
    
    def __init__(
        self,
        bot_token: str = None,
        default_chat_id: str = None,
    ):
        """
        Initialize Telegram bot
        
        Args:
            bot_token: Telegram bot token from @BotFather
            default_chat_id: Default chat ID for alerts
        """
        self.bot_token = bot_token or settings.telegram.bot_token
        self.default_chat_id = default_chat_id or settings.telegram.chat_id
        
        self._base_url = self.TELEGRAM_API_BASE.format(token=self.bot_token)
        self._session = requests.Session()
        
        # Rate limiting
        self._last_message_time = 0.0
        self._message_count_minute = 0
        self._minute_start = time.time()
        
        # Stats
        self._messages_sent = 0
        self._errors = 0
    
    @property
    def is_configured(self) -> bool:
        """Check if bot is properly configured"""
        return bool(self.bot_token and self.default_chat_id)
    
    def test_connection(self) -> Dict[str, Any]:
        """
        Test bot connection and get bot info
        
        Returns:
            Bot info dict or error message
        """
        if not self.bot_token:
            return {"ok": False, "error": "Bot token not configured"}
        
        try:
            response = self._session.get(
                f"{self._base_url}/getMe",
                timeout=10,
            )
            data = response.json()
            
            if data.get("ok"):
                logger.info(f"Telegram bot connected: @{data['result']['username']}")
            else:
                logger.error(f"Telegram bot error: {data.get('description')}")
            
            return data
            
        except Exception as e:
            logger.error(f"Telegram connection test failed: {e}")
            return {"ok": False, "error": str(e)}
    
    def send_message(
        self,
        text: str,
        chat_id: str = None,
        parse_mode: str = "Markdown",
        disable_notification: bool = False,
    ) -> bool:
        """
        Send a text message
        
        Args:
            text: Message text
            chat_id: Target chat ID (uses default if not specified)
            parse_mode: Text formatting (Markdown or HTML)
            disable_notification: Send silently
            
        Returns:
            True if sent successfully
        """
        if not self._check_rate_limit():
            logger.warning("Rate limit exceeded, message not sent")
            return False
        
        target_chat = chat_id or self.default_chat_id
        if not target_chat:
            logger.error("No chat ID specified")
            return False
        
        try:
            response = self._session.post(
                f"{self._base_url}/sendMessage",
                json={
                    "chat_id": target_chat,
                    "text": text,
                    "parse_mode": parse_mode,
                    "disable_notification": disable_notification,
                },
                timeout=10,
            )
            
            data = response.json()
            if data.get("ok"):
                self._messages_sent += 1
                self._update_rate_limit()
                return True
            else:
                logger.error(f"Send message failed: {data.get('description')}")
                self._errors += 1
                return False
                
        except Exception as e:
            logger.error(f"Send message error: {e}")
            self._errors += 1
            return False
    
    def send_photo(
        self,
        image: np.ndarray,
        caption: str = None,
        chat_id: str = None,
    ) -> bool:
        """
        Send an image with optional caption
        
        Args:
            image: OpenCV BGR image (numpy array)
            caption: Image caption
            chat_id: Target chat ID
            
        Returns:
            True if sent successfully
        """
        if not self._check_rate_limit():
            logger.warning("Rate limit exceeded, photo not sent")
            return False
        
        target_chat = chat_id or self.default_chat_id
        if not target_chat:
            logger.error("No chat ID specified")
            return False
        
        try:
            # Encode image to JPEG
            quality = settings.telegram.image_quality
            _, buffer = cv2.imencode('.jpg', image, [cv2.IMWRITE_JPEG_QUALITY, quality])
            image_bytes = io.BytesIO(buffer.tobytes())
            image_bytes.name = 'alert.jpg'
            
            response = self._session.post(
                f"{self._base_url}/sendPhoto",
                data={
                    "chat_id": target_chat,
                    "caption": caption or "",
                    "parse_mode": "Markdown",
                },
                files={
                    "photo": image_bytes,
                },
                timeout=30,
            )
            
            data = response.json()
            if data.get("ok"):
                self._messages_sent += 1
                self._update_rate_limit()
                return True
            else:
                logger.error(f"Send photo failed: {data.get('description')}")
                self._errors += 1
                return False
                
        except Exception as e:
            logger.error(f"Send photo error: {e}")
            self._errors += 1
            return False
    
    def send_alert(
        self,
        threat_type: str,
        severity: str,
        camera_name: str,
        confidence: float,
        timestamp: float = None,
        location: str = None,
        image: np.ndarray = None,
        chat_id: str = None,
    ) -> bool:
        """
        Send a formatted threat alert
        
        Args:
            threat_type: Type of detected threat
            severity: Alert severity level
            camera_name: Camera/source name
            confidence: Detection confidence
            timestamp: Event timestamp (uses current if not provided)
            location: Optional location info
            image: Optional captured frame
            chat_id: Target chat ID
            
        Returns:
            True if sent successfully
        """
        if not settings.telegram.enabled:
            logger.debug("Telegram alerts disabled")
            return False
        
        # Format timestamp
        dt = datetime.fromtimestamp(timestamp or time.time())
        time_str = dt.strftime("%Y-%m-%d %H:%M:%S")
        
        # Build message
        message = settings.telegram.alert_template.format(
            threat_type=threat_type.upper().replace("_", " "),
            severity=severity.upper(),
            camera_name=camera_name,
            timestamp=time_str,
            confidence=confidence,
        )
        
        if location:
            message += f"\n📌 Location: {location}"
        
        # Send with or without image
        if image is not None and settings.telegram.send_image:
            return self.send_photo(image, message, chat_id)
        else:
            return self.send_message(message, chat_id)
    
    def _check_rate_limit(self) -> bool:
        """Check if we're within rate limits"""
        current_time = time.time()
        
        # Reset minute counter
        if current_time - self._minute_start >= 60:
            self._message_count_minute = 0
            self._minute_start = current_time
        
        # Check per-minute limit
        if self._message_count_minute >= settings.telegram.max_alerts_per_minute:
            return False
        
        # Check minimum interval
        if current_time - self._last_message_time < settings.telegram.min_alert_interval:
            return False
        
        return True
    
    def _update_rate_limit(self):
        """Update rate limiting counters"""
        self._last_message_time = time.time()
        self._message_count_minute += 1
    
    @property
    def stats(self) -> Dict[str, Any]:
        """Get bot statistics"""
        return {
            "messages_sent": self._messages_sent,
            "errors": self._errors,
            "is_configured": self.is_configured,
            "rate_limit_remaining": max(
                0,
                settings.telegram.max_alerts_per_minute - self._message_count_minute
            ),
        }


def setup_telegram_bot(
    token: str = None,
    chat_id: str = None,
) -> TelegramBot:
    """
    Factory function to create and configure Telegram bot
    
    Args:
        token: Bot token (or use env var TELEGRAM_BOT_TOKEN)
        chat_id: Chat ID (or use env var TELEGRAM_CHAT_ID)
        
    Returns:
        Configured TelegramBot instance
    """
    bot = TelegramBot(bot_token=token, default_chat_id=chat_id)
    
    if bot.is_configured:
        result = bot.test_connection()
        if result.get("ok"):
            logger.info("Telegram bot ready")
        else:
            logger.warning(f"Telegram bot connection issue: {result.get('error', 'Unknown')}")
    else:
        logger.warning(
            "Telegram bot not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID "
            "environment variables or pass them directly."
        )
    
    return bot


if __name__ == "__main__":
    # Test mode
    import sys
    
    logging.basicConfig(level=logging.INFO)
    
    bot = setup_telegram_bot()
    
    if bot.is_configured:
        print("Sending test message...")
        success = bot.send_message(
            "🧪 *Test Alert*\n\nCivic AI Shield is working correctly!",
        )
        print(f"Test message sent: {success}")
    else:
        print("Bot not configured. Please set environment variables:")
        print("  export TELEGRAM_BOT_TOKEN='your-bot-token'")
        print("  export TELEGRAM_CHAT_ID='your-chat-id'")
        sys.exit(1)
