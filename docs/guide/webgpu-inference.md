# WebGPU Local Inference

DevDiff v1.0.1 supports WebGPU-accelerated local model inference. This allows running lightweight models (e.g. Llama 3.2 3B, Gemma 2 2B) directly on your local GPU with zero installation and zero cloud costs.

## Hardware Requirements

- **GPU**: A WebGPU-compatible GPU (e.g., Apple M-series chips, NVIDIA RTX GPUs, AMD Radeon GPUs).
- **Driver support**: Modern WebGPU backend support.

## Fallback Chain

If WebGPU is unavailable, DevDiff automatically falls back to:
1. **WebAssembly (WASM)**
2. **Native CPU**
3. **Local Ollama instance** (with download instructions)
