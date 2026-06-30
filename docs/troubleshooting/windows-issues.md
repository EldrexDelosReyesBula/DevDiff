# Windows-Specific Issues

## PowerShell Execution Policy

**Error:** "Running scripts is disabled on this system"

**Fix:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Line Ending Warnings (CRLF/LF)

**Warning:** "LF will be replaced by CRLF"

This is harmless. To suppress:
```bash
git config core.autocrlf true
```

---

## Ollama Not Starting

1. Check if Ollama is in system tray (bottom-right, ^ icon)
2. If not, run Ollama from Start Menu
3. If "Ollama.exe" missing, reinstall from [ollama.com](https://ollama.com/download/windows)

---

## Port 11434 Already in Use

```powershell
# Find what's using port 11434
netstat -ano | findstr :11434

# Kill the process (replace PID with actual number)
taskkill /PID [PID] /F

# Restart Ollama
```

---

## VS Code Extension Not Detecting Changes

1. Open Command Palette: `Ctrl+Shift+P`
2. Run: `DevDiff: Show Output Panel`
3. Check for error messages
4. Ensure you have a `.git` folder in your workspace root
5. Try: `Ctrl+Shift+P` → `Developer: Reload Window`
