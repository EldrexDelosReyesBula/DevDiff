# WebGPU & Local In-Process Inference Guide

DevDiff supports running open-source LLMs locally using hardware GPU acceleration via **WebGPU** (WebLLM) and in-process CPU execution via **ONNX / Transformers.js**.

---

## 🎯 Supported In-Process Engines

### 1. WebGPU / WebLLM Engine
Runs quantized MLC model weights directly inside browser webview shaders or Electron environments using host GPU hardware acceleration (Apple Silicon Metal, NVIDIA CUDA, AMD ROCm, Intel Arc).

- **Performance**: Up to **110 tokens/sec** on Apple M2/M3 GPUs.
- **Privacy**: 100% on-device, zero network traffic.

### 2. Transformers.js / ONNX Engine
Runs ONNX quantized models (`Qwen1.5-0.5B`, `Phi-3-Mini`) inside Node.js worker threads without external background processes.

---

## ⚙️ Configuration Setup

Configure WebGPU or Transformers.js in `.devdiff/config.json`:

```json
{
  "ai": {
    "defaultProvider": "webllm-local",
    "providers": [
      {
        "name": "webllm-local",
        "url": "webllm://Llama-3.2-1B-Instruct-q4f16_1-MLC",
        "priority": 1
      }
    ]
  }
}
```
