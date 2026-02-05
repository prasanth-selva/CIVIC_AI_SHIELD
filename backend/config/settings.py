"""
Civic AI Shield - Configuration Settings
Comprehensive configuration for AI Threat Detection System focused on Women Safety
"""

from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum
import os


class ThreatClass(str, Enum):
    """Supported threat detection classes"""
    VIOLENCE = "violence"
    ASSAULT = "assault"
    FIGHTING = "fighting"
    ROBBERY = "robbery"
    FIRE = "fire"
    ACCIDENT = "accident"
    FALL = "fall"
    HARASSMENT = "harassment"
    SUSPICIOUS = "suspicious_activity"
    WEAPON = "weapon"
    NORMAL = "normal"


class Severity(str, Enum):
    """Alert severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# Threat class to severity mapping
THREAT_SEVERITY: Dict[str, Severity] = {
    ThreatClass.VIOLENCE.value: Severity.CRITICAL,
    ThreatClass.ASSAULT.value: Severity.CRITICAL,
    ThreatClass.FIGHTING.value: Severity.HIGH,
    ThreatClass.ROBBERY.value: Severity.CRITICAL,
    ThreatClass.FIRE.value: Severity.CRITICAL,
    ThreatClass.ACCIDENT.value: Severity.HIGH,
    ThreatClass.FALL.value: Severity.MEDIUM,
    ThreatClass.HARASSMENT.value: Severity.CRITICAL,
    ThreatClass.SUSPICIOUS.value: Severity.MEDIUM,
    ThreatClass.WEAPON.value: Severity.CRITICAL,
    ThreatClass.NORMAL.value: Severity.LOW,
}


@dataclass
class DetectionConfig:
    """Detection module configuration"""
    # Model settings
    model_path: Path = Path(__file__).parent.parent / "models" / "best.pt"
    fallback_model: str = "yolov8n.pt"  # Pretrained fallback
    input_size: int = 640
    
    # Confidence thresholds per class
    confidence_thresholds: Dict[str, float] = field(default_factory=lambda: {
        ThreatClass.VIOLENCE.value: 0.70,
        ThreatClass.ASSAULT.value: 0.75,
        ThreatClass.FIGHTING.value: 0.70,
        ThreatClass.ROBBERY.value: 0.75,
        ThreatClass.FIRE.value: 0.65,
        ThreatClass.ACCIDENT.value: 0.70,
        ThreatClass.FALL.value: 0.65,
        ThreatClass.HARASSMENT.value: 0.70,
        ThreatClass.SUSPICIOUS.value: 0.60,
        ThreatClass.WEAPON.value: 0.75,
    })
    
    # Default threshold for unknown classes
    default_threshold: float = 0.65
    
    # Device detection
    use_gpu: bool = True
    gpu_device: int = 0


@dataclass
class DecisionEngineConfig:
    """Event decision engine configuration"""
    # Number of consecutive frames to confirm threat
    min_consecutive_frames: int = 3
    
    # Time window for detection validation (seconds)
    detection_window: float = 2.0
    
    # Cooldown between alerts for same threat type (seconds)
    alert_cooldown: float = 30.0
    
    # Confidence smoothing factor (0-1)
    smoothing_factor: float = 0.3


@dataclass
class VideoConfig:
    """Video input configuration"""
    # Frame processing
    target_fps: int = 10  # Target frames per second to process
    frame_skip: int = 2   # Skip every N frames for performance
    max_queue_size: int = 30
    
    # Resolution (set to 0 for original)
    resize_width: int = 640
    resize_height: int = 480
    
    # RTSP settings
    rtsp_timeout: int = 5000  # milliseconds
    reconnect_delay: float = 5.0  # seconds


@dataclass
class TelegramConfig:
    """Telegram bot configuration"""
    # Bot credentials (set via environment variables for security)
    bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    chat_id: str = os.getenv("TELEGRAM_CHAT_ID", "")
    
    # Alert settings
    enabled: bool = True
    send_image: bool = True
    image_quality: int = 85  # JPEG quality
    
    # Rate limiting
    min_alert_interval: float = 10.0  # seconds between alerts
    max_alerts_per_minute: int = 6
    
    # Message template
    alert_template: str = """
⚠️ *ALERT: {threat_type}*
🔴 Severity: {severity}
📍 Location: {camera_name}
🕒 Time: {timestamp}
📊 Confidence: {confidence:.1%}
"""


@dataclass
class LoggingConfig:
    """Logging and incident storage configuration"""
    # Database
    db_path: Path = Path(__file__).parent.parent / "logs" / "incidents.db"
    
    # JSON logging
    json_log_path: Path = Path(__file__).parent.parent / "logs" / "alerts.json"
    
    # Retention
    max_incidents: int = 10000
    retention_days: int = 30
    
    # Frame capture
    save_frames: bool = True
    frames_dir: Path = Path(__file__).parent.parent / "logs" / "frames"


@dataclass
class TrainingConfig:
    """Training pipeline configuration"""
    # Roboflow
    roboflow_api_key: str = os.getenv("ROBOFLOW_API_KEY", "")
    roboflow_workspace: str = "women-safety"
    roboflow_project: str = "threat-detection"
    
    # Dataset
    dataset_dir: Path = Path(__file__).parent.parent.parent / "datasets"
    
    # Training parameters
    epochs: int = 100
    batch_size: int = 16
    patience: int = 20
    imgsz: int = 640
    
    # Export
    export_formats: List[str] = field(default_factory=lambda: ["onnx"])


@dataclass
class EdgeOptimizationConfig:
    """Edge device optimization settings"""
    # Quantization
    quantize: bool = False
    quantization_type: str = "int8"  # int8 or fp16
    
    # Model optimization
    use_onnx: bool = False
    use_tensorrt: bool = False
    
    # Performance
    batch_inference: bool = False
    max_batch_size: int = 4
    
    # Low-power mode
    low_power_mode: bool = False
    low_power_fps: int = 5


@dataclass
class Settings:
    """Master settings class combining all configurations"""
    detection: DetectionConfig = field(default_factory=DetectionConfig)
    decision: DecisionEngineConfig = field(default_factory=DecisionEngineConfig)
    video: VideoConfig = field(default_factory=VideoConfig)
    telegram: TelegramConfig = field(default_factory=TelegramConfig)
    logging: LoggingConfig = field(default_factory=LoggingConfig)
    training: TrainingConfig = field(default_factory=TrainingConfig)
    edge: EdgeOptimizationConfig = field(default_factory=EdgeOptimizationConfig)
    
    def __post_init__(self):
        """Ensure directories exist"""
        self.logging.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.logging.frames_dir.mkdir(parents=True, exist_ok=True)
        self.training.dataset_dir.mkdir(parents=True, exist_ok=True)


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get global settings instance"""
    return settings


def get_threat_severity(threat_class: str) -> Severity:
    """Get severity level for a threat class"""
    return THREAT_SEVERITY.get(threat_class, Severity.MEDIUM)


def get_confidence_threshold(threat_class: str) -> float:
    """Get confidence threshold for a threat class"""
    return settings.detection.confidence_thresholds.get(
        threat_class, 
        settings.detection.default_threshold
    )
