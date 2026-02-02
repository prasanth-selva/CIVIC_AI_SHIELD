# Roboflow Dataset Integration Guide
## Civic AI Shield - Public Safety Monitoring System

---

## 📦 Roboflow Dataset Setup (For Real Implementation)

### Step 1: Create Roboflow Account
1. Visit https://roboflow.com
2. Sign up for free account
3. Create new workspace: "Public Safety Surveillance"

### Step 2: Prepare Video Dataset
Collect surveillance footage with labeled anomalies:
- Violence incidents
- Assault/fighting scenes
- Robbery/theft events
- Accidents/collisions
- Falls (elderly care, workplace safety)
- Suspicious activity patterns
- Normal activity (for baseline)

### Step 3: Frame Extraction
Extract frames from videos (Python script):
```python
import cv2
import os

def extract_frames(video_path, output_dir, frame_rate=5):
    """Extract frames from video at specified frame rate"""
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    frame_interval = fps // frame_rate  # Extract 5 frames per second
    
    frame_count = 0
    saved_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % frame_interval == 0:
            output_path = f"{output_dir}/frame_{saved_count:06d}.jpg"
            cv2.imwrite(output_path, frame)
            saved_count += 1
            
        frame_count += 1
    
    cap.release()
    print(f"Extracted {saved_count} frames from {video_path}")

# Usage
extract_frames("surveillance_video.mp4", "./frames", frame_rate=5)
```

### Step 4: Upload to Roboflow
1. Go to Roboflow dashboard
2. Click "Create New Project"
3. Select "Object Detection"
4. Upload extracted frames (drag & drop)

### Step 5: Annotate Images
Use Roboflow's annotation tool:
1. Draw bounding boxes around anomalies
2. Label each box with class:
   - `violence`
   - `assault`
   - `fighting`
   - `robbery`
   - `shooting`
   - `vandalism`
   - `suspicious_activity`
   - `accident`
   - `fall`
   - `crowd_anomaly`
3. Save annotations

### Step 6: Dataset Preprocessing
Apply Roboflow auto-preprocessing:
- **Resize**: 640x640 (YOLOv8 standard)
- **Auto-Orient**: Fix EXIF rotation
- **Augmentations**:
  - Horizontal flip (50% probability)
  - Brightness: -15% to +15%
  - Blur: up to 1.5px
  - Noise: up to 3% of pixels
  - Cutout: 3 boxes, 10% size

### Step 7: Train/Valid/Test Split
- Training: 70%
- Validation: 20%
- Testing: 10%

### Step 8: Generate Dataset Version
1. Click "Generate" in Roboflow
2. Select preprocessing options
3. Click "Generate Version"
4. Export format: **YOLOv8**

### Step 9: Download Dataset
```bash
# Using Roboflow Python SDK
pip install roboflow

# Download script
from roboflow import Roboflow

rf = Roboflow(api_key="YOUR_API_KEY")
project = rf.workspace("your-workspace").project("violence-detection")
dataset = project.version(1).download("yolov8")
```

### Dataset Structure (YOLOv8 Format):
```
violence-detection-1/
│
├── data.yaml               # Dataset configuration
│
├── train/
│   ├── images/
│   │   ├── violence_001.jpg
│   │   ├── violence_002.jpg
│   │   └── ...
│   └── labels/
│       ├── violence_001.txt
│       ├── violence_002.txt
│       └── ...
│
├── valid/
│   ├── images/
│   └── labels/
│
└── test/
    ├── images/
    └── labels/
```

### data.yaml Example:
```yaml
train: ../train/images
val: ../valid/images
test: ../test/images

nc: 10  # Number of classes
names: ['violence', 'assault', 'fighting', 'robbery', 'shooting', 
        'vandalism', 'suspicious_activity', 'accident', 'fall', 'crowd_anomaly']
```

### YOLO Label Format (.txt):
```
# Each line: class_id x_center y_center width height (normalized 0-1)
0 0.456 0.523 0.182 0.215
0 0.678 0.345 0.123 0.198
```

---

## 🤖 Model Training (YOLOv8)

