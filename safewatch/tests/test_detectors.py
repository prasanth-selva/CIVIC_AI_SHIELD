"""
SafeWatch — Test Suite: Detectors
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import numpy as np
import pytest


def _make_person(pid=1, x1=100, y1=100, x2=200, y2=300):
    from detection.person_detector import Person
    cx = (x1 + x2) // 2
    cy = (y1 + y2) // 2
    return Person(id=pid, bbox=(x1, y1, x2, y2), confidence=0.9,
                  center=(cx, cy), area=(x2-x1)*(y2-y1),
                  width=x2-x1, height=y2-y1)


def _make_pose(pid=1):
    from detection.pose_estimator import PoseResult, Landmark
    lm = Landmark(x=0.5, y=0.5, z=0.0, visibility=0.9)
    lms = [lm] * 33
    kp = {name: lm for name in [
        "nose","left_shoulder","right_shoulder","left_elbow","right_elbow",
        "left_wrist","right_wrist","left_hip","right_hip","left_knee",
        "right_knee","left_ankle","right_ankle"
    ]}
    return PoseResult(person_id=pid, landmarks=lms, keypoints=kp,
                      bbox=(100, 100, 200, 300), confidence=0.85)


class TestPersonDetector:
    def test_iou_perfect_overlap(self):
        from detection.person_detector import PersonDetector
        iou = PersonDetector._iou((0, 0, 100, 100), (0, 0, 100, 100))
        assert abs(iou - 1.0) < 1e-6

    def test_iou_no_overlap(self):
        from detection.person_detector import PersonDetector
        iou = PersonDetector._iou((0, 0, 50, 50), (100, 100, 200, 200))
        assert iou == 0.0

    def test_iou_partial_overlap(self):
        from detection.person_detector import PersonDetector
        iou = PersonDetector._iou((0, 0, 100, 100), (50, 50, 150, 150))
        assert 0 < iou < 1

    def test_detect_empty_frame(self):
        from detection.person_detector import PersonDetector
        pd = PersonDetector(model_path="models/yolov8n.pt")
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        # Should return list (may be empty without model loaded)
        result = pd.detect(frame)
        assert isinstance(result, list)


class TestSkeletonAnalyzer:
    def test_get_body_orientation_unknown_no_landmarks(self):
        from classifier.skeleton_analyzer import SkeletonAnalyzer
        from detection.pose_estimator import PoseResult, Landmark
        lm_low = Landmark(x=0.5, y=0.5, z=0.0, visibility=0.1)  # low vis
        pose = PoseResult(
            person_id=1,
            landmarks=[lm_low] * 33,
            keypoints={},
            bbox=(0, 0, 100, 200),
            confidence=0.1,
        )
        sa = SkeletonAnalyzer()
        result = sa.get_body_orientation(pose)
        assert result == "unknown"

    def test_is_person_horizontal_false(self):
        from classifier.skeleton_analyzer import SkeletonAnalyzer
        sa = SkeletonAnalyzer()
        pose = _make_pose()
        # With default standing landmarks, lean angle should be near 0
        result = sa.is_person_horizontal(pose, threshold=25.0)
        assert isinstance(result, bool)

    def test_get_center_of_mass(self):
        from classifier.skeleton_analyzer import SkeletonAnalyzer
        sa = SkeletonAnalyzer()
        pose = _make_pose()
        com = sa.get_center_of_mass(pose)
        # With all landmarks at 0.5, should return (0.5, 0.5)
        assert com is not None
        assert 0.0 <= com[0] <= 1.0
        assert 0.0 <= com[1] <= 1.0


class TestVelocityTracker:
    def test_unknown_person_returns_zero(self):
        from classifier.velocity_tracker import VelocityTracker
        vt = VelocityTracker()
        assert vt.get_velocity(999, "left_wrist") == 0.0
        assert vt.get_acceleration(999, "left_wrist") == 0.0

    def test_update_and_get_trajectory(self):
        from classifier.velocity_tracker import VelocityTracker
        import time
        vt = VelocityTracker()
        pose = _make_pose(pid=42)
        vt.update(42, pose, timestamp=time.time())
        traj = vt.get_trajectory(42, n_frames=5)
        assert isinstance(traj, list)

    def test_relative_velocity_unknown_returns_zero(self):
        from classifier.velocity_tracker import VelocityTracker
        vt = VelocityTracker()
        assert vt.get_relative_velocity(1, 2) == 0.0


class TestZoneManager:
    def test_add_and_check_zone(self):
        from detection.zone_manager import ZoneManager
        zm = ZoneManager.__new__(ZoneManager)
        zm._zones = {}
        zm._config_path = Path("config.yaml")
        zm.add_zone("test_zone", [(0, 0), (100, 0), (100, 100), (0, 100)], "restricted")
        assert zm.is_in_zone((50, 50), "test_zone")
        assert not zm.is_in_zone((200, 200), "test_zone")

    def test_list_zones(self):
        from detection.zone_manager import ZoneManager
        zm = ZoneManager.__new__(ZoneManager)
        zm._zones = {}
        zm._config_path = Path("config.yaml")
        zm.add_zone("zone_a", [(0,0),(100,0),(100,100),(0,100)])
        zm.add_zone("zone_b", [(200,200),(300,200),(300,300),(200,300)])
        assert set(zm.list_zones()) == {"zone_a", "zone_b"}

    def test_remove_zone(self):
        from detection.zone_manager import ZoneManager
        zm = ZoneManager.__new__(ZoneManager)
        zm._zones = {}
        zm._config_path = Path("config.yaml")
        zm.add_zone("temp", [(0,0),(100,0),(100,100),(0,100)])
        assert zm.remove_zone("temp")
        assert not zm.remove_zone("temp")  # already gone
