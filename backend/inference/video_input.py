"""
Video Input Module
Handles video capture from webcam, RTSP streams, and video files
"""

import cv2
import time
import threading
from queue import Queue, Empty, Full
from enum import Enum
from pathlib import Path
from typing import Optional, Tuple, Generator, Union
from dataclasses import dataclass
import logging

from ..config import settings

logger = logging.getLogger(__name__)


class VideoSource(Enum):
    """Video source types"""
    WEBCAM = "webcam"
    RTSP = "rtsp"
    FILE = "file"


@dataclass
class FrameData:
    """Container for captured frame with metadata"""
    frame: any  # numpy array
    timestamp: float
    frame_id: int
    source_type: VideoSource
    source_name: str


class VideoCapture:
    """
    Threaded video capture for multiple sources
    Supports webcam, RTSP streams, and video files
    """
    
    def __init__(
        self,
        source: Union[int, str, Path],
        source_name: str = "Camera",
        queue_size: int = None,
    ):
        """
        Initialize video capture
        
        Args:
            source: Webcam index (int), RTSP URL (str), or video file path
            source_name: Human-readable name for the source
            queue_size: Max frames to buffer (default from settings)
        """
        self.source = source
        self.source_name = source_name
        self.queue_size = queue_size or settings.video.max_queue_size
        
        # Determine source type
        if isinstance(source, int):
            self.source_type = VideoSource.WEBCAM
        elif isinstance(source, str) and source.startswith(("rtsp://", "rtmp://")):
            self.source_type = VideoSource.RTSP
        else:
            self.source_type = VideoSource.FILE
        
        # State
        self._capture: Optional[cv2.VideoCapture] = None
        self._frame_queue: Queue = Queue(maxsize=self.queue_size)
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._frame_count = 0
        self._last_frame_time = 0.0
        
        # Stats
        self.fps = 0.0
        self.width = 0
        self.height = 0
        self.total_frames = 0
    
    def start(self) -> bool:
        """Start video capture thread"""
        if self._running:
            logger.warning(f"Capture already running for {self.source_name}")
            return True
        
        # Open video source
        source_val = str(self.source) if isinstance(self.source, Path) else self.source
        self._capture = cv2.VideoCapture(source_val)
        
        if not self._capture.isOpened():
            logger.error(f"Failed to open video source: {self.source}")
            return False
        
        # Get video properties
        self.fps = self._capture.get(cv2.CAP_PROP_FPS) or 30.0
        self.width = int(self._capture.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self._capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        if self.source_type == VideoSource.FILE:
            self.total_frames = int(self._capture.get(cv2.CAP_PROP_FRAME_COUNT))
        
        logger.info(
            f"Opened {self.source_name}: {self.width}x{self.height} @ {self.fps:.1f}fps"
        )
        
        # Configure RTSP optimizations
        if self.source_type == VideoSource.RTSP:
            self._capture.set(cv2.CAP_PROP_BUFFERSIZE, 3)
            self._capture.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, settings.video.rtsp_timeout)
        
        # Start capture thread
        self._running = True
        self._thread = threading.Thread(target=self._capture_loop, daemon=True)
        self._thread.start()
        
        return True
    
    def stop(self):
        """Stop video capture"""
        self._running = False
        
        if self._thread:
            self._thread.join(timeout=2.0)
            self._thread = None
        
        if self._capture:
            self._capture.release()
            self._capture = None
        
        # Clear queue
        while not self._frame_queue.empty():
            try:
                self._frame_queue.get_nowait()
            except Empty:
                break
        
        logger.info(f"Stopped capture for {self.source_name}")
    
    def _capture_loop(self):
        """Background thread for frame capture"""
        frame_skip = settings.video.frame_skip
        skip_counter = 0
        reconnect_attempts = 0
        max_reconnect = 5
        
        while self._running:
            if self._capture is None or not self._capture.isOpened():
                # Attempt reconnection for RTSP
                if self.source_type == VideoSource.RTSP and reconnect_attempts < max_reconnect:
                    logger.warning(f"Reconnecting to {self.source_name}...")
                    time.sleep(settings.video.reconnect_delay)
                    source_val = str(self.source) if isinstance(self.source, Path) else self.source
                    self._capture = cv2.VideoCapture(source_val)
                    reconnect_attempts += 1
                    continue
                else:
                    break
            
            ret, frame = self._capture.read()
            
            if not ret:
                if self.source_type == VideoSource.FILE:
                    # End of video file
                    logger.info(f"End of video file: {self.source_name}")
                    break
                else:
                    # Lost connection
                    reconnect_attempts += 1
                    time.sleep(0.1)
                    continue
            
            # Reset reconnect counter on successful read
            reconnect_attempts = 0
            
            # Frame skipping for performance
            skip_counter += 1
            if skip_counter < frame_skip:
                continue
            skip_counter = 0
            
            self._frame_count += 1
            current_time = time.time()
            
            # Create frame data
            frame_data = FrameData(
                frame=frame,
                timestamp=current_time,
                frame_id=self._frame_count,
                source_type=self.source_type,
                source_name=self.source_name,
            )
            
            # Add to queue (drop oldest if full)
            try:
                self._frame_queue.put_nowait(frame_data)
            except Full:
                # Drop oldest frame
                try:
                    self._frame_queue.get_nowait()
                except Empty:
                    pass
                self._frame_queue.put_nowait(frame_data)
            
            self._last_frame_time = current_time
        
        self._running = False
    
    def read(self, timeout: float = 1.0) -> Optional[FrameData]:
        """
        Read next frame from queue
        
        Args:
            timeout: Max time to wait for frame
            
        Returns:
            FrameData or None if no frame available
        """
        try:
            return self._frame_queue.get(timeout=timeout)
        except Empty:
            return None
    
    def read_latest(self) -> Optional[FrameData]:
        """
        Read latest frame, discarding older ones
        
        Returns:
            Most recent FrameData or None
        """
        latest = None
        while not self._frame_queue.empty():
            try:
                latest = self._frame_queue.get_nowait()
            except Empty:
                break
        return latest
    
    def frames(self) -> Generator[FrameData, None, None]:
        """Generator for continuous frame reading"""
        while self._running:
            frame_data = self.read(timeout=0.5)
            if frame_data:
                yield frame_data
    
    @property
    def is_running(self) -> bool:
        """Check if capture is running"""
        return self._running
    
    @property
    def frame_count(self) -> int:
        """Number of frames captured"""
        return self._frame_count
    
    @property
    def queue_length(self) -> int:
        """Current queue size"""
        return self._frame_queue.qsize()
    
    def __enter__(self):
        self.start()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()


