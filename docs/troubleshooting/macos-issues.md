# macOS-Specific Issues

## Ollama Not Running After Reboot

Ollama doesn't always auto-start on macOS. You need to start it manually or set it to run on login.

```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama service
ollama serve

# Or if installed via Homebrew:
brew services start ollama

# To auto-start on login:
brew services enable ollama
```

---

## "Permission Denied" After npm Install

If you get permission errors installing `@eldrex/cli` globally:

```bash
# Option 1: Use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22
nvm use 22
npm install -g @eldrex/cli

# Option 2: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
npm install -g @eldrex/cli
```

---

## Apple Silicon (M1/M2/M3) Notes

Ollama has native Apple Silicon support. Make sure you download the correct version:

```bash
# Check your architecture
uname -m
# arm64 = Apple Silicon, x86_64 = Intel

# Ollama auto-detects — just download from ollama.com
# Models run natively on Apple Silicon GPU (Metal)
```

> **Tip:** Apple Silicon Macs are excellent for running local AI. `llama3.1:8b` runs well on M2 with 16GB RAM.

---

## Homebrew Path Issues

If `ollama` or `devdiff` commands aren't found after install:

```bash
# Ensure Homebrew bin is in your PATH
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Or for Intel Macs:
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

## Gatekeeper / "Unverified Developer" Error

If macOS blocks the Ollama installer:

1. Open **System Settings** → **Privacy & Security**
2. Scroll to the bottom
3. Click **Open Anyway** next to the blocked app
4. Confirm in the dialog

---

## Zsh vs Bash

DevDiff and Ollama work with both shells. If commands aren't found, check which shell you're using:

```bash
echo $SHELL
# /bin/zsh or /bin/bash

# Add npm globals to your shell profile
# For zsh:
echo 'export PATH=$HOME/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# For bash:
echo 'export PATH=$HOME/.npm-global/bin:$PATH' >> ~/.bash_profile
source ~/.bash_profile
```

---

## FileVault / Security Software Interference

Some security tools (like Cisco AnyConnect, CrowdStrike, Sentinel One) can block Ollama's model downloads.

**Fixes:**

- Temporarily disable VPN while pulling models
- Add Ollama to your security software's allowlist
- Use `OLLAMA_HOST=0.0.0.0` only if needed for team setups

---

## Still Stuck?

Run the full diagnostic and share the output:

```bash
devdiff --version
node --version
git --version
ollama --version
ollama list
```

Then open an issue at [GitHub](https://github.com/EldrexDelosReyesBula/devdiff/issues) with those details.
