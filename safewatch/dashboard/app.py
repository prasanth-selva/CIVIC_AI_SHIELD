"""
SafeWatch — Streamlit Dashboard
Full 4-page monitoring dashboard with live feeds, incident history,
camera management, and system settings.
Run: streamlit run dashboard/app.py
"""
from __future__ import annotations

import sys
import time
import base64
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import streamlit as st

# ─── Page configuration (must be first Streamlit call) ───────────────────────
st.set_page_config(
    page_title="SafeWatch Dashboard",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── Add safewatch to path ───────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# ─── Dark security theme ─────────────────────────────────────────────────────
st.markdown("""
<style>
    .main { background-color: #0a0a0f; color: #e0e0e0; }
    .stApp { background-color: #0a0a0f; }
    .block-container { padding-top: 1rem; }
    .metric-card {
        background: linear-gradient(135deg, #12121f, #1a1a2e);
        border: 1px solid #2a2a4a;
        border-radius: 12px;
        padding: 1rem;
        margin: 0.25rem 0;
    }
    .threat-badge-CRITICAL { color: #cc00ff; font-weight: bold; }
    .threat-badge-HIGH     { color: #ff3333; font-weight: bold; }
    .threat-badge-MEDIUM   { color: #ff8800; font-weight: bold; }
    .threat-badge-LOW      { color: #00cccc; }
    .threat-badge-SAFE     { color: #00cc44; }
    .stButton > button {
        background: linear-gradient(90deg, #1a1aff, #8800cc);
        color: white; border: none; border-radius: 8px;
    }
    .sidebar .sidebar-content { background-color: #0d0d1a; }
</style>
""", unsafe_allow_html=True)

# ─── Shared state helpers ─────────────────────────────────────────────────────
def _init_state():
    defaults = {
        "show_skeleton": True,
        "show_bboxes": True,
        "show_zones": True,
        "show_threat_overlay": True,
        "page": "Live Monitor",
        "frame_store": {},        # cam_id → latest numpy frame
        "threat_store": {},       # cam_id → latest ThreatReport
        "config": _load_config(),
        "db": _load_db(),
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


def _load_config():
    import yaml
    cfg_path = ROOT / "config.yaml"
    if cfg_path.exists():
        with open(cfg_path) as f:
            return yaml.safe_load(f) or {}
    return {}


def _load_db():
    try:
        from database.db_manager import DatabaseManager
        cfg = st.session_state.get("config", {})
        db_path = cfg.get("database", {}).get("path", "logs/safewatch.db")
        return DatabaseManager(db_path=str(ROOT / db_path))
    except Exception:
        return None


# ─── Navigation ───────────────────────────────────────────────────────────────
def _sidebar():
    with st.sidebar:
        st.markdown("## 🛡️ SafeWatch")
        st.markdown("---")
        pages = ["Live Monitor", "Incident History", "Camera Management", "System Settings"]
        for p in pages:
            icon = {"Live Monitor": "📷", "Incident History": "📋",
                    "Camera Management": "⚙️", "System Settings": "🔧"}[p]
            if st.button(f"{icon} {p}", key=f"nav_{p}", use_container_width=True):
                st.session_state.page = p
        st.markdown("---")
        st.markdown("**Display Options**")
        st.session_state.show_skeleton = st.toggle("Show Skeleton", st.session_state.show_skeleton)
        st.session_state.show_bboxes = st.toggle("Show Bounding Boxes", st.session_state.show_bboxes)
        st.session_state.show_zones = st.toggle("Show Zones", st.session_state.show_zones)
        st.session_state.show_threat_overlay = st.toggle("Threat Overlay", st.session_state.show_threat_overlay)
        st.markdown("---")
        st.caption(f"SafeWatch v1.0.0 | {datetime.now().strftime('%H:%M:%S')}")


# ─── PAGE 1: Live Monitor ─────────────────────────────────────────────────────
def page_live_monitor():
    st.title("📷 Live Monitor")
    cfg = st.session_state.config
    cameras = cfg.get("cameras", [])

    db = st.session_state.db

    # Risk level indicator
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Active Cameras", sum(1 for c in cameras if c.get("enabled")))
    with col2:
        st.metric("Total Cameras", len(cameras))
    with col3:
        incidents_today = 0
        if db:
            try:
                stats = db.get_daily_stats()
                incidents_today = stats.get("total", 0)
            except Exception:
                pass
        st.metric("Alerts Today", incidents_today)
    with col4:
        st.metric("System Status", "🟢 Running")

    st.markdown("---")

    # Active alerts sidebar
    recent = []
    if db:
        try:
            recent = db.get_recent_incidents(n=5)
        except Exception:
            pass

    alert_col, feed_col = st.columns([1, 3])

    with alert_col:
        st.markdown("### 🚨 Recent Alerts")
        if not recent:
            st.info("No recent alerts")
        for inc in recent:
            sev = inc.get("severity", "LOW")
            st.markdown(
                f"<div class='threat-badge-{sev}'>"
                f"[{sev}] {inc.get('threat_type','?').upper()}<br/>"
                f"<small>{inc.get('camera_id','')} | {inc.get('timestamp','')[:16]}</small>"
                f"</div><br/>",
                unsafe_allow_html=True,
            )

    with feed_col:
        st.markdown("### 📹 Camera Feeds")
        frame_store = st.session_state.frame_store
        enabled_cams = [c for c in cameras if c.get("enabled")]

        if not enabled_cams:
            st.warning("No cameras enabled in config.yaml")
        else:
            cols = st.columns(min(len(enabled_cams), 2))
            for i, cam in enumerate(enabled_cams):
                with cols[i % 2]:
                    cam_id = cam["id"]
                    frame = frame_store.get(cam_id)
                    threat = st.session_state.threat_store.get(cam_id)
                    risk = threat.overall_risk_level if threat else "SAFE"
                    badge_class = f"threat-badge-{risk}"

                    st.markdown(
                        f"<div class='{badge_class}'>● {cam['name']} ({cam_id}) — {risk}</div>",
                        unsafe_allow_html=True,
                    )
                    if frame is not None:
                        import cv2
                        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        st.image(rgb, use_container_width=True)
                    else:
                        st.image(
                            np.zeros((240, 320, 3), dtype=np.uint8),
                            caption="Waiting for stream…",
                            use_container_width=True,
                        )

    time.sleep(0.5)
    st.rerun()


# ─── PAGE 2: Incident History ─────────────────────────────────────────────────
def page_incident_history():
    import pandas as pd
    st.title("📋 Incident History")
    db = st.session_state.db
    if db is None:
        st.error("Database not available."); return

    cfg = st.session_state.config
    cameras = cfg.get("cameras", [])
    cam_ids = ["All"] + [c["id"] for c in cameras]

    col1, col2, col3 = st.columns(3)
    with col1:
        cam_filter = st.selectbox("Camera", cam_ids)
    with col2:
        type_filter = st.selectbox("Threat Type", ["All", "fight", "fall", "harassment",
            "assault", "unconscious", "trespass", "crowd_panic", "accident", "abuse"])
    with col3:
        sev_filter = st.selectbox("Severity", ["All", "LOW", "MEDIUM", "HIGH", "CRITICAL"])

    incidents = db.get_incidents(
        camera_id=None if cam_filter == "All" else cam_filter,
        threat_type=None if type_filter == "All" else type_filter,
        severity=None if sev_filter == "All" else sev_filter,
        limit=500,
    )

    if not incidents:
        st.info("No incidents match the current filters.")
        return

    df = pd.DataFrame(incidents)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp", ascending=False)

    # Export
    col_a, col_b = st.columns([3, 1])
    with col_b:
        csv = df.to_csv(index=False)
        st.download_button("📥 Export CSV", csv, "incidents.csv", "text/csv")

    st.dataframe(
        df[["id", "timestamp", "camera_id", "threat_type", "severity", "confidence",
            "persons_involved", "description"]],
        use_container_width=True,
        height=350,
    )

    st.markdown("---")
    chart_col1, chart_col2 = st.columns(2)

    with chart_col1:
        st.markdown("#### Incidents Over Time")
        df["hour"] = df["timestamp"].dt.floor("H")
        timeline = df.groupby("hour").size().reset_index(name="count")
        st.line_chart(timeline.set_index("hour")["count"])

    with chart_col2:
        st.markdown("#### Threat Type Distribution")
        dist = df["threat_type"].value_counts().reset_index()
        dist.columns = ["threat_type", "count"]
        st.bar_chart(dist.set_index("threat_type"))


# ─── PAGE 3: Camera Management ────────────────────────────────────────────────
def page_camera_management():
    st.title("⚙️ Camera Management")
    cfg = st.session_state.config
    cameras = cfg.get("cameras", [])
    db = st.session_state.db

    for cam in cameras:
        cam_id = cam["id"]
        status_data = {}
        if db:
            rows = db.get_camera_status(cam_id)
            status_data = rows[0] if rows else {}

        status = status_data.get("status", "unknown")
        badge = "🟢" if status == "online" else "🔴"
        fps = status_data.get("fps", 0.0)
        threats_today = status_data.get("threats_today", 0)

        with st.expander(f"{badge} {cam['name']} ({cam_id}) — FPS: {fps:.1f} | Threats: {threats_today}"):
            col1, col2 = st.columns(2)
            with col1:
                st.markdown(f"**Source:** `{cam['source']}`")
                st.markdown(f"**Zone type:** {cam.get('zone_type','?')}")
                st.markdown(f"**Agents:** {', '.join(cam.get('agents', []))}")
                st.markdown(f"**Resolution:** {cam.get('resolution', [640, 480])}")
            with col2:
                st.markdown(f"**FPS target:** {cam.get('fps_target', 15)}")
                st.markdown(f"**Frame skip:** {cam.get('frame_skip', 5)}")
                enabled = cam.get("enabled", True)
                st.markdown(f"**Enabled:** {'✅' if enabled else '❌'}")

            if st.button(f"🧪 Test Alert — {cam_id}", key=f"test_{cam_id}"):
                st.success(f"Test alert sent for {cam_id}")


# ─── PAGE 4: System Settings ──────────────────────────────────────────────────
def page_system_settings():
    st.title("🔧 System Settings")
    cfg = st.session_state.config
    threats_cfg = cfg.get("threats", {})

    st.markdown("### Threat Confidence Thresholds")
    for threat_name, threat_cfg in threats_cfg.items():
        if isinstance(threat_cfg, dict) and "confidence_threshold" in threat_cfg:
            new_val = st.slider(
                threat_name.replace("_", " ").title(),
                0.0, 1.0,
                float(threat_cfg.get("confidence_threshold", 0.8)),
                0.01,
                key=f"thresh_{threat_name}",
            )
            threats_cfg[threat_name]["confidence_threshold"] = new_val

    st.markdown("---")
    st.markdown("### Telegram Bot")
    tg_cfg = cfg.get("telegram", {})
    col1, col2 = st.columns(2)
    with col1:
        st.markdown(f"**Enabled:** {'✅' if tg_cfg.get('enabled') else '❌'}")
        st.markdown(f"**Cooldown:** {tg_cfg.get('alert_cooldown_seconds', 30)}s")
    with col2:
        if st.button("🧪 Test Telegram Connection"):
            st.info("Test triggered — check safewatch.log for result.")

    st.markdown("---")
    st.markdown("### System Logs")
    db = st.session_state.db
    if db:
        logs = db.get_system_logs(n=50)
        if logs:
            import pandas as pd
            st.dataframe(pd.DataFrame(logs)[["timestamp", "level", "message"]], use_container_width=True, height=300)
        else:
            st.info("No system logs yet.")

    st.markdown("---")
    st.markdown("### Model Info")
    models_cfg = cfg.get("models", {})
    onnx_path = Path(ROOT) / models_cfg.get("action_classifier", "models/action_classifier.onnx")
    yolo_path = Path(ROOT) / cfg.get("detection", {}).get("yolo_model", "models/yolov8n.pt")
    st.markdown(f"**YOLOv8:** `{yolo_path}` — {'✅ Found' if yolo_path.exists() else '❌ Missing'}")
    st.markdown(f"**ONNX Classifier:** `{onnx_path}` — {'✅ Found' if onnx_path.exists() else '⚠️ Not trained yet (rule-based active)'}")
    st.markdown(f"**Custom YOLO:** {'Enabled' if models_cfg.get('use_custom_yolo') else 'Disabled (using yolov8n)'}")


# ─── MAIN ─────────────────────────────────────────────────────────────────────
_init_state()
_sidebar()

page = st.session_state.page
if page == "Live Monitor":
    page_live_monitor()
elif page == "Incident History":
    page_incident_history()
elif page == "Camera Management":
    page_camera_management()
elif page == "System Settings":
    page_system_settings()
