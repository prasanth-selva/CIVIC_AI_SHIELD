"""
SafeWatch — Main Entry Point
Initialises all components and runs the multi-camera threat detection loop.

Usage:
  python main.py                    # Normal run
  python main.py --dashboard-only   # Start only Streamlit dashboard
  python main.py --test-cameras     # Test camera connections
  python main.py --test-telegram    # Test Telegram bot
  python main.py --config custom.yaml
"""
from __future__ import annotations

import argparse
import asyncio
import os
import sys
import threading
import time
from pathlib import Path

import numpy as np
import yaml
from dotenv import load_dotenv
from loguru import logger

# ─── resolve imports from safewatch root ─────────────────────────────────────
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

# ─────────────────────────────────────────────────────────────────────────────
# Startup banner
# ─────────────────────────────────────────────────────────────────────────────
BANNER = r"""
  ____         __        __        _       _
 / ___|  __ _ / _| ___  \ \      / /__ _ | |_  ___  _ __
 \___ \ / _` | |_ / _ \  \ \ /\ / // _` || __|/ __|| '_ \
  ___) | (_| |  _|  __/   \ V  V /| (_| || |_| (__ | | | |
 |____/ \__,_|_|  \___|    \_/\_/  \__,_| \__|\___||_| |_|

 AI-Powered CCTV Threat Detection System  v1.0.0
 ─────────────────────────────────────────────────────────
"""


def _setup_logging(cfg: dict) -> None:
    log_level = cfg.get("system", {}).get("log_level", "INFO")
    log_file = ROOT / cfg.get("system", {}).get("log_file", "logs/safewatch.log")
    log_file.parent.mkdir(parents=True, exist_ok=True)
    logger.remove()
    logger.add(sys.stderr, level=log_level, colorize=True,
               format="<green>{time:HH:mm:ss}</green> | <level>{level:<8}</level> | {message}")
    logger.add(str(log_file), level="DEBUG", rotation="10 MB", retention="7 days")


def _load_config(path: str) -> dict:
    cfg_path = ROOT / path
    if not cfg_path.exists():
        logger.warning(f"Config not found: {cfg_path}. Using defaults.")
        return {}
    with open(cfg_path) as f:
        return yaml.safe_load(f) or {}


# ─────────────────────────────────────────────────────────────────────────────
# Test modes
# ─────────────────────────────────────────────────────────────────────────────

def test_cameras(cfg: dict) -> None:
    import cv2
    cameras = cfg.get("cameras", [])
    logger.info(f"Testing {len(cameras)} camera(s)…")
    for cam in cameras:
        if not cam.get("enabled", True):
            logger.info(f"  [{cam['id']}] Skipped (disabled)")
            continue
        cap = cv2.VideoCapture(cam["source"])
        if cap.isOpened():
            ret, frame = cap.read()
            cap.release()
            if ret and frame is not None:
                logger.success(f"  [{cam['id']}] ✅ OK — {cam['name']}")
            else:
                logger.error(f"  [{cam['id']}] ❌ Opened but no frame — {cam['name']}")
        else:
            logger.error(f"  [{cam['id']}] ❌ Cannot open — source={cam['source']}")


def test_telegram(cfg: dict) -> None:
    from alerts.telegram_bot import SafeWatchTelegramBot
    bot = SafeWatchTelegramBot(cfg.get("telegram", {}))
    ok = asyncio.run(bot.test_connection())
    if ok:
        logger.success("Telegram connection: ✅ OK")
    else:
        logger.error("Telegram connection: ❌ FAILED")


# ─────────────────────────────────────────────────────────────────────────────
# Dashboard thread
# ─────────────────────────────────────────────────────────────────────────────

def _start_dashboard(cfg: dict) -> None:
    import subprocess
    host = cfg.get("dashboard", {}).get("host", "0.0.0.0")
    port = cfg.get("dashboard", {}).get("port", 8501)
    app_path = ROOT / "dashboard" / "app.py"
    cmd = [
        sys.executable, "-m", "streamlit", "run", str(app_path),
        "--server.address", host,
        "--server.port", str(port),
        "--server.headless", "true",
    ]
    logger.info(f"Starting Streamlit dashboard on http://{host}:{port}")
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return proc


# ─────────────────────────────────────────────────────────────────────────────
# Per-camera processing loop
# ─────────────────────────────────────────────────────────────────────────────

