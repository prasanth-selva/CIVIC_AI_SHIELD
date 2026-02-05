"""
System Monitor Module
Tracks system resources, model performance, and health metrics
"""

import time
import threading
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from collections import deque
import logging

logger = logging.getLogger(__name__)

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    logger.warning("psutil not installed. System monitoring will be limited.")


@dataclass
class PerformanceMetrics:
    """Container for performance metrics"""
    timestamp: float
    fps: float
    inference_time_ms: float
    cpu_percent: float
    memory_percent: float
    gpu_memory_percent: Optional[float] = None
    gpu_utilization: Optional[float] = None


class SystemMonitor:
    """
    Monitors system resources and model performance
    Provides real-time health metrics for the dashboard
    """
    
    def __init__(self, history_size: int = 100):
        """
        Initialize system monitor
        
        Args:
            history_size: Number of metric snapshots to keep
        """
        self.history_size = history_size
        
        # Metrics history
        self._metrics_history: deque = deque(maxlen=history_size)
        self._inference_times: deque = deque(maxlen=100)
        
        # Running stats
        self._start_time = time.time()
        self._frames_processed = 0
        self._errors = 0
        
        # Background monitoring
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.Lock()
        
        # GPU monitoring
        self._gpu_available = self._check_gpu()
    
    def _check_gpu(self) -> bool:
        """Check if GPU monitoring is available"""
        try:
            import torch
            return torch.cuda.is_available()
        except ImportError:
            return False
    
    def start_monitoring(self, interval: float = 1.0):
        """Start background monitoring thread"""
        if self._running:
            return
        
        self._running = True
        self._thread = threading.Thread(
            target=self._monitor_loop,
            args=(interval,),
            daemon=True
        )
        self._thread.start()
        logger.info("System monitoring started")
    
    def stop_monitoring(self):
        """Stop background monitoring"""
        self._running = False
        if self._thread:
            self._thread.join(timeout=2.0)
            self._thread = None
        logger.info("System monitoring stopped")
    
    def _monitor_loop(self, interval: float):
        """Background monitoring loop"""
        while self._running:
            try:
                metrics = self._collect_metrics()
                with self._lock:
                    self._metrics_history.append(metrics)
            except Exception as e:
                logger.error(f"Monitoring error: {e}")
            
            time.sleep(interval)
    
    def _collect_metrics(self) -> PerformanceMetrics:
        """Collect current system metrics"""
        # Calculate FPS from recent inference times
        if self._inference_times:
            avg_time = sum(self._inference_times) / len(self._inference_times)
            fps = 1000.0 / avg_time if avg_time > 0 else 0
        else:
            fps = 0.0
        
        # System metrics
        if PSUTIL_AVAILABLE:
            cpu_percent = psutil.cpu_percent()
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
        else:
            cpu_percent = 0.0
            memory_percent = 0.0
        
        # GPU metrics
        gpu_memory = None
        gpu_util = None
        if self._gpu_available:
            try:
                import torch
                gpu_memory = torch.cuda.memory_allocated() / torch.cuda.max_memory_allocated() * 100
                # Note: GPU utilization requires nvidia-ml-py or similar
            except:
                pass
        
        return PerformanceMetrics(
            timestamp=time.time(),
            fps=fps,
            inference_time_ms=sum(self._inference_times) / len(self._inference_times) if self._inference_times else 0,
            cpu_percent=cpu_percent,
            memory_percent=memory_percent,
            gpu_memory_percent=gpu_memory,
            gpu_utilization=gpu_util,
        )
    
    def record_inference(self, inference_time_ms: float):
        """Record an inference time"""
        with self._lock:
            self._inference_times.append(inference_time_ms)
            self._frames_processed += 1
    
    def record_error(self):
        """Record an error occurrence"""
        with self._lock:
            self._errors += 1
    
    def get_current_metrics(self) -> Dict[str, Any]:
        """Get current system metrics"""
        metrics = self._collect_metrics()
        return {
            "timestamp": metrics.timestamp,
            "fps": round(metrics.fps, 1),
            "inference_time_ms": round(metrics.inference_time_ms, 1),
            "cpu_percent": round(metrics.cpu_percent, 1),
            "memory_percent": round(metrics.memory_percent, 1),
            "gpu_memory_percent": round(metrics.gpu_memory_percent, 1) if metrics.gpu_memory_percent else None,
            "gpu_utilization": round(metrics.gpu_utilization, 1) if metrics.gpu_utilization else None,
        }
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get overall system health status"""
        metrics = self._collect_metrics()
        
        # Determine health status
        issues = []
        status = "healthy"
        
        if metrics.cpu_percent > 90:
            issues.append("High CPU usage")
            status = "warning"
        
        if metrics.memory_percent > 90:
            issues.append("High memory usage")
            status = "warning"
        
        if metrics.fps < 5:
            issues.append("Low FPS")
            status = "warning"
        
        if self._errors > 10:
            issues.append("Multiple errors recorded")
            status = "degraded"
        
        uptime = time.time() - self._start_time
        
        return {
            "status": status,
            "issues": issues,
            "uptime_seconds": round(uptime),
            "frames_processed": self._frames_processed,
            "errors": self._errors,
            "current_metrics": self.get_current_metrics(),
        }
    
    def get_metrics_history(self, limit: int = 50) -> List[Dict]:
        """Get recent metrics history"""
        with self._lock:
            history = list(self._metrics_history)[-limit:]
        
        return [
            {
                "timestamp": m.timestamp,
                "fps": round(m.fps, 1),
                "inference_time_ms": round(m.inference_time_ms, 1),
                "cpu_percent": round(m.cpu_percent, 1),
                "memory_percent": round(m.memory_percent, 1),
            }
            for m in history
        ]
    
    def get_system_info(self) -> Dict[str, Any]:
        """Get static system information"""
        info = {
            "python_version": None,
            "cpu_count": None,
            "total_memory_gb": None,
            "gpu_name": None,
            "gpu_memory_gb": None,
            "cuda_version": None,
        }
        
        import platform
        info["python_version"] = platform.python_version()
        
        if PSUTIL_AVAILABLE:
            info["cpu_count"] = psutil.cpu_count()
            info["total_memory_gb"] = round(psutil.virtual_memory().total / (1024**3), 1)
        
        try:
            import torch
            if torch.cuda.is_available():
                info["gpu_name"] = torch.cuda.get_device_name(0)
                props = torch.cuda.get_device_properties(0)
                info["gpu_memory_gb"] = round(props.total_memory / (1024**3), 1)
                info["cuda_version"] = torch.version.cuda
        except:
            pass
        
        return info
    
    @property
    def average_fps(self) -> float:
        """Get average FPS from history"""
        if not self._metrics_history:
            return 0.0
        return sum(m.fps for m in self._metrics_history) / len(self._metrics_history)
    
    @property
    def average_inference_time(self) -> float:
        """Get average inference time in ms"""
        if not self._inference_times:
            return 0.0
        return sum(self._inference_times) / len(self._inference_times)


# Global monitor instance
_system_monitor: Optional[SystemMonitor] = None


def get_system_monitor() -> SystemMonitor:
    """Get global system monitor instance"""
    global _system_monitor
    if _system_monitor is None:
        _system_monitor = SystemMonitor()
    return _system_monitor
