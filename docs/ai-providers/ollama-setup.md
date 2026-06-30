# Ollama Setup Guide

## What is Ollama?

Ollama runs AI models **entirely on your computer**. No internet required.
No API keys. No data leaves your machine. It's the default AI provider for DevDiff.

## Step-by-Step Setup

### 1. Install Ollama

| Platform | Instructions |
|----------|-------------|
| **Windows** | [Download installer](https://ollama.com/download/windows) → Run OllamaSetup.exe |
| **macOS** | `brew install ollama` or [download .dmg](https://ollama.com/download/mac) |
| **Linux** | `curl -fsSL https://ollama.com/install.sh \| sh` |

### 2. Pull a Model

```bash
# Recommended: llama3.2 3B (2GB, works on most machines)
ollama pull llama3.2:3b

# Better quality (4GB, needs 8GB RAM)
ollama pull llama3.1:8b

# Code specialist (7GB, needs 16GB RAM)
ollama pull codellama:13b
```

### 3. Verify

```bash
# Check installed models
ollama list

# Test the model
ollama run llama3.2:3b "Explain what git diff does in one sentence"

# Should respond with something like:
# "Git diff shows the changes between commits, branches, or the working directory..."
```

### 4. Configure DevDiff

DevDiff auto-detects Ollama. If it's running on `localhost:11434`, no config needed.

```javascript
// .devdiff.config.js — explicit config (optional)
export default {
  ai: {
    providers: [
      {
        name: 'local-ollama',
        url: 'ollama://llama3.2:3b',  // Model to use
        priority: 1                     // Try first
      }
    ]
  }
}
```

### 5. Generate Changelog

```bash
devdiff generate
```

---

## Which Model Should I Choose?

```
┌──────────────────────────────────────────────────────────────┐
│  Start here: ollama pull llama3.2:3b                         │
│                                                              │
│  Need better quality? → ollama pull llama3.1:8b              │
│  Doing security reviews? → ollama pull codellama:13b         │
│  Low on RAM (<8GB)? → ollama pull llama3.2:1b                │
└──────────────────────────────────────────────────────────────┘
```

---

## Common Questions

**Q: Do I need internet after downloading the model?**
A: No. Once the model is pulled, everything works offline.

**Q: How much disk space do I need?**
A: 2GB for llama3.2:3b, 4GB for llama3.1:8b, 7GB for codellama:13b.

**Q: Can I use multiple models?**
A: Yes. DevDiff can route to different models based on complexity.

**Q: Is it really free?**
A: Yes. Ollama is open-source. Models are free. No API costs.
