# WebGPU & WebLLM Provider API Reference

The `WebLLMProvider` in `@eldrex/core` manages hardware-accelerated local AI model inference using WebGPU shaders and MLC quantized model weights.

---

## 📦 Import Syntax

```typescript
import { WebLLMProvider, MLCModelConfig } from "@eldrex/core";
```

---

## 🛠️ Class Specifications

```typescript
const provider = new WebLLMProvider({
  model: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
  vramCapMb: 2560,
});

await provider.initializeEngine();
const result = await provider.generateExplanation(diffText, "Llama-3.2-3B");
```
