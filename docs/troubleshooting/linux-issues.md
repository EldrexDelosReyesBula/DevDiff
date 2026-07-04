# Linux-Specific Issues

## Installing Ollama on Linux

```bash
# Official installer (recommended)
curl -fsSL https://ollama.com/install.sh | sh

# After install, start the service
sudo systemctl start ollama
sudo systemctl enable ollama   # Auto-start on boot

# Pull a model
ollama pull llama3.2:3b
```

---

## Ollama Service Not Starting

```bash
# Check service status
systemctl status ollama

# View logs for errors
journalctl -u ollama -n 50

# Restart the service
sudo systemctl restart ollama

# If it fails, try running manually first
ollama serve
```

---

## "Permission Denied" on /dev/kfd or /dev/dri (GPU issues)

If you have a GPU and Ollama can't access it:

```bash
# Add your user to the video and render groups
sudo usermod -aG video $USER
sudo usermod -aG render $USER

# Log out and log back in, then verify
groups $USER
```

---

## npm Global Install Permission Error

Avoid using `sudo npm install -g`. Instead, use nvm:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc  # or ~/.zshrc

# Install Node.js
nvm install 22
nvm use 22

# Now install without sudo
npm install -g @eldrex/cli
```

---

## Firewall Blocking Ollama (Port 11434)

If Ollama can't listen on port 11434:

```bash
# Check if port is in use
ss -tlnp | grep 11434

# Allow port through firewall (ufw)
sudo ufw allow 11434/tcp

# Or for firewalld:
sudo firewall-cmd --add-port=11434/tcp --permanent
sudo firewall-cmd --reload
```

---

## WSL (Windows Subsystem for Linux) Users

Running DevDiff inside WSL2 with Ollama on Windows:

```bash
# In WSL, Ollama running on Windows host is reachable via:
export OLLAMA_HOST=http://$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):11434

# Add to your ~/.bashrc or ~/.zshrc to persist
echo 'export OLLAMA_HOST=http://$(cat /etc/resolv.conf | grep nameserver | awk '"'"'{print $2}'"'"'):11434' >> ~/.bashrc
source ~/.bashrc

# Verify connection
curl $OLLAMA_HOST/api/tags
```

> **Note:** For best WSL performance, install Ollama inside WSL directly rather than using the Windows version.

---

## AppArmor / SELinux Blocking Ollama

Some distributions (Ubuntu with strict AppArmor, Fedora with SELinux) may block Ollama:

```bash
# Check for AppArmor denials
sudo aa-status
sudo dmesg | grep -i apparmor

# Temporarily put AppArmor in complain mode for testing
sudo aa-complain /usr/bin/ollama

# For SELinux:
sudo ausearch -c 'ollama' --raw | audit2allow -M ollama-local
sudo semodule -i ollama-local.pp
```

---

## Low Memory Linux Servers

If running on a VPS or server with limited RAM:

```bash
# Use the smallest model
ollama pull llama3.2:1b

# Check available memory before pulling
free -h

# Set swap space if needed (at least 4GB for 3b model)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Still Stuck?

Collect diagnostics and open an issue:

```bash
uname -a              # OS info
node --version        # Node version
npm --version         # npm version
git --version         # Git version
ollama --version      # Ollama version
ollama list           # Installed models
devdiff --version     # DevDiff version
systemctl status ollama  # Service status
```

Submit at: [GitHub Issues](https://github.com/EldrexDelosReyesBula/devdiff/issues)
