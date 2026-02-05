"""
Training Pipeline Module
YOLOv8 training for threat detection
"""

from pathlib import Path
from typing import Dict, Optional, Any
import logging
import json
from datetime import datetime

from ..config import settings

logger = logging.getLogger(__name__)


class ThreatModelTrainer:
    """
    Trains YOLOv8 models for threat detection
    Supports custom datasets and hyperparameter tuning
    """
    
    def __init__(
        self,
        data_yaml: Path = None,
        base_model: str = "yolov8n.pt",
        output_dir: Path = None,
    ):
        """
        Initialize trainer
        
        Args:
            data_yaml: Path to dataset config (data.yaml)
            base_model: Base model for transfer learning
            output_dir: Directory for saving results
        """
        self.data_yaml = data_yaml
        self.base_model = base_model
        self.output_dir = output_dir or Path(__file__).parent.parent / "models" / "runs"
        
        self._model = None
        self._results = None
    
    def train(
        self,
        epochs: int = None,
        batch_size: int = None,
        imgsz: int = None,
        patience: int = None,
        device: str = None,
        name: str = None,
        **kwargs,
    ) -> Optional[Path]:
        """
        Train the model
        
        Args:
            epochs: Number of training epochs
            batch_size: Batch size
            imgsz: Input image size
            patience: Early stopping patience
            device: Training device (cuda, cpu)
            name: Experiment name
            **kwargs: Additional training arguments
            
        Returns:
            Path to best model weights or None on failure
        """
        if not self.data_yaml or not self.data_yaml.exists():
            logger.error(f"Data config not found: {self.data_yaml}")
            return None
        
        try:
            from ultralytics import YOLO
            import torch
            
            # Load base model
            logger.info(f"Loading base model: {self.base_model}")
            self._model = YOLO(self.base_model)
            
            # Determine device
            if device is None:
                device = "0" if torch.cuda.is_available() else "cpu"
            
            # Set training parameters
            train_args = {
                "data": str(self.data_yaml),
                "epochs": epochs or settings.training.epochs,
                "batch": batch_size or settings.training.batch_size,
                "imgsz": imgsz or settings.training.imgsz,
                "patience": patience or settings.training.patience,
                "device": device,
                "project": str(self.output_dir),
                "name": name or f"threat_detector_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "save": True,
                "plots": True,
                "verbose": True,
            }
            train_args.update(kwargs)
            
            logger.info(f"Starting training with config: {train_args}")
            
            # Train
            self._results = self._model.train(**train_args)
            
            # Get best model path
            best_path = self.output_dir / train_args["name"] / "weights" / "best.pt"
            
            if best_path.exists():
                logger.info(f"Training complete. Best model: {best_path}")
                return best_path
            else:
                logger.warning("Training finished but best.pt not found")
                return None
                
        except ImportError:
            logger.error("ultralytics not installed. Run: pip install ultralytics")
            return None
        except Exception as e:
            logger.error(f"Training failed: {e}")
            return None
    
    def validate(self, model_path: Path = None) -> Dict[str, Any]:
        """
        Validate trained model
        
        Args:
            model_path: Path to model weights
            
        Returns:
            Validation metrics
        """
        try:
            from ultralytics import YOLO
            
            if model_path:
                model = YOLO(str(model_path))
            elif self._model:
                model = self._model
            else:
                logger.error("No model to validate")
                return {}
            
            metrics = model.val()
            
            results = {
                "mAP50": float(metrics.box.map50) if hasattr(metrics.box, 'map50') else 0.0,
                "mAP50-95": float(metrics.box.map) if hasattr(metrics.box, 'map') else 0.0,
                "precision": float(metrics.box.mp) if hasattr(metrics.box, 'mp') else 0.0,
                "recall": float(metrics.box.mr) if hasattr(metrics.box, 'mr') else 0.0,
            }
            
            logger.info(f"Validation results: {results}")
            return results
            
        except Exception as e:
            logger.error(f"Validation failed: {e}")
            return {}
    
    def get_training_config(self) -> Dict[str, Any]:
        """Get current training configuration"""
        return {
            "data_yaml": str(self.data_yaml) if self.data_yaml else None,
            "base_model": self.base_model,
            "output_dir": str(self.output_dir),
            "epochs": settings.training.epochs,
            "batch_size": settings.training.batch_size,
            "imgsz": settings.training.imgsz,
            "patience": settings.training.patience,
        }


def train_from_roboflow(
    api_key: str = None,
    workspace: str = None,
    project: str = None,
    version: int = 1,
    epochs: int = 100,
    **train_kwargs,
) -> Optional[Path]:
    """
    Complete training pipeline from Roboflow dataset
    
    Args:
        api_key: Roboflow API key
        workspace: Roboflow workspace
        project: Roboflow project name
        version: Dataset version
        epochs: Training epochs
        **train_kwargs: Additional training arguments
        
    Returns:
        Path to best model or None
    """
    from .roboflow_client import RoboflowClient
    
    # Download dataset
    client = RoboflowClient(api_key=api_key, workspace=workspace, project=project)
    
    dataset_path = client.download_dataset(version=version)
    if not dataset_path:
        logger.error("Failed to download dataset")
        return None
    
    # Find data.yaml
    data_yaml = dataset_path / "data.yaml"
    if not data_yaml.exists():
        logger.error(f"data.yaml not found in {dataset_path}")
        return None
    
    # Train
    trainer = ThreatModelTrainer(data_yaml=data_yaml)
    best_model = trainer.train(epochs=epochs, **train_kwargs)
    
    return best_model


if __name__ == "__main__":
    # Training CLI
    import argparse
    
    logging.basicConfig(level=logging.INFO)
    
    parser = argparse.ArgumentParser(description="Train threat detection model")
    parser.add_argument("--data", type=str, required=True, help="Path to data.yaml")
    parser.add_argument("--epochs", type=int, default=100, help="Training epochs")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Base model")
    parser.add_argument("--name", type=str, default=None, help="Experiment name")
    
    args = parser.parse_args()
    
    trainer = ThreatModelTrainer(
        data_yaml=Path(args.data),
        base_model=args.model,
    )
    
    best_model = trainer.train(
        epochs=args.epochs,
        batch_size=args.batch,
        imgsz=args.imgsz,
        name=args.name,
    )
    
    if best_model:
        print(f"\n✅ Training complete! Best model: {best_model}")
        
        # Validate
        print("\nRunning validation...")
        metrics = trainer.validate(best_model)
        print(f"mAP@50: {metrics.get('mAP50', 0):.4f}")
        print(f"mAP@50-95: {metrics.get('mAP50-95', 0):.4f}")
    else:
        print("\n❌ Training failed")
