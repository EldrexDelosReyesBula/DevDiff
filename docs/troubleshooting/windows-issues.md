# Windows-Specific Troubleshooting Guide (v1.6.0)

This guide covers common errors, path resolution issues, and performance optimizations for DevDiff on Windows 10, Windows 11, and WSL2 environments.

---

## 🛠️ PowerShell Execution Policy Errors

**Symptom:** `devdiff : File C:\Users\...\AppData\Roaming\npm\devdiff.ps1 cannot be loaded because running scripts is disabled on this system.`

**Solution:** Enable local script execution for your user account:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🔀 Line Ending Warnings (CRLF vs. LF)

**Symptom:** `warning: LF will be replaced by CRLF in ...`

This warning is harmless. DevDiff's AST parser handles both CRLF (`\r\n`) and LF (`\n`) line endings transparently. To normalize Git line endings on Windows:

```bash
git config --global core.autocrlf true
```

---

## 🦙 Ollama Connection & Port 11434 on Windows

### 1. Verification Checklist
- Check if Ollama is running in the Windows System Tray (bottom-right notification area, `^` icon).
- If not running, open **Ollama** from the Windows Start Menu.

### 2. Port 11434 Collisions
If port 11434 is blocked or claimed by another application:

```powershell
# Identify the process occupying port 11434
netstat -ano | findstr :11434

# Terminate the process by PID (replace [PID] with actual number)
taskkill /PID [PID] /F
```

### 3. Windows Firewall Rules
If Ollama is blocked from local HTTP connections:

```powershell
# Add Windows Firewall rule for Ollama
New-NetFirewallRule -DisplayName "Ollama Local Service" -Direction Inbound -LocalPort 11434 -Protocol TCP -Action Allow
```

---

## 🐧 WSL2 (Windows Subsystem for Linux) Cross-FileSystem Paths

**Symptom:** Slow performance when accessing Windows file mounts (`/mnt/c/Users/...`) inside WSL2.

**Best Practice:**
- Place your Git repositories inside the native WSL2 Linux filesystem (`/home/username/projects/`) rather than `/mnt/c/`.
- Access VS Code natively in WSL2 by running `code .` inside the WSL2 terminal.

---

## 🖥️ VS Code Extension Output Channel & Host Diagnostics

If the VS Code extension does not detect staged changes on Windows:

1. Press `Ctrl+Shift+P` to open the Command Palette.
2. Select **DevDiff: Show Output Panel** to inspect real-time extension diagnostic logs.
3. Ensure your workspace root contains a `.git` folder.
4. Reload VS Code window: `Ctrl+Shift+P` $\rightarrow$ **Developer: Reload Window**.
