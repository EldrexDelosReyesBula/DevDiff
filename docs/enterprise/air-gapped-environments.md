# Air-Gapped Environments

DevDiff is designed to function in highly secure, air-gapped environments that have no external internet access.

---

## 🛠️ Setting up DevDiff Offline

### 1. Local VSIX Installation

For developer workstations lacking external internet access, download the packaged VS Code extension `.vsix` bundle and install it directly:

1. Obtain the `.vsix` from your organization's internal artifact registry or the [releases page](https://github.com/EldrexDelosReyesBula/devdiff/releases).
2. Install via VS Code Extensions panel: **Install from VSIX...**

### 2. Local Model Provisioning

Pre-load target models onto workstations:

- Copy Ollama model weights to:
  - Windows: `%USERPROFILE%\.ollama\models`
  - Linux/Mac: `~/.ollama/models`
- DevDiff will automatically discover and run inferences against these local models on startup.