def _camera_loop(
    camera_id: str,
    stream_manager,
    person_detector,
    pose_estimator,
    flow_analyzer,
    velocity_tracker,
    threat_engine,
    alert_manager,
    db_manager,
    cfg: dict,
    stop_event: threading.Event,
) -> None:
    import cv2
    prev_frame: np.ndarray | None = None
    frame_count = 0
    threats_today = 0

    logger.info(f"[{camera_id}] Processing loop started.")

    while not stop_event.is_set():
        meta = stream_manager.get_frame(camera_id)
        if meta is None:
            time.sleep(0.05)
            continue

        frame = meta.frame
        ts = meta.timestamp
        frame_count += 1

        try:
            # 1. Person detection
            persons = person_detector.detect(frame)

            # 2. Pose estimation
            poses = pose_estimator.estimate(frame, persons) if persons else []

            # 3. Update velocity tracker
            for pose in poses:
                velocity_tracker.update(pose.person_id, pose, ts)

            # 4. Optical flow
            flow_result = None
            if prev_frame is not None and cfg.get("detection", {}).get("enable_optical_flow", True):
                flow_result = flow_analyzer.analyze(prev_frame, frame)
            prev_frame = frame.copy()

            # 5. Threat engine
            report = threat_engine.analyze(
                frame=frame,
                camera_id=camera_id,
                timestamp=ts,
                persons=persons,
                poses=poses,
                flow_result=flow_result,
                velocity_tracker=velocity_tracker,
            )

            # 6. Alerts
            if report.threats_detected:
                threats_today += len(report.threats_detected)
                alert_manager.process_threat_report(report, frame)

            # 7. Update camera status in DB
            db_manager.update_camera_status(camera_id, {
                "status": "online",
                "fps": stream_manager.get_status().get(camera_id, {}).get("fps", 0),
                "frames_processed": frame_count,
                "threats_today": threats_today,
            })

        except Exception as exc:
            logger.error(f"[{camera_id}] Loop error: {exc}")

    logger.info(f"[{camera_id}] Processing loop stopped.")


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    load_dotenv(ROOT / ".env")

    parser = argparse.ArgumentParser(description="SafeWatch CCTV Threat Detection")
    parser.add_argument("--config", default="config.yaml", help="Path to config file")
    parser.add_argument("--dashboard-only", action="store_true")
    parser.add_argument("--test-cameras", action="store_true")
    parser.add_argument("--test-telegram", action="store_true")
    args = parser.parse_args()

    cfg = _load_config(args.config)
    _setup_logging(cfg)

    print(BANNER)
    logger.info(f"SafeWatch starting — config: {args.config}")

    if args.test_cameras:
        test_cameras(cfg)
        return

    if args.test_telegram:
        test_telegram(cfg)
        return

    # ── 1. DatabaseManager ────────────────────────────────────────────
    from database.db_manager import DatabaseManager
    from database.incident_logger import IncidentLogger
    db_path = cfg.get("database", {}).get("path", "logs/safewatch.db")
    db = DatabaseManager(db_path=str(ROOT / db_path))
    incident_logger = IncidentLogger(db)

    # ── 2. StreamManager ──────────────────────────────────────────────
    from capture.stream_manager import StreamManager
    stream_mgr = StreamManager(cfg.get("cameras", []))

    if args.dashboard_only:
        proc = _start_dashboard(cfg)
        logger.info("Dashboard-only mode. Press Ctrl+C to stop.")
        try:
            proc.wait()
        except KeyboardInterrupt:
            proc.terminate()
        return

    stream_mgr.start_all()

    # ── 3. Detection components ───────────────────────────────────────
    from detection.person_detector import PersonDetector
    from detection.pose_estimator import PoseEstimator
    from detection.optical_flow import OpticalFlowAnalyzer
    from detection.zone_manager import ZoneManager

    det_cfg = cfg.get("detection", {})
    model_path = str(ROOT / det_cfg.get("yolo_model", "models/yolov8n.pt"))
    person_detector = PersonDetector(model_path=model_path, confidence=det_cfg.get("yolo_confidence", 0.5))
    pose_estimator = PoseEstimator(
        model_complexity=det_cfg.get("pose_model_complexity", 0),
        min_confidence=det_cfg.get("pose_min_confidence", 0.5),
    )
    flow_analyzer = OpticalFlowAnalyzer()
    zone_mgr = ZoneManager(config_path=str(ROOT / args.config))

    # ── 4. Classifier ─────────────────────────────────────────────────
    from classifier.velocity_tracker import VelocityTracker
    from classifier.action_classifier import ActionClassifier
    velocity_tracker = VelocityTracker()
    model_cfg = cfg.get("models", {})
    action_clf = ActionClassifier(model_path=str(ROOT / model_cfg.get("action_classifier", "models/action_classifier.onnx")))

    # ── 5. ThreatEngine ───────────────────────────────────────────────
    from threats.threat_engine import ThreatEngine
    threat_engine = ThreatEngine(cfg, zone_mgr)

    # ── 6. Alerts ─────────────────────────────────────────────────────
    from alerts.telegram_bot import SafeWatchTelegramBot
    from alerts.alert_manager import AlertManager
    tg_bot = SafeWatchTelegramBot(cfg.get("telegram", {}))
    asyncio.run(tg_bot.test_connection())
    alert_mgr = AlertManager(cfg, incident_logger, tg_bot, cfg.get("cameras", []))

    # ── 7. Dashboard ──────────────────────────────────────────────────
    dash_proc = _start_dashboard(cfg)

    # ── 8. Per-camera threads ─────────────────────────────────────────
    stop_event = threading.Event()
    cam_threads = []
    enabled_cams = [c for c in cfg.get("cameras", []) if c.get("enabled", True)]

    for cam in enabled_cams:
        t = threading.Thread(
            target=_camera_loop,
            args=(
                cam["id"], stream_mgr, person_detector, pose_estimator,
                flow_analyzer, velocity_tracker, threat_engine,
                alert_mgr, db, cfg, stop_event,
            ),
            name=f"proc-{cam['id']}",
            daemon=True,
        )
        t.start()
        cam_threads.append(t)
        logger.info(f"Camera processing thread started: {cam['id']}")

    logger.success(
        f"SafeWatch running | {len(enabled_cams)} camera(s) | "
        f"Dashboard → http://localhost:{cfg.get('dashboard',{}).get('port',8501)}"
    )

    # ── 9. Main loop (keep alive) ─────────────────────────────────────
    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        logger.info("Shutdown signal received — stopping…")
    finally:
        stop_event.set()
        stream_mgr.stop_all()
        if dash_proc:
            dash_proc.terminate()
        logger.info("SafeWatch stopped cleanly. Goodbye.")


if __name__ == "__main__":
    main()
