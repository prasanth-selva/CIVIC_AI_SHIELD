# Civic AI Shield - Web Application

A modern, real-time threat detection web app for CCTV and live camera monitoring using AI.

## 📁 Project Structure

```
CIVIC_AI_SHIELD/
├── index.html          # Main HTML structure
├── style.css           # Modern UI styling (dark theme, neon accents)
├── app.js              # Frontend logic with API integration
├── api.js              # API service layer (fetch wrapper)
├── backend/            # FastAPI backend (see backend/README.md)
│   ├── main.py
│   ├── model.py
│   ├── utils.py
│   ├── routes/api.py
│   └── models/best.pt  # (place your YOLO model here)
└── README.md
```

## 🚀 Quick Start

### Frontend Only (Static)

```bash
# Option 1: Python simple server
cd /home/prasanth/Desktop/CIVIC_AI_SHIELD
python3 -m http.server 5500

# Option 2: VS Code Live Server
# Install extension: Live Server
# Right-click index.html → Open with Live Server
```

Then open: `http://localhost:5500`

### Full Stack (Frontend + Backend)

1. **Start Backend** (in separate terminal):
```bash
cd /home/prasanth/Desktop/CIVIC_AI_SHIELD/backend
pip install fastapi uvicorn[standard] ultralytics opencv-python pillow python-multipart
python -m uvicorn main:app --reload --port 8000
```

2. **Start Frontend** (in another terminal):
```bash
cd /home/prasanth/Desktop/CIVIC_AI_SHIELD
python3 -m http.server 5500
```

3. **Open in Browser**:
```
http://localhost:5500
```

## 🔗 API Integration

The app connects to the backend at:
```javascript
const API_BASE = "https://227602680d90.ngrok-free.app";
```

### API Service Functions (api.js)

```javascript
import { checkHealth, uploadVideo, sendLiveFrame } from './api.js';

// Health check
await checkHealth() → { status: "running" }

// Upload video for batch analysis
await uploadVideo(file) → { count: N, detections: [...] }

// Send live webcam frame for real-time detection
await sendLiveFrame(base64Image) → { label, threat_level, confidence, boxes }
```

## 🎯 Features Implemented

✅ **Home Dashboard**
- Quick stats (threats count, last alert, system status)
- Live preview with simulated detection
- Hero CTA buttons

✅ **Live Detection Page**
- Real-time webcam access via `getUserMedia()`
- Frame capture every 1 second
- Base64 encoding → backend POST
- Live status indicator (Safe / Suspicious / Threat)
- Real-time threat feed
- Telegram alert toggle

✅ **Video Upload Page**
- Drag-and-drop file upload
- FormData multipart upload to backend
- Progress bar
- Video preview with overlay
- Detections timeline
- High-threat alert banner (red alert at top)

✅ **Alerts & History Page**
- Past detections list
- Camera source, threat type, severity

✅ **UI/UX**
- Mobile responsive
- Dark mode + neon green/blue theme
- Smooth animations + pulse indicators
- Toast notifications
- High-contrast colors
- Accessibility features

## 🛠️ Customization

### Change Backend URL

Edit `api.js`:
```javascript
const API_BASE = "https://your-backend-url.com";
```

### Update Threat Labels

Edit `app.js` in `mapThreatLevel()`:
```javascript
const threatLabels = ['fight', 'accident', 'fall', 'weapon', ...];
```

### Toggle Features

- **Telegram alerts**: Checkbox on Live Detection page (wired to `/send_alert`)
- **Audio alarm**: Checkbox on Live Detection page
- **Dark mode**: Button in top navbar

## 📊 Data Flow

```
Frontend (Browser)
    ↓
Video Frame / Upload File
    ↓
api.js (fetch wrapper)
    ↓
Backend API (FastAPI)
    ↓
YOLO Model (models/best.pt)
    ↓
JSON Response (label, confidence, threat_level)
    ↓
app.js (update UI, show alerts)
```

## 🔐 Security Notes

- CORS is enabled on backend for localhost + ngrok origin
- Frontend validates API responses
- Error handling with user-friendly toasts
- Frames are sent base64 (no file uploads for live mode)

## 🐛 Troubleshooting

### "Camera access denied"
- Check browser permissions
- Ensure HTTPS or localhost

### "Backend unavailable"
- Verify ngrok URL is correct in api.js
- Check backend is running

### "Video upload fails"
- File size limits depend on backend config
- Use common formats: MP4, WebM, MOV

### Module not found errors
- Use `python3 -m http.server` (not `python` alone)
- Ensure serving from project root

## 📝 Next Steps

1. Train/download a YOLO model → place at `backend/models/best.pt`
2. Test with sample video or webcam
3. Wire Telegram bot token in `/send_alert`
4. Deploy backend to production (Railway, Render, AWS, etc.)
5. Update API_BASE with production URL

---

**Built for hackathon judges & smart city deployments** 🏆
