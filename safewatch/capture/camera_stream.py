"""
SafeWatch — CameraStream
Thread-safe, auto-reconnecting camera stream using OpenCV + queue buffering.
"""

from __future__ import annotations

import queue
import threading
import time
from pathlib import Path
from typing import Optional, Tuple, Union

import cv2
from loguru import logger


class CameraStream:
    """
    Wraps cv2.VideoCapture in a background thread with a bounded frame queue.
    Supports USB webcams (int index) and RTSP/HTTP URLs (string).
    Auto-reconnects on stream drop every 5 seconds.
    """

    _RECONNECT_DELAY: float = 5.0
    _QUEUE_MAXSIZE: int = 128

    def __init__(
        self,
        source: Union[int, str],
        camera_id: str = "CAM-00",
        resolution: Tuple[int, int] = (640, 480),
        fps_target: int = 15,
    ) -> None:
        self.source = source
        self.camera_id = camera_id
        self.resolution = resolution
        self.fps_target = fps_target

        self._cap: Optional[cv2.VideoCapture] = None
        self._queue: queue.Queue = queue.Queue(maxsize=self._QUEUE_MAXSIZE)
        self._thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._running = False
        self._connected = False
        self._lock = threading.Lock()

        # FPS tracking
        self._frame_count: int = 0
        self._fps_start: float = time.time()
        self._current_fps: float = 0.0

        logger.info(f"[{self.camera_id}] CameraStream created | source={source}")

    # ─────────────────────────── public API ─────────────────────────

    def start(self) -> "CameraStream":
        """Start the background capture thread."""
        if self._running:
            return self
        self._stop_event.clear()
        self._running = True
        self._thread = threading.Thread(
            target=self._capture_loop,
            name=f"cam-{self.camera_id}",
            daemon=True,
        )
        self._thread.start()
        logger.info(f"[{self.camera_id}] Capture thread started.")
        return self

    def stop(self) -> None:
        """Signal the capture thread to stop and release resources."""
        self._stop_event.set()
        self._running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=5.0)
        self._release_cap()
        logger.info(f"[{self.camera_id}] CameraStream stopped.")

    def read(self) -> Optional[any]:
        """
        Return the most-recent frame (numpy ndarray) or None if not available.
        Drains the queue to always return the freshest frame.
        """
        frame = None
        try:
            while True:
                frame = self._queue.get_nowait()
        except queue.Empty:
            pass
        return frame

    def is_running(self) -> bool:
        return self._running and not self._stop_event.is_set()

    def is_connected(self) -> bool:
        return self._connected

    def get_fps(self) -> float:
        return round(self._current_fps, 2)

    # ─────────────────────────── internals ──────────────────────────

    def _open_capture(self) -> bool:
        """Attempt to open the VideoCapture. Returns True on success."""
        self._release_cap()
        try:
            if isinstance(self.source, int):
                cap = cv2.VideoCapture(self.source, cv2.CAP_V4L2)
            else:
                cap = cv2.VideoCapture(self.source)

            if not cap.isOpened():
                logger.warning(f"[{self.camera_id}] Cannot open source: {self.source}")
                return False

            cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.resolution[0])
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.resolution[1])
            cap.set(cv2.CAP_PROP_FPS, self.fps_target)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

            with self._lock:
                self._cap = cap
                self._connected = True

            logger.success(f"[{self.camera_id}] Connected to {self.source}")
            return True
        except Exception as exc:
            logger.error(f"[{self.camera_id}] Open error: {exc}")
            return False

    def _release_cap(self) -> None:
        with self._lock:
            if self._cap is not None:
                try:
                    self._cap.release()
                except Exception:
                    pass
                self._cap = None
            self._connected = False

    def _capture_loop(self) -> None:
        """Main background loop: read frames and push to queue."""
        while not self._stop_event.is_set():
            if not self._connected:
                success = self._open_capture()
                if not success:
                    logger.info(
                        f"[{self.camera_id}] Retrying in {self._RECONNECT_DELAY}s…"
                    )
                    time.sleep(self._RECONNECT_DELAY)
                    continue

            with self._lock:
                cap = self._cap

            if cap is None:
                time.sleep(0.1)
                continue

            ret, frame = cap.read()
            if not ret or frame is None:
                logger.warning(f"[{self.camera_id}] Frame read failed — reconnecting.")
                self._release_cap()
                time.sleep(self._RECONNECT_DELAY)
                continue

            # Drop oldest if queue is full to keep latency low
            if self._queue.full():
                try:
                    self._queue.get_nowait()
                except queue.Empty:
                    pass
            try:
                self._queue.put_nowait(frame)
            except queue.Full:
                pass

            # Update FPS counter
            self._frame_count += 1
            elapsed = time.time() - self._fps_start
            if elapsed >= 1.0:
                self._current_fps = self._frame_count / elapsed
                self._frame_count = 0
                self._fps_start = time.time()

    def __repr__(self) -> str:
        return (
            f"CameraStream(id='{self.camera_id}', source={self.source!r}, "
            f"running={self._running}, fps={self._current_fps:.1f})"
        )
