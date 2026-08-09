# Transformers.js / ONNX Setup Guide

DevDiff supports running open-source models in-process using `@xenova/transformers` (ONNX runtime). This provider enables **zero-dependency, local AI execution** directly within Node.js worker threads without an external Ollama daemon.

---

## ⚙️ Configuration Setup

### `.devdiff.config.js` Setup

```javascript
export default {
  ai: {
    providers: [
      {
        name: "transformers-local",
        url: "transformers://Xenova/Qwen1.5-0.5B-Chat",
        quantization: "q4",
        priority: 1,
      },
    ],
  },
};
```
