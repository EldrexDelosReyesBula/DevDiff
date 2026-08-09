# DevDiff Troubleshooting Portal

## 🩺 Quick Diagnostic Command

```bash
devdiff doctor
```

Running `devdiff doctor` checks local Git status, active AI providers, network connectivity, secret scanner rules, and persistent memory health, reporting immediate resolution steps.

---

## 🛠️ Common Errors by Symptom

### 1. "No changes detected"

**Problem:** DevDiff reports zero staged changes to analyze.

**Solutions:**

1. Stage your modified files:
   ```bash
   git add .
   devdiff generate
   ```
2. If working in a new branch or testing committed history, pass the `--since` flag:
   ```bash
   devdiff generate --since "1 day ago"
   ```

---

### 2. "Not a git repository"

**Problem:** Current working directory does not contain a `.git` folder.

**Solutions:**

```bash
git init
git add .
git commit -m "initial commit"
devdiff init
devdiff generate
```

---

### 3. "Unknown option --persona"

**Syntax check:**

```bash
devdiff generate --persona developer    # ✅ Valid
devdiff generate -p ceo                 # ✅ Valid (short form)
```

**Valid Personas (v1.6.0):** `developer`, `ceo`, `educator`, `robot`, `data-analyst`, `journalist`, `pm`, `compliance`

---

### 4. Memory Index Not Updating

**Problem:** `devdiff ask` returns outdated file context.

**Solutions:**

```bash
# Force full codebase rescan
devdiff memory rescan --full

# Check memory index status
devdiff memory status
```

---

## 📖 Specialized Troubleshooting Guides

- 🪟 [Windows-Specific Issues](./windows-issues) — PowerShell execution policy, line endings, firewall ports, WSL2.
- 🍏 [macOS Issues](./macos-issues) — Keychain permissions, Homebrew Ollama service, Apple Silicon WebGPU acceleration.
- 🐧 [Linux Issues](./linux-issues) — Systemd services, user permissions, headless server configuration.
- 🦙 [Ollama Errors](./ollama-errors) — Local model pulling, memory limits, daemon connection issues.
- 🌐 [Network Errors](./network-errors) — API key configuration, proxy setups, offline-first fallback.
- 📖 [DevDiff Dictionary](/guide/dictionary) — Full dictionary of commands, flags, tools, settings, and ports.
