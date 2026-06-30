# Ollama Errors & Fixes

## Quick Diagnostic

```bash
# Run this to see exactly what's wrong:
devdiff doctor
```

---

## ❌ Error: "model 'llama3.1:8b' not found"

### What This Means
You have Ollama installed but **the specific AI model is not downloaded**.
Ollama is the engine — models are separate files (2-4GB each).

### Fix

```bash
# 1. Verify Ollama is running
ollama list
# Should show your installed models (may be empty)

# 2. Pull the model your config expects
ollama pull llama3.2:3b     # ~2GB — fast, works on most machines
# OR
ollama pull llama3.1:8b     # ~4GB — better quality, needs more RAM

# 3. Verify it's installed
ollama list
# Should now show: llama3.2:3b

# 4. Test it works
ollama run llama3.2:3b "Say hello"
# Should respond with text

# 5. Now try DevDiff
devdiff generate
```

### Which Model Should I Use?

| Model | Size | RAM Needed | Speed | Quality | Best For |
|-------|------|------------|-------|---------|----------|
| `llama3.2:3b` | 2GB | 4GB | Fast | Good | Most users |
| `llama3.1:8b` | 4GB | 8GB | Medium | Better | Complex analysis |
| `codellama:13b` | 7GB | 16GB | Slow | Best | Security reviews |

**Start with `llama3.2:3b` — it's the default and works on most machines.**

---

## ❌ Error: "ECONNREFUSED" or "fetch failed"

### What This Means
Ollama is not running. The app is installed but the service isn't active.

### Fix

#### Windows
```powershell
# Check if Ollama is running
Get-Process ollama -ErrorAction SilentlyContinue

# If not running:
# 1. Open Start Menu
# 2. Search "Ollama"
# 3. Click the Ollama app (white llama icon)
# 4. Wait for icon to appear in system tray
# 5. Try again: devdiff generate

# Or start from command line:
& "C:\Program Files\Ollama\ollama.exe" serve

# Verify it's working:
curl http://localhost:11434/api/tags
```

#### macOS
```bash
# Check if running
ps aux | grep ollama

# Start Ollama
ollama serve

# Or if installed via brew:
brew services start ollama
```

#### Linux
```bash
# Check if running
systemctl status ollama

# Start Ollama
sudo systemctl start ollama

# Enable on boot
sudo systemctl enable ollama
```

---

## ❌ Error: "Ollama not found"

### What This Means
Ollama is not installed on your system.

### Fix

#### Windows
1. Download from [ollama.com/download/windows](https://ollama.com/download/windows)
2. Run the installer (OllamaSetup.exe)
3. After install, open PowerShell:
```powershell
ollama pull llama3.2:3b
```

#### macOS
```bash
brew install ollama
ollama serve &
ollama pull llama3.2:3b
```

#### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2:3b
```

---

## ❌ Error: "Out of memory" or crash during generation

### What This Means
The model is too large for your available RAM.

### Fix
```bash
# Use smaller model
ollama pull llama3.2:1b    # Only ~1GB
ollama pull llama3.2:3b    # ~2GB

# Update config to use smaller model
# .devdiff.config.js
export default {
  ai: {
    providers: [
      { name: 'local-small', url: 'ollama://llama3.2:1b', priority: 1 }
    ]
  }
}
```

---

## ✅ Verify Everything Works

```bash
# Complete health check
devdiff doctor

# Expected output:
# ✅ Node.js v22.4.1
# ✅ Git 2.45.0
# ✅ Ollama installed: v0.3.0
# ✅ Ollama running: http://localhost:11434
# ✅ Models available: llama3.2:3b
# ✅ Model responds: "Hello from Ollama!"
# ✅ DevDiff config valid
# ✅ Git repository detected
# ✅ Staged changes: 3 files
# 
# 🎉 All checks passed! Run: devdiff generate
```
