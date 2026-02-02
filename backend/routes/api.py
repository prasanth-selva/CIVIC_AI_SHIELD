from typing import List, Dict, Any, Optional, Literal
from datetime import datetime, timezone
from pathlib import Path
import tempfile
import cv2
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from pydantic import BaseModel

from ..model import get_model, ModelNotAvailable
from ..utils import b64_to_frame, parse_predictions, threat_level
from ..auth import require_roles, UserPublic

router = APIRouter()

Severity = Literal["low", "medium", "high", "critical"]
AlertStatus = Literal["open", "acknowledged", "resolved"]
CameraStatus = Literal["online", "offline", "degraded", "maintenance"]


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


MOCK_CAMERAS: Dict[str, Dict[str, Any]] = {
    "cam-001": {
        "id": "cam-001",
        "name": "Civic Center - North Gate",
        "location": "Sector A / North Gate",
        "status": "online",
        "last_seen": _utc_now_iso(),
        "stream_url": "rtsp://mock.civic-ai-shield.local/cam-001",
        "health": {"latency_ms": 42, "packet_loss": 0.2},
    },
    "cam-002": {
        "id": "cam-002",
        "name": "Transit Hub - Platform 3",
        "location": "Sector C / Platform 3",
        "status": "degraded",
        "last_seen": _utc_now_iso(),
        "stream_url": "rtsp://mock.civic-ai-shield.local/cam-002",
        "health": {"latency_ms": 180, "packet_loss": 2.6},
    },
    "cam-003": {
        "id": "cam-003",
        "name": "Harbor Watch - Pier 7",
        "location": "Sector D / Pier 7",
        "status": "offline",
        "last_seen": _utc_now_iso(),
        "stream_url": "rtsp://mock.civic-ai-shield.local/cam-003",
        "health": {"latency_ms": None, "packet_loss": None},
    },
}


MOCK_ALERTS: Dict[str, Dict[str, Any]] = {
    "alt-1001": {
        "id": "alt-1001",
        "camera_id": "cam-001",
        "type": "unauthorized_access",
        "severity": "high",
        "status": "open",
        "confidence": 0.91,
        "message": "Unauthorized access detected near North Gate.",
        "created_at": _utc_now_iso(),
        "updated_at": _utc_now_iso(),
    },
    "alt-1002": {
        "id": "alt-1002",
        "camera_id": "cam-002",
        "type": "fight",
        "severity": "critical",
        "status": "acknowledged",
        "confidence": 0.95,
        "message": "Physical altercation detected on Platform 3.",
        "created_at": _utc_now_iso(),
        "updated_at": _utc_now_iso(),
    },
    "alt-1003": {
        "id": "alt-1003",
        "camera_id": "cam-003",
        "type": "camera_offline",
        "severity": "medium",
        "status": "open",
        "confidence": 0.5,
        "message": "Camera heartbeat lost at Pier 7.",
        "created_at": _utc_now_iso(),
        "updated_at": _utc_now_iso(),
    },
}


class LiveFrameRequest(BaseModel):
    frame_b64: str


class AlertRequest(BaseModel):
    message: str
    chat_id: str | None = None


class AlertCreateRequest(BaseModel):
    camera_id: str
    type: str
    severity: Severity
    message: str
    confidence: float = 0.0


class AlertUpdateRequest(BaseModel):
    status: AlertStatus
    message: Optional[str] = None


class CameraUpdateRequest(BaseModel):
    status: CameraStatus
    last_seen: Optional[str] = None


@router.get("/health")
def health(current_user: UserPublic = Depends(require_roles("ADMIN", "OPERATOR", "VIEWER"))) -> dict:
    total_cameras = len(MOCK_CAMERAS)
    online_cameras = sum(1 for cam in MOCK_CAMERAS.values() if cam["status"] == "online")
    open_alerts = sum(1 for alert in MOCK_ALERTS.values() if alert["status"] == "open")
    return {
        "status": "running",
        "service": "Civic AI Shield",
        "version": "1.0.0-mock",
        "timestamp": _utc_now_iso(),
        "system": {
            "cameras_total": total_cameras,
            "cameras_online": online_cameras,
            "alerts_open": open_alerts,
        },
    }


@router.get("/cameras")
def list_cameras(
    status: Optional[CameraStatus] = None,
    current_user: UserPublic = Depends(require_roles("ADMIN", "OPERATOR", "VIEWER")),
) -> Dict[str, Any]:
    cameras = list(MOCK_CAMERAS.values())
    if status:
        cameras = [cam for cam in cameras if cam["status"] == status]
    return {"count": len(cameras), "cameras": cameras}


