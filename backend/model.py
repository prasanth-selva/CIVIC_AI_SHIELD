from pathlib import Path
from functools import lru_cache
from typing import Optional

try:
    from ultralytics import YOLO
except Exception as exc:  # pragma: no cover
    YOLO = None  # type: ignore
    _import_error = exc
else:
    _import_error = None

MODEL_PATH = Path(__file__).parent / "models" / "best.pt"


class ModelNotAvailable(RuntimeError):
    pass


@lru_cache(maxsize=1)
def get_model() -> "YOLO":
    if YOLO is None:
        raise ModelNotAvailable(
            f"ultralytics not available: {_import_error}. Install with `pip install ultralytics`."
        )
    if not MODEL_PATH.exists():
        raise ModelNotAvailable(f"Model file missing at {MODEL_PATH}")
    return YOLO(str(MODEL_PATH))