### Step 1: Install Ultralytics
```bash
pip install ultralytics opencv-python
```

### Step 2: Train YOLOv8
```python
from ultralytics import YOLO

# Load pretrained YOLOv8 model
model = YOLO('yolov8n.pt')  # n=nano, s=small, m=medium, l=large, x=xlarge

# Train on custom dataset
results = model.train(
    data='violence-detection-1/data.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    name='violence_detector',
    patience=20,  # Early stopping
    save=True,
    device='0'  # GPU device (use 'cpu' for CPU training)
)

# Validate model
metrics = model.val()
print(f"mAP50: {metrics.box.map50}")
print(f"mAP50-95: {metrics.box.map}")
```

### Step 3: Export Model
```python
# Export to ONNX for deployment
model.export(format='onnx')

# Export to TensorFlow
model.export(format='saved_model')

# Export to TensorRT (for NVIDIA GPUs)
model.export(format='engine', device='0')
```

---

## 🚀 Real-Time Inference (Production)

### Backend API (Flask + YOLOv8):
```python
from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2
import numpy as np

app = Flask(__name__)

# Load trained model
model = YOLO('runs/detect/violence_detector/weights/best.pt')

@app.route('/detect', methods=['POST'])
def detect_anomaly():
    """Real-time detection endpoint"""
    file = request.files['frame']
    img_bytes = file.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Run inference
    results = model.predict(frame, conf=0.75)
    
    # Parse results
    detections = []
    for r in results:
        for box in r.boxes:
            detection = {
                'label': model.names[int(box.cls)],
                'confidence': float(box.conf),
                'bbox': {
                    'x': float(box.xywhn[0][0]),
                    'y': float(box.xywhn[0][1]),
                    'width': float(box.xywhn[0][2]),
                    'height': float(box.xywhn[0][3])
                }
            }
            detections.append(detection)
    
    return jsonify({
        'camera_id': request.form.get('camera_id'),
        'timestamp': datetime.now().isoformat(),
        'detections': detections,
        'status': 'ALERT' if detections else 'SAFE'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### Frontend Integration (WebSocket):
```javascript
// Connect to backend WebSocket
const ws = new WebSocket('ws://localhost:5000/stream');

ws.onmessage = function(event) {
    const detection = JSON.parse(event.data);
    
    // Update camera tile
    updateCameraStatus(detection.camera_id, detection);
    
    // Generate alert if needed
    if (detection.status === 'ALERT') {
        generateAIAlert(detection);
    }
};

// Send video frame for detection
function sendFrameForDetection(cameraId, frameBlob) {
    const formData = new FormData();
    formData.append('camera_id', cameraId);
    formData.append('frame', frameBlob);
    
    fetch('http://localhost:5000/detect', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        updateCameraStatus(cameraId, data);
    });
}
```

---

## 📊 Performance Optimization

### GPU Acceleration (CUDA):
```python
# Check CUDA availability
import torch
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"GPU count: {torch.cuda.device_count()}")
print(f"GPU name: {torch.cuda.get_device_name(0)}")

# Train with GPU
model.train(data='data.yaml', epochs=100, device='0')
```

### Batch Processing:
```python
# Process multiple frames simultaneously
frames = [frame1, frame2, frame3, frame4]
results = model.predict(frames, batch=4)
```

### Model Optimization:
```python
# Use smaller model for speed
model = YOLO('yolov8n.pt')  # Nano = fastest

# Reduce image size
results = model.predict(frame, imgsz=320)  # Smaller than 640

