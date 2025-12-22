from typing import List, Dict, Any
from pathlib import Path
import tempfile
import cv2
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel

from ..model import get_model, ModelNotAvailable
from ..utils import b64_to_frame, parse_predictions, threat_level

router = APIRouter()


class LiveFrameRequest(BaseModel):
    frame_b64: str


class AlertRequest(BaseModel):
    message: str
    chat_id: str | None = None


@router.get("/health")
def health() -> dict:
    return {"status": "running"}


@router.post("/live_frame")
def live_frame(payload: LiveFrameRequest) -> Dict[str, Any]:
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
def analyze_video(file: UploadFile = File(...)) -> Dict[str, Any]:
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
def send_alert(payload: AlertRequest) -> Dict[str, str]:
    # Placeholder: wire your Telegram bot token and chat_id here.
    return {"status": "queued", "message": payload.message, "chat_id": payload.chat_id or "default"}
