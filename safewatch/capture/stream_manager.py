"""
SafeWatch — StreamManager
Manages multiple CameraStream instances, auto-restarts failed streams,
and exposes a unified frame-access interface.
"""

from __future__ import annotations

import threading
import time
from typing import Any, Dict, List, Optional

from loguru import logger

from capture.camera_stream import CameraStream
from capture.frame_sampler import FrameSampler, FrameMeta


class StreamManager:
    """
    Owns one CameraStream + FrameSampler per configured camera.
    Runs health-check logging every 60 seconds and auto-restarts dead streams.
    """

    _HEALTH_LOG_INTERVAL: float = 60.0   # seconds
    _RESTART_DELAY: float = 5.0

    def __init__(self, cameras_cfg: List[Dict[str, Any]]) -> None:
        self._configs: Dict[str, Dict[str, Any]] = {
            cam["id"]: cam for cam in cameras_cfg if cam.get("enabled", True)
        }
        self._streams: Dict[str, CameraStream] = {}
        self._samplers: Dict[str, FrameSampler] = {}
        self._latest_frames: Dict[str, Optional[FrameMeta]] = {}
        self._frame_locks: Dict[str, threading.Lock] = {}
        self._threads: Dict[str, threading.Thread] = {}
        self._stop_event = threading.Event()
        self._health_thread: Optional[threading.Thread] = None

        for cam_id in self._configs:
            self._latest_frames[cam_id] = None
            self._frame_locks[cam_id] = threading.Lock()

        logger.info(
            f"StreamManager created for cameras: {list(self._configs.keys())}"
        )

    # ─────────────────────────── lifecycle ──────────────────────────

    def start_all(self) -> None:
        """Start all enabled camera streams."""
        self._stop_event.clear()
        for cam_id, cfg in self._configs.items():
            self._launch_stream(cam_id, cfg)

        self._health_thread = threading.Thread(
            target=self._health_loop,
            name="stream-health",
            daemon=True,
        )
        self._health_thread.start()
        logger.info("StreamManager: all streams started.")

    def stop_all(self) -> None:
        """Stop all streams and the health thread."""
        self._stop_event.set()
        for cam_id, stream in self._streams.items():
            try:
                stream.stop()
            except Exception as exc:
                logger.warning(f"[{cam_id}] Stop error: {exc}")
        logger.info("StreamManager: all streams stopped.")

    # ─────────────────────────── frame access ───────────────────────

    def get_frame(self, camera_id: str) -> Optional[FrameMeta]:
        """Return the most recent FrameMeta for the given camera, or None."""
        lock = self._frame_locks.get(camera_id)
        if lock is None:
            return None
        with lock:
            return self._latest_frames.get(camera_id)

    def get_all_frames(self) -> Dict[str, Optional[FrameMeta]]:
        """Return latest FrameMeta for every camera."""
        result: Dict[str, Optional[FrameMeta]] = {}
        for cam_id in self._configs:
            result[cam_id] = self.get_frame(cam_id)
        return result

    # ─────────────────────────── status ─────────────────────────────

    def get_status(self) -> Dict[str, Dict[str, Any]]:
        """Return health status dict for all cameras."""
        status: Dict[str, Dict[str, Any]] = {}
        for cam_id, stream in self._streams.items():
            status[cam_id] = {
                "running":   stream.is_running(),
                "connected": stream.is_connected(),
                "fps":       stream.get_fps(),
                "source":    stream.source,
            }
        return status

    # ─────────────────────────── internals ──────────────────────────

    def _launch_stream(self, cam_id: str, cfg: Dict[str, Any]) -> None:
        """Create, start, and poll a single camera stream in a daemon thread."""
        resolution = tuple(cfg.get("resolution", [640, 480]))
        fps_target = cfg.get("fps_target", 15)
        frame_skip = cfg.get("frame_skip", 5)

        stream = CameraStream(
            source=cfg["source"],
            camera_id=cam_id,
            resolution=resolution,  # type: ignore[arg-type]
            fps_target=fps_target,
        )
        stream.start()

        sampler = FrameSampler(
            stream=stream,
            frame_skip=frame_skip,
            resolution=resolution,  # type: ignore[arg-type]
        )

        self._streams[cam_id] = stream
        self._samplers[cam_id] = sampler

        t = threading.Thread(
            target=self._poll_sampler,
            args=(cam_id, sampler),
            name=f"sampler-{cam_id}",
            daemon=True,
        )
        self._threads[cam_id] = t
        t.start()
        logger.debug(f"[{cam_id}] Polling thread launched.")

    def _poll_sampler(self, cam_id: str, sampler: FrameSampler) -> None:
        """Continuously pull frames from a FrameSampler and store the latest."""
        for meta in sampler.get_frame():
            if self._stop_event.is_set():
                break
            with self._frame_locks[cam_id]:
                self._latest_frames[cam_id] = meta

    def _health_loop(self) -> None:
        """Log stream health every 60 seconds; restart dead streams."""
        while not self._stop_event.wait(self._HEALTH_LOG_INTERVAL):
            status = self.get_status()
            for cam_id, info in status.items():
                state = "🟢 OK" if info["connected"] else "🔴 DOWN"
                logger.info(
                    f"[HEALTH] {cam_id} {state} | "
                    f"fps={info['fps']:.1f} | source={info['source']}"
                )
                if not info["connected"] and not self._stop_event.is_set():
                    logger.warning(
                        f"[{cam_id}] Stream down — attempting restart in "
                        f"{self._RESTART_DELAY}s"
                    )
                    time.sleep(self._RESTART_DELAY)
                    cfg = self._configs.get(cam_id)
                    if cfg:
                        self._launch_stream(cam_id, cfg)

    def __repr__(self) -> str:
        return f"StreamManager(cameras={list(self._configs.keys())})"
