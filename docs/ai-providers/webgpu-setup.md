# WebGPU (Browser) Inference

Run AI models directly in your browser using your GPU — no server, no API, no internet required after the model is cached.

> **Experimental:** WebGPU inference is available in Chrome 113+ and Edge 113+. Firefox support is in progress.

---

## What is WebGPU Inference?

WebGPU allows JavaScript to run compute workloads on your GPU directly in the browser. DevDiff uses this via [Transformers.js](https://github.com/xenova/transformers.js) to run quantized language models in-browser.

**Benefits:**

- ✅ 100% private — no data leaves your machine
- ✅ No Ollama or server required
- ✅ GPU-accelerated (fast on modern hardware)
- ✅ Works in air-gapped environments

**Limitations:**

- ❌ Requires Chrome 113+ or Edge 113+ (not Firefox yet)
- ❌ Model quality limited by browser memory constraints
- ❌ First run downloads the model (~500MB–2GB)

---

## Browser Requirements

| Browser         | WebGPU Support | Status       |
| --------------- | -------------- | ------------ |
| Chrome 113+     | ✅ Full        | Recommended  |
| Edge 113+       | ✅ Full        | Supported    |
| Firefox Nightly | ⚠️ Partial     | Experimental |
| Safari 17.4+    | ⚠️ Partial     | Limited      |

```bash
# Check if your browser supports WebGPU
# Open the browser console and run:
navigator.gpu !== undefined
# true = supported
```

---

## Setup

### 1. Enable WebGPU (if needed)

**Chrome:** WebGPU is enabled by default in Chrome 113+. No action needed.

**Edge:** WebGPU is enabled by default in Edge 113+.

**Chrome (older):** Enable via flags:

1. Open `chrome://flags`
2. Search "WebGPU"
3. Enable `#enable-unsafe-webgpu`
4. Restart Chrome

### 2. Configure DevDiff

```javascript
// .devdiff.config.js
export default {
  ai: {
    providers: [
      {
        name: "webgpu-browser",
        url: "webgpu://Xenova/Phi-3.5-mini-instruct",
        priority: 1,
      },
    ],
  },
};
```

### 3. First Run

On first use, the model downloads and caches in your browser's storage. Subsequent runs are instant.

```bash
devdiff generate
# First run: downloads ~600MB model
# Subsequent runs: loads from cache in ~2 seconds
```

---

## Available WebGPU Models

| Model                          | Size   | Quality | Best For           |
| ------------------------------ | ------ | ------- | ------------------ |
| `Xenova/Phi-3.5-mini-instruct` | ~600MB | Good    | General changelogs |
| `Xenova/Llama-3.2-1B-Instruct` | ~800MB | Good    | Fast analysis      |
| `Xenova/Qwen2.5-Coder-1.5B`    | ~900MB | Great   | Code-focused diffs |

```javascript
{
  url: "webgpu://Xenova/Phi-3.5-mini-instruct";
}
{
  url: "webgpu://Xenova/Llama-3.2-1B-Instruct";
}
{
  url: "webgpu://Xenova/Qwen2.5-Coder-1.5B";
}
```

## WebGPU IDE Integration

WebGPU inference runs 100% locally inside your IDE environment via `@eldrex/vscode` or local engine bindings without sending any data over the network.

---

## Troubleshooting

**"WebGPU not supported"**

- Update to Chrome 113+ or Edge 113+
- Check `navigator.gpu` in browser console

**"Out of memory" in browser**

- Use a smaller model (`Phi-3.5-mini` instead of larger variants)
- Close other browser tabs to free GPU memory
- Try Ollama instead for heavier models

**"Model download stuck"**

- Check browser network tab for errors
- Clear browser cache and retry
- Ensure you have enough disk space (check DevTools → Application → Storage)
