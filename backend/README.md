# Civic AI Shield - Backend

Real-time AI Threat Detection System for Women Safety.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Telegram bot token and chat ID
```

### 3. Start the Server
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Or:
```bash
python -m backend.main
```

### 4. API Documentation
Open http://localhost:8000/docs for interactive API docs.

---

## 📂 Project Structure

```
backend/
├── config/                 # Configuration management
│   ├── settings.py         # All settings and thresholds
│   └── __init__.py
├── inference/              # Detection pipeline
│   ├── video_input.py      # Webcam/RTSP/file capture
│   ├── preprocessor.py     # Frame preprocessing
│   ├── detector.py         # YOLOv8 threat detection
│   ├── decision_engine.py  # Alert triggering logic
│   ├── realtime_detector.py # Main detection pipeline
│   └── gesture_detector.py # Safety gesture detection
├── telegram_alert/         # Telegram integration
│   ├── telegram_bot.py     # Bot API wrapper
│   └── alert_manager.py    # Alert queue management
├── training/               # Model training
│   ├── roboflow_client.py  # Dataset management
│   ├── train.py            # Training pipeline
│   └── export_model.py     # ONNX/TensorRT export
├── utils/                  # Utilities
│   ├── incident_logger.py  # SQLite incident storage
│   └── system_monitor.py   # Resource monitoring
├── routes/                 # API endpoints
│   ├── api.py              # Main API routes
│   └── auth.py             # Authentication
├── main.py                 # FastAPI application
└── requirements.txt        # Dependencies
```

---

## 🔧 Configuration

All settings are in `config/settings.py`. Key configurations:

| Setting | Default | Description |
|---------|---------|-------------|
| `model_path` | `models/best.pt` | YOLO model path |
| `use_gpu` | `True` | Enable GPU inference |
| `confidence_threshold` | Class-specific | Detection thresholds |
| `min_consecutive_frames` | `3` | Frames before alerting |
| `alert_cooldown` | `60s` | Seconds between alerts |

---

## 📡 API Endpoints

### Detection
- `POST /api/live_frame` - Analyze single frame
- `POST /api/analyze_video` - Analyze video file

### Alerts
- `GET /api/alerts` - List alerts
- `GET /api/alerts/stats` - Alert statistics
- `POST /api/alerts` - Create manual alert

### Telegram
- `GET /api/telegram/status` - Bot status
- `POST /api/telegram/test` - Send test message
- `POST /api/telegram/configure` - Configure bot

### System
- `GET /api/health` - System health
- `GET /api/system/info` - Detailed system info
- `GET /api/cameras` - List cameras

---

## 🎯 Real-Time Detection

### Command Line
```bash
python -m backend.inference.realtime_detector \
    --source 0 \
    --name "Front Camera" \
    --display
```

Options:
- `--source`: Video source (0 for webcam, RTSP URL, or file)
- `--name`: Camera name for alerts
- `--display`: Show visualization window
- `--model`: Custom model path

### In Code
```python
from backend.inference.realtime_detector import RealtimeDetector

detector = RealtimeDetector(
    source=0,
    source_name="Lobby Camera",
    camera_id="cam-001",
)
detector.run()
```

---

## 🏋️ Training

### With Roboflow Dataset
```python
from backend.training.train import train_from_roboflow

best_model = train_from_roboflow(
    api_key="your-api-key",
    workspace="your-workspace",
    project="your-project",
    version=1,
    epochs=100,
)
```

### With Local Dataset
```bash
python -m backend.training.train \
    --data path/to/data.yaml \
    --epochs 100 \
    --batch 16
```

### Export for Edge
```bash
python -m backend.training.export_model \
    models/best.pt \
    --format onnx \
    --fp16
```

---

## 📱 Telegram Setup

1. Create a bot with @BotFather on Telegram
2. Get your chat ID from @userinfobot
3. Set environment variables:
   ```bash
   export TELEGRAM_BOT_TOKEN="your-token"
   export TELEGRAM_CHAT_ID="your-chat-id"
   ```

---

## 🔬 Threat Classes

| Class | Severity | Default Threshold |
|-------|----------|-------------------|
| Violence | Critical | 70% |
| Assault | Critical | 70% |
| Fire | Critical | 80% |
| Robbery | High | 65% |
| Harassment | High | 70% |
| Weapon | Critical | 75% |
| Suspicious Activity | Medium | 55% |
| Accident | High | 65% |

---

## 📊 System Requirements

### Minimum
- Python 3.9+
- 4GB RAM
- CPU with AVX2 support

### Recommended (for real-time)
- NVIDIA GPU (GTX 1060+)
- 8GB+ RAM
- CUDA 11.x

### Edge Devices
- Raspberry Pi 4 (4GB) - with quantized model
- NVIDIA Jetson Nano - with TensorRT
- Intel NUC - with OpenVINO