class MultiSourceCapture:
    """
    Manage multiple video sources simultaneously
    """
    
    def __init__(self):
        self._sources: dict[str, VideoCapture] = {}
        self._lock = threading.Lock()
    
    def add_source(
        self,
        source_id: str,
        source: Union[int, str, Path],
        source_name: str = None,
    ) -> bool:
        """Add a new video source"""
        with self._lock:
            if source_id in self._sources:
                logger.warning(f"Source {source_id} already exists")
                return False
            
            capture = VideoCapture(
                source=source,
                source_name=source_name or source_id,
            )
            
            if capture.start():
                self._sources[source_id] = capture
                return True
            return False
    
    def remove_source(self, source_id: str):
        """Remove and stop a video source"""
        with self._lock:
            if source_id in self._sources:
                self._sources[source_id].stop()
                del self._sources[source_id]
    
    def get_frames(self) -> dict[str, Optional[FrameData]]:
        """Get latest frame from each source"""
        frames = {}
        with self._lock:
            for source_id, capture in self._sources.items():
                frames[source_id] = capture.read_latest()
        return frames
    
    def stop_all(self):
        """Stop all sources"""
        with self._lock:
            for capture in self._sources.values():
                capture.stop()
            self._sources.clear()
    
    @property
    def source_ids(self) -> list[str]:
        """List of active source IDs"""
        return list(self._sources.keys())
