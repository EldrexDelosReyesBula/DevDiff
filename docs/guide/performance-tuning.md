# Performance Tuning

DevDiff's performance depends on hardware capabilities, model selections, and configuration profiles.

---

## ⚡ Tuning Tips

### 1. Hardware Acceleration for Ollama

Make sure Ollama is leveraging your GPU (NVIDIA CUDA or Apple Silicon Metal) rather than running purely on the CPU.
- **Mac:** Metal acceleration is enabled automatically.
- **Windows/Linux:** Verify that GPU drivers and CUDA are installed. Running `ollama ps` or checking CPU usage during generation helps confirm if hardware acceleration is active.

### 2. Fast Path Optimization

DevDiff bypasses the AI provider entirely for trivial changes like formatting corrections, comment updates, and package-lock adjustments:

```javascript
// .devdiff.config.js
export default {
  optimizations: {
    fastPath: true // skips LLM for comment-only / formatting changes
  }
};
```

### 3. Response Temperature Tuning

Set lower temperatures for deterministic, structural code explanations to prevent LLM hallucinations:

```javascript
// .devdiff.config.js
export default {
  ai: {
    temperature: 0.1
  }
};
```