# Increase confidence threshold (fewer detections)
results = model.predict(frame, conf=0.85)
```

---

## 🎯 Current Demo vs Real Production

| Feature | Current Demo | Real Production |
|---------|-------------|-----------------|
| **Model** | JavaScript simulation | YOLOv8 on GPU server |
| **Dataset** | Conceptual Roboflow | Actual Roboflow export |
| **Video** | Simulated feeds | RTSP/WebRTC streams |
| **Inference** | Random detections | Real-time YOLOv8 |
| **Backend** | None (browser-only) | Flask/FastAPI + Redis |
| **Database** | None | PostgreSQL + TimescaleDB |
| **Deployment** | Single HTML file | Docker + Kubernetes |
| **Latency** | N/A | < 100ms per frame |

---

## 🔧 Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React/Vue)                    │
│  • Dashboard UI                                              │
│  • WebSocket connection                                      │
│  • Real-time alerts                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY (NGINX)                        │
│  • Load balancing                                            │
│  • TLS termination                                           │
│  • Rate limiting                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND CLUSTER (Flask + Gunicorn)              │
│  • /detect endpoint (REST)                                   │
│  • /stream WebSocket                                         │
│  • Authentication & authorization                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            AI INFERENCE WORKERS (GPU Nodes)                  │
│  • YOLOv8 model loading                                      │
│  • CUDA acceleration                                         │
│  • Batch processing                                          │
│  • TensorRT optimization                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              VIDEO PROCESSING PIPELINE                       │
│  • RTSP stream ingestion                                     │
│  • Frame extraction (5 FPS)                                  │
│  • Frame buffering (Redis)                                   │
│  • Detection result caching                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                             │
│  • PostgreSQL (alerts, users, cameras)                       │
│  • TimescaleDB (time-series metrics)                         │
│  • MongoDB (video metadata, logs)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Scaling Strategies

### Horizontal Scaling:
- Deploy multiple inference workers
- Use Kubernetes for auto-scaling
- Load balance across GPU nodes

### Vertical Scaling:
- Upgrade to NVIDIA A100/H100 GPUs
- Increase batch size
- Use TensorRT for 3-5x speedup

### Caching:
- Cache detections in Redis (TTL: 5s)
- Deduplicate similar frames
- Pre-compute confidence thresholds

---

## 🎓 Training Tips

### Data Quality:
- Minimum 1000 images per class
- Balanced dataset (equal class distribution)
- Diverse lighting conditions
- Multiple camera angles

### Hyperparameter Tuning:
```python
model.train(
    data='data.yaml',
    epochs=100,
    batch=32,           # Larger batch = faster, needs more VRAM
    lr0=0.01,          # Initial learning rate
    lrf=0.01,          # Final learning rate
    momentum=0.937,
    weight_decay=0.0005,
    warmup_epochs=3,
    box=0.05,          # Box loss gain
    cls=0.5,           # Class loss gain
    mosaic=1.0,        # Mosaic augmentation
    mixup=0.1          # Mixup augmentation
)
```

### Transfer Learning:
Start with pretrained weights:
- `yolov8n.pt` - Nano (3.2M params)
- `yolov8s.pt` - Small (11.2M params)
- `yolov8m.pt` - Medium (25.9M params)
- `yolov8l.pt` - Large (43.7M params)
- `yolov8x.pt` - XLarge (68.2M params)

---

## ✅ Integration Checklist

- [ ] Roboflow account created
- [ ] Dataset uploaded & annotated
- [ ] Preprocessing applied
- [ ] Model trained (mAP > 0.85)
- [ ] Model exported (ONNX/TensorRT)
- [ ] Backend API deployed
- [ ] Frontend connected to WebSocket
- [ ] GPU inference tested
- [ ] Latency < 100ms verified
- [ ] Demo mode functional
- [ ] Explainability implemented
- [ ] Security measures applied

---

## 🆘 Troubleshooting

### Issue: Low mAP (< 0.70)
**Solutions**:
- Add more training data
- Increase epochs (200+)
- Use larger model (yolov8m/l/x)
- Check annotation quality
- Balance dataset classes

### Issue: Slow inference (> 200ms)
**Solutions**:
- Use smaller model (yolov8n/s)
- Reduce image size (320x320)
- Enable TensorRT
- Use GPU instead of CPU
- Batch multiple frames

### Issue: High false positives
**Solutions**:
- Increase confidence threshold (0.85+)
- Add more negative examples (normal activity)
- Implement temporal smoothing
- Use ensemble models

---

**End of Guide**

For questions: Refer to Roboflow documentation (https://docs.roboflow.com) or Ultralytics YOLOv8 docs (https://docs.ultralytics.com)
