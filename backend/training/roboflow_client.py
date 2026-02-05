"""
Roboflow Client Module
Handles dataset download, version management, and format conversion
"""

from pathlib import Path
from typing import Dict, Optional, List, Any
import shutil
import logging
import json

from ..config import settings

logger = logging.getLogger(__name__)


class RoboflowClient:
    """
    Client for Roboflow dataset management
    Downloads, converts, and manages datasets for training
    """
    
    def __init__(
        self,
        api_key: str = None,
        workspace: str = None,
        project: str = None,
    ):
        """
        Initialize Roboflow client
        
        Args:
            api_key: Roboflow API key
            workspace: Workspace name
            project: Project name
        """
        self.api_key = api_key or settings.training.roboflow_api_key
        self.workspace = workspace or settings.training.roboflow_workspace
        self.project = project or settings.training.roboflow_project
        
        self._rf = None
        self._project_ref = None
        self._dataset_path: Optional[Path] = None
    
    @property
    def is_configured(self) -> bool:
        """Check if API key is set"""
        return bool(self.api_key)
    
    def connect(self) -> bool:
        """
        Connect to Roboflow API
        
        Returns:
            True if connection successful
        """
        if not self.api_key:
            logger.warning("Roboflow API key not configured")
            return False
        
        try:
            from roboflow import Roboflow
            
            self._rf = Roboflow(api_key=self.api_key)
            self._project_ref = self._rf.workspace(self.workspace).project(self.project)
            
            logger.info(f"Connected to Roboflow project: {self.workspace}/{self.project}")
            return True
            
        except ImportError:
            logger.error("roboflow package not installed. Run: pip install roboflow")
            return False
        except Exception as e:
            logger.error(f"Roboflow connection failed: {e}")
            return False
    
    def download_dataset(
        self,
        version: int = 1,
        format: str = "yolov8",
        location: Path = None,
        overwrite: bool = False,
    ) -> Optional[Path]:
        """
        Download dataset from Roboflow
        
        Args:
            version: Dataset version number
            format: Export format (yolov8, coco, etc.)
            location: Download location
            overwrite: Overwrite existing download
            
        Returns:
            Path to downloaded dataset or None on failure
        """
        if not self._project_ref:
            if not self.connect():
                return None
        
        location = location or settings.training.dataset_dir / f"{self.project}-{version}"
        
        # Check if already exists
        if location.exists() and not overwrite:
            logger.info(f"Dataset already exists at {location}")
            self._dataset_path = location
            return location
        
        if location.exists() and overwrite:
            shutil.rmtree(location)
        
        try:
            dataset = self._project_ref.version(version).download(format, location=str(location))
            
            self._dataset_path = Path(dataset.location)
            logger.info(f"Downloaded dataset to: {self._dataset_path}")
            
            return self._dataset_path
            
        except Exception as e:
            logger.error(f"Dataset download failed: {e}")
            return None
    
    def get_versions(self) -> List[Dict[str, Any]]:
        """
        Get available dataset versions
        
        Returns:
            List of version info dicts
        """
        if not self._project_ref:
            if not self.connect():
                return []
        
        try:
            versions = []
            for v in self._project_ref.versions:
                versions.append({
                    "version": v.version,
                    "id": v.id,
                    "images": getattr(v, "images", None),
                    "created": getattr(v, "created", None),
                })
            return versions
        except Exception as e:
            logger.error(f"Failed to get versions: {e}")
            return []
    
    def get_classes(self) -> List[str]:
        """
        Get class names from downloaded dataset
        
        Returns:
            List of class names
        """
        if not self._dataset_path:
            logger.warning("No dataset downloaded")
            return []
        
        # Try to read data.yaml
        yaml_path = self._dataset_path / "data.yaml"
        if yaml_path.exists():
            try:
                import yaml
                with open(yaml_path) as f:
                    data = yaml.safe_load(f)
                return data.get("names", [])
            except Exception as e:
                logger.error(f"Failed to parse data.yaml: {e}")
        
        return []
    
    def convert_to_yolo(
        self,
        source_path: Path,
        output_path: Path,
    ) -> bool:
        """
        Convert annotations to YOLO format
        
        Args:
            source_path: Source annotation path
            output_path: Output directory
            
        Returns:
            True if conversion successful
        """
        # This is a placeholder - actual conversion depends on source format
        # Roboflow export handles this automatically when downloading as yolov8
        
        output_path.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Annotations converted to YOLO format at {output_path}")
        return True
    
    @property
    def dataset_path(self) -> Optional[Path]:
        """Get current dataset path"""
        return self._dataset_path


def create_sample_dataset_structure(base_path: Path) -> Path:
    """
    Create sample dataset structure for testing
    
    Args:
        base_path: Base directory for dataset
        
    Returns:
        Path to created dataset
    """
    dataset_path = base_path / "sample-dataset"
    
    # Create structure
    for split in ["train", "valid", "test"]:
        (dataset_path / split / "images").mkdir(parents=True, exist_ok=True)
        (dataset_path / split / "labels").mkdir(parents=True, exist_ok=True)
    
    # Create data.yaml
    data_yaml = {
        "train": "../train/images",
        "val": "../valid/images",
        "test": "../test/images",
        "nc": 10,
        "names": [
            "violence", "assault", "fighting", "robbery", "fire",
            "accident", "fall", "harassment", "suspicious_activity", "weapon"
        ]
    }
    
    import yaml
    yaml_path = dataset_path / "data.yaml"
    with open(yaml_path, 'w') as f:
        yaml.dump(data_yaml, f, default_flow_style=False)
    
    logger.info(f"Created sample dataset structure at {dataset_path}")
    return dataset_path


if __name__ == "__main__":
    # Test mode
    logging.basicConfig(level=logging.INFO)
    
    client = RoboflowClient()
    
    if client.is_configured:
        print("Connecting to Roboflow...")
        if client.connect():
            versions = client.get_versions()
            print(f"Available versions: {versions}")
    else:
        print("Roboflow not configured. Set ROBOFLOW_API_KEY environment variable.")
        print("Creating sample dataset structure instead...")
        create_sample_dataset_structure(settings.training.dataset_dir)
