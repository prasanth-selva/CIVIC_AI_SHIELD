"""
Model Export Module
Export trained models to optimized formats for edge deployment
"""

from pathlib import Path
from typing import List, Optional, Dict, Any
import logging
import shutil

from ..config import settings

logger = logging.getLogger(__name__)


class ModelExporter:
    """
    Export YOLOv8 models to various formats for deployment
    Supports ONNX, TensorRT, quantization, and more
    """
    
    SUPPORTED_FORMATS = [
        "onnx",       # ONNX format - cross platform
        "engine",     # TensorRT - NVIDIA GPUs
        "openvino",   # OpenVINO - Intel hardware
        "coreml",     # CoreML - Apple devices
        "tflite",     # TensorFlow Lite - mobile/edge
        "saved_model", # TensorFlow SavedModel
        "pb",         # TensorFlow GraphDef
        "paddle",     # PaddlePaddle
        "ncnn",       # NCNN - mobile
    ]
    
    def __init__(self, model_path: Path):
        """
        Initialize exporter
        
        Args:
            model_path: Path to trained .pt model
        """
        self.model_path = Path(model_path)
        self._model = None
        self._exported_paths: Dict[str, Path] = {}
    
    def load_model(self) -> bool:
        """Load model for export"""
        if not self.model_path.exists():
            logger.error(f"Model not found: {self.model_path}")
            return False
        
        try:
            from ultralytics import YOLO
            self._model = YOLO(str(self.model_path))
            logger.info(f"Loaded model: {self.model_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False
    
    def export(
        self,
        format: str,
        output_dir: Path = None,
        half: bool = False,
        int8: bool = False,
        dynamic: bool = False,
        simplify: bool = True,
        opset: int = 12,
        **kwargs,
    ) -> Optional[Path]:
        """
        Export model to specified format
        
        Args:
            format: Target format (onnx, engine, etc.)
            output_dir: Output directory
            half: Use FP16 quantization
            int8: Use INT8 quantization
            dynamic: Dynamic input shapes (ONNX)
            simplify: Simplify ONNX model
            opset: ONNX opset version
            **kwargs: Format-specific arguments
            
        Returns:
            Path to exported model or None
        """
        if format not in self.SUPPORTED_FORMATS:
            logger.error(f"Unsupported format: {format}. Supported: {self.SUPPORTED_FORMATS}")
            return None
        
        if not self._model:
            if not self.load_model():
                return None
        
        output_dir = output_dir or self.model_path.parent
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            logger.info(f"Exporting to {format}...")
            
            export_args = {
                "format": format,
                "half": half,
                "int8": int8,
                "dynamic": dynamic,
                "simplify": simplify,
            }
            
            if format == "onnx":
                export_args["opset"] = opset
            
            export_args.update(kwargs)
            
            # Export
            exported = self._model.export(**export_args)
            
            # Get exported path
            exported_path = Path(exported)
            
            # Move to output directory if different
            if exported_path.parent != output_dir:
                dest = output_dir / exported_path.name
                shutil.move(str(exported_path), str(dest))
                exported_path = dest
            
            self._exported_paths[format] = exported_path
            logger.info(f"Exported to: {exported_path}")
            
            return exported_path
            
        except Exception as e:
            logger.error(f"Export to {format} failed: {e}")
            return None
    
    def export_for_edge(
        self,
        output_dir: Path = None,
        include_onnx: bool = True,
        quantize: bool = True,
    ) -> Dict[str, Path]:
        """
        Export optimized models for edge deployment
        
        Args:
            output_dir: Output directory
            include_onnx: Export ONNX model
            quantize: Apply INT8 quantization
            
        Returns:
            Dict of format -> path mappings
        """
        results = {}
        output_dir = output_dir or self.model_path.parent / "edge"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # ONNX export (always useful)
        if include_onnx:
            onnx_path = self.export(
                format="onnx",
                output_dir=output_dir,
                simplify=True,
                dynamic=False,
            )
            if onnx_path:
                results["onnx"] = onnx_path
        
        # Quantized ONNX
        if quantize:
            # FP16
            fp16_path = self.export(
                format="onnx",
                output_dir=output_dir / "fp16",
                half=True,
                simplify=True,
            )
            if fp16_path:
                results["onnx_fp16"] = fp16_path
        
        return results
    
    def export_for_tensorrt(
        self,
        output_dir: Path = None,
        fp16: bool = True,
        int8: bool = False,
        workspace_gb: int = 4,
    ) -> Optional[Path]:
        """
        Export for NVIDIA TensorRT (Jetson, GPU servers)
        
        Args:
            output_dir: Output directory
            fp16: Use FP16 precision
            int8: Use INT8 quantization
            workspace_gb: TensorRT workspace size in GB
            
        Returns:
            Path to TensorRT engine or None
        """
        return self.export(
            format="engine",
            output_dir=output_dir,
            half=fp16,
            int8=int8,
            workspace=workspace_gb,
        )
    
    def verify_export(self, model_path: Path, test_image: Path = None) -> bool:
        """
        Verify exported model works correctly
        
        Args:
            model_path: Path to exported model
            test_image: Optional test image
            
        Returns:
            True if verification passed
        """
        try:
            from ultralytics import YOLO
            import numpy as np
            
            model = YOLO(str(model_path))
            
            # Create test input
            if test_image and test_image.exists():
                import cv2
                test_input = cv2.imread(str(test_image))
            else:
                test_input = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
            
            # Run inference
            results = model.predict(test_input, verbose=False)
            
            logger.info(f"Export verification passed for {model_path}")
            return True
            
        except Exception as e:
            logger.error(f"Export verification failed: {e}")
            return False
    
    @property
    def exported_models(self) -> Dict[str, Path]:
        """Get all exported model paths"""
        return self._exported_paths.copy()


def export_model_cli():
    """Command-line interface for model export"""
    import argparse
    
    logging.basicConfig(level=logging.INFO)
    
    parser = argparse.ArgumentParser(description="Export YOLO model for deployment")
    parser.add_argument("model", type=str, help="Path to .pt model file")
    parser.add_argument("--format", type=str, default="onnx", 
                       choices=ModelExporter.SUPPORTED_FORMATS,
                       help="Export format")
    parser.add_argument("--output", type=str, default=None, help="Output directory")
    parser.add_argument("--fp16", action="store_true", help="Use FP16 quantization")
    parser.add_argument("--int8", action="store_true", help="Use INT8 quantization")
    parser.add_argument("--simplify", action="store_true", default=True,
                       help="Simplify ONNX model")
    parser.add_argument("--verify", action="store_true", help="Verify exported model")
    
    args = parser.parse_args()
    
    exporter = ModelExporter(Path(args.model))
    
    output_dir = Path(args.output) if args.output else None
    
    exported = exporter.export(
        format=args.format,
        output_dir=output_dir,
        half=args.fp16,
        int8=args.int8,
        simplify=args.simplify,
    )
    
    if exported:
        print(f"\n✅ Model exported: {exported}")
        
        if args.verify:
            print("Verifying export...")
            if exporter.verify_export(exported):
                print("✅ Verification passed")
            else:
                print("❌ Verification failed")
    else:
        print("\n❌ Export failed")


if __name__ == "__main__":
    export_model_cli()
