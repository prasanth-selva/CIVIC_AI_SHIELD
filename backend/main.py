"""
Civic AI Shield - FastAPI Main Application
Real-time AI Threat Detection for Women Safety
"""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from .routes import api_router, auth_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger("civic-ai-shield")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events"""
    # Startup
    logger.info("🛡️  Civic AI Shield - Starting Up")
    logger.info("━" * 50)
    
    # Check for detection modules
    try:
        from .config import settings
        from .inference import ThreatDetector
        from .telegram_alert import TelegramBot
        
        logger.info("✅ Detection modules loaded")
        logger.info(f"📁 Model path: {settings.detection.model_path}")
        logger.info(f"💬 Telegram configured: {bool(settings.telegram.bot_token)}")
        logger.info(f"🎯 GPU enabled: {settings.detection.use_gpu}")
        
    except ImportError as e:
        logger.warning(f"⚠️  Some modules not available: {e}")
    
    logger.info("━" * 50)
    logger.info("🚀 Server ready to accept connections")
    
    yield
    
    # Shutdown
    logger.info("👋 Civic AI Shield - Shutting Down")
    
    # Cleanup
    try:
        from .routes.api import _alert_manager
        if _alert_manager:
            _alert_manager.stop()
    except:
        pass


# Create FastAPI application
app = FastAPI(
    title="Civic AI Shield",
    description="Real-time AI Threat Detection System for Women Safety",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # In production, replace with specific origins
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(api_router, prefix="/api", tags=["api"])


# Root endpoint
@app.get("/")
def root():
    """Root endpoint - API status"""
    return {
        "service": "Civic AI Shield",
        "status": "running",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }


# Static files for saved frames (if enabled)
frames_dir = Path(__file__).parent / "data" / "frames"
if frames_dir.exists():
    app.mount("/frames", StaticFiles(directory=str(frames_dir)), name="frames")


# For running with: python -m backend.main
def main():
    """CLI entry point"""
    import uvicorn
    
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )


if __name__ == "__main__":
    main()
