# Running UCF-Crime-DVS on CPU (Low-End PC)

## Setup Complete ✓

The environment is now configured for CPU-only execution.

## Prerequisites

1. **Download Pre-trained Features** (required before running):
   - Get from Baidu or OneDrive links in [README.md](README.md)
   - Extract to a folder, e.g., `/home/prasanth/ucf_crime_features/`
   - You need the `feature_hardvs` files for training

2. **Activate Virtual Environment**:
```bash
cd /home/prasanth/CIVIC_AI_SHIELD
source .venv/bin/activate
```

## Running the Training

```bash
cd /home/prasanth/CIVIC_AI_SHIELD/UCF-Crime-DVS/train

python main.py \
  --dataset_path /path/to/your/ucf_crime_features \
  --feature_modal feature_hardvs \
  --batch_size 1 \
  --max_epoch 20 \
  --lr 0.0001
```

Replace `/path/to/your/ucf_crime_features` with the actual path where you extracted the features.

## CPU Optimizations Applied

- ✓ Forced CPU device (no CUDA calls)
- ✓ Disabled pin_memory (GPU-only feature)
- ✓ Set num_workers=0 (avoids multiprocessing overhead)
- ✓ Installed CPU-only PyTorch wheels
- ✓ Removed cupy dependency (CUDA-only)

## Performance Notes

- Training will be **significantly slower** on CPU (10-100x vs GPU)
- For a low-end PC, consider:
  - Using pre-trained checkpoints for inference only
  - Reducing `--max_epoch` to 5-10 for testing
  - Testing on a smaller subset first
  - Running overnight for full training

## Testing a Pre-trained Model

If you have a checkpoint:

```bash
python main.py \
  --dataset_path /path/to/features \
  --feature_modal feature_hardvs \
  --pretrained_ckpt /path/to/checkpoint.pth
```

## Troubleshooting

- **Out of memory**: Reduce batch_size or sample_size in options.py
- **Too slow**: Use fewer epochs or pre-trained weights
- **Import errors**: Ensure all deps installed: `pip list | grep -E 'torch|timm|scipy'`
