"""
SafeWatch — Test Suite: Capture
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import threading
import time
import numpy as np
import pytest


class TestCameraStream:
    def test_init(self):
        from capture.camera_stream import CameraStream
        cs = CameraStream(source=0, camera_id="TEST-01")
        assert cs.camera_id == "TEST-01"
        assert not cs.is_running()
        assert not cs.is_connected()

    def test_repr(self):
        from capture.camera_stream import CameraStream
        cs = CameraStream(source=0, camera_id="TEST-01")
        r = repr(cs)
        assert "TEST-01" in r

    def test_start_stop_no_camera(self):
        """Start/stop without a real camera should not crash."""
        from capture.camera_stream import CameraStream
        cs = CameraStream(source=9999, camera_id="FAKE-01")
        cs.start()
        time.sleep(0.2)
        assert cs.is_running()
        cs.stop()
        assert not cs.is_running()

    def test_read_returns_none_when_no_frames(self):
        from capture.camera_stream import CameraStream
        cs = CameraStream(source=9999, camera_id="FAKE-02")
        result = cs.read()
        assert result is None


class TestFrameSampler:
    def test_init(self):
        from capture.camera_stream import CameraStream
        from capture.frame_sampler import FrameSampler
        cs = CameraStream(source=9999, camera_id="FAKE-03")
        fs = FrameSampler(stream=cs, frame_skip=5)
        assert fs._frame_skip == 5

    def test_update_skip_rate(self):
        from capture.camera_stream import CameraStream
        from capture.frame_sampler import FrameSampler
        cs = CameraStream(source=9999, camera_id="FAKE-04")
        fs = FrameSampler(stream=cs, frame_skip=5)
        fs.update_skip_rate(10)
        assert fs._frame_skip == 10
        fs.update_skip_rate(0)  # Should clamp to 1
        assert fs._frame_skip == 1

    def test_repr(self):
        from capture.camera_stream import CameraStream
        from capture.frame_sampler import FrameSampler
        cs = CameraStream(source=9999, camera_id="FAKE-05")
        fs = FrameSampler(stream=cs)
        assert "FAKE-05" in repr(fs)


class TestStreamManager:
    def test_init_no_cameras(self):
        from capture.stream_manager import StreamManager
        sm = StreamManager(cameras_cfg=[])
        assert repr(sm) == "StreamManager(cameras=[])"

    def test_get_frame_unknown_id(self):
        from capture.stream_manager import StreamManager
        sm = StreamManager(cameras_cfg=[])
        assert sm.get_frame("NONEXISTENT") is None

    def test_status_empty(self):
        from capture.stream_manager import StreamManager
        sm = StreamManager(cameras_cfg=[])
        assert sm.get_status() == {}
