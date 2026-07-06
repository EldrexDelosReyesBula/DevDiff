# Fixing Ollama Timeouts

## Why Does DevDiff Time Out?

Ollama processes AI requests on your machine. Large diffs (many files, 
many lines) need more processing time. A 30-second timeout may be too 
short for 70+ files.

## Quick Fix

```bash
# Use minimal depth for faster results
devdiff generate --depth minimal

# Or process fewer files at once
git add src/auth/     # Stage only one directory
devdiff generate
git add src/api/      # Then stage the next
devdiff generate
```

## Permanent Fixes

### 1. Increase Timeout

```javascript
// .devdiff.config.js
export default {
  ai: {
    ollama: {
      timeout: 120000  // 2 minutes (in milliseconds)
    }
  }
}
```

### 2. Use a Faster Model

```bash
# Smaller models are faster (but less detailed)
ollama pull llama3.2:1b  # Very fast, basic analysis

# Update config
# .devdiff.config.js
export default {
  ai: {
    providers: [
      { url: 'ollama://llama3.2:1b', priority: 1 }
    ]
  }
}
```

### 3. Enable Chunking

DevDiff v1.0.5+ automatically splits large diffs into chunks.
No configuration needed — it detects when chunking is necessary.

### 4. Check Your Hardware

| Problem | Symptom | Fix |
|---------|---------|-----|
| Low RAM | System slows during AI | Close other apps, use smaller model |
| Slow CPU | AI takes >2 min | Use cloud AI (OpenAI, Anthropic) |
| Disk I/O | Model loading is slow | Move models to SSD |

## Still Timing Out?

1. Run `devdiff doctor` for diagnostics
2. Check Ollama logs: `ollama logs`
3. Try a simple test: `ollama run llama3.2:3b "hello"`
4. If simple test works but DevDiff doesn't, [report an issue](https://github.com/eldrex/devdiff/issues)