@router.get("/cameras/{camera_id}")
def get_camera(
    camera_id: str,
    current_user: UserPublic = Depends(require_roles("ADMIN", "OPERATOR", "VIEWER")),
) -> Dict[str, Any]:
    camera = MOCK_CAMERAS.get(camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera


@router.post("/cameras/{camera_id}/status")
def update_camera_status(
    camera_id: str,
    payload: CameraUpdateRequest,
    current_user: UserPublic = Depends(require_roles("ADMIN", "OPERATOR")),
) -> Dict[str, Any]:
    camera = MOCK_CAMERAS.get(camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    camera["status"] = payload.status
    camera["last_seen"] = payload.last_seen or _utc_now_iso()
    return {"status": "updated", "camera": camera}


@router.get("/alerts")
def list_alerts(
    status: Optional[AlertStatus] = None,
    severity: Optional[Severity] = None,
    camera_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: UserPublic = Depends(require_roles("ADMIN", "OPERATOR", "VIEWER")),
) -> Dict[str, Any]:
    alerts = list(MOCK_ALERTS.values())
    if status:
        alerts = [alert for alert in alerts if alert["status"] == status]
    if severity:
        alerts = [alert for alert in alerts if alert["severity"] == severity]
    if camera_id:
        alerts = [alert for alert in alerts if alert["camera_id"] == camera_id]
    alerts = alerts[offset : offset + limit]
    return {"count": len(alerts), "alerts": alerts}


@router.get("/alerts/{alert_id}")
def get_alert(
    alert_id: str,
    current_user: UserPublic = Depends(require_roles("ADMIN", "OPERATOR", "VIEWER")),
) -> Dict[str, Any]:
    alert = MOCK_ALERTS.get(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.post("/alerts")
def create_alert(
    payload: AlertCreateRequest,
    current_user: UserPublic = Depends(require_roles("ADMIN", "OPERATOR")),
) -> Dict[str, Any]:
    if payload.camera_id not in MOCK_CAMERAS:
        raise HTTPException(status_code=404, detail="Camera not found")
    alert_id = f"alt-{1000 + len(MOCK_ALERTS) + 1}"
    now = _utc_now_iso()
    alert = {
        "id": alert_id,
        "camera_id": payload.camera_id,
        "type": payload.type,
        "severity": payload.severity,
        "status": "open",
        "confidence": round(payload.confidence, 3),
        "message": payload.message,
        "created_at": now,
        "updated_at": now,
    }
    MOCK_ALERTS[alert_id] = alert
    return {"status": "created", "alert": alert}


@router.patch("/alerts/{alert_id}")
def update_alert(
    alert_id: str,
    payload: AlertUpdateRequest,
    current_user: UserPublic = Depends(require_roles("ADMIN", "OPERATOR")),
) -> Dict[str, Any]:
    alert = MOCK_ALERTS.get(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert["status"] = payload.status
    if payload.message is not None:
        alert["message"] = payload.message
    alert["updated_at"] = _utc_now_iso()
    return {"status": "updated", "alert": alert}


@router.post("/live_frame")
def live_frame(
    payload: LiveFrameRequest,
    current_user: UserPublic = Depends(require_roles("ADMIN", "OPERATOR")),
) -> Dict[str, Any]:
    try:
        model = get_model()
    except ModelNotAvailable as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc))

    frame = b64_to_frame(payload.frame_b64)
    results = model.predict(frame, verbose=False)
    parsed = parse_predictions(results)
    if not parsed:
        return {"label": "none", "threat_level": "safe", "confidence": 0.0, "boxes": []}

    label, conf, box = max(parsed, key=lambda x: x[1])
    return {
        "label": label,
        "threat_level": threat_level(label, conf),
        "confidence": round(conf, 3),
        "boxes": [box for _, _, box in parsed],
    }


@router.post("/analyze_video")
def analyze_video(
    file: UploadFile = File(...),
    current_user: UserPublic = Depends(require_roles("ADMIN", "OPERATOR")),
) -> Dict[str, Any]:
    try:
        model = get_model()
    except ModelNotAvailable as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc))

    with tempfile.NamedTemporaryFile(delete=True, suffix=Path(file.filename or "video.mp4").suffix) as tmp:
        content = file.file.read()
        tmp.write(content)
        tmp.flush()
        cap = cv2.VideoCapture(tmp.name)

    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    frame_id = 0
    detections: List[Dict[str, Any]] = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_id % max(int(fps // 2), 1) != 0:  # sample ~2 fps to keep it light
            frame_id += 1
            continue
        results = model.predict(frame, verbose=False)
        parsed = parse_predictions(results)
        for label, conf, _ in parsed:
            detections.append(
                {
                    "timestamp": round(frame_id / fps, 2),
                    "label": label,
                    "threat_level": threat_level(label, conf),
                    "confidence": round(conf, 3),
                }
            )
        frame_id += 1

    cap.release()
    return {"count": len(detections), "detections": detections}


@router.post("/send_alert")
def send_alert(
    payload: AlertRequest,
    current_user: UserPublic = Depends(require_roles("ADMIN", "OPERATOR")),
) -> Dict[str, str]:
    # Placeholder: wire your Telegram bot token and chat_id here.
    return {"status": "queued", "message": payload.message, "chat_id": payload.chat_id or "default"}
