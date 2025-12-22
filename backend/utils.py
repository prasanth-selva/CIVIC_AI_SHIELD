import base64
import io
from typing import List, Tuple

import cv2
import numpy as np

THREAT_LABELS = {
    "fight": "danger",
    "accident": "danger",
    "fall": "warn",
    "harassment": "danger",
    "animal_attack": "danger",
}


def b64_to_frame(b64_string: str) -> np.ndarray:
    """Decode base64 string to OpenCV BGR frame."""
    data = base64.b64decode(b64_string.split(",")[-1])
    arr = np.frombuffer(data, np.uint8)
    frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Unable to decode image")
    return frame


def parse_predictions(results) -> List[Tuple[str, float, Tuple[int, int, int, int]]]:
    parsed = []
    for r in results:
        if not hasattr(r, "boxes"):
            continue
        for box in r.boxes:
            cls_id = int(box.cls[0])
            label = r.names.get(cls_id, "object") if hasattr(r, "names") else "object"
            conf = float(box.conf[0]) if hasattr(box, "conf") else 0.0
            xyxy = box.xyxy[0].tolist() if hasattr(box, "xyxy") else [0, 0, 0, 0]
            parsed.append((label, conf, tuple(map(int, xyxy))))
    return parsed


def threat_level(label: str, confidence: float) -> str:
    level = THREAT_LABELS.get(label, "safe")
    if level == "safe" and confidence > 0.7:
        level = "suspicious"
    return level
