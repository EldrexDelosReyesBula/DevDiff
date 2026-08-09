# Developer Troubleshooting Guide

This guide provides solutions for common issues, error messages, and environment configurations encountered when using DevDiff CLI, VS Code Extension, or MCP Server.

---

## 🔍 Common Issues & Resolutions

### 1. Local LLM / Ollama Connection Refused (`ECONNREFUSED 127.0.0.1:11434`)

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:11434
```

**Resolution:**
1. Verify the Ollama daemon is running:
   ```bash
   ollama serve
   ```
2. Verify the requested model is pulled locally:
   ```bash
   ollama list
   # If missing, pull the model:
   ollama pull llama3.2:3b
   ```
3. Verify your `.devdiff/config.json` uses the `ollama://` URL prefix:
   ```json
   { "url": "ollama://llama3.2:3b", "baseUrl": "http://localhost:11434" }
   ```

---

### 2. MCP Port or Preview Server Port in Use (`EADDRINUSE`)

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::4173
```

**Resolution:**
Specify an alternative open port when launching dev or preview servers:

```bash
# Specify custom port
npm run docs:preview -- --port 5000

# Or terminate the occupying process on Windows:
Get-Process -Id (Get-NetTCPConnection -LocalPort 4173).OwningProcess | Stop-Process -Force
```

---

### 3. Missing Codebase Memory Index (`.devdiff/memory/codebase-index.json`)

**Symptom:**
```
Warning: Codebase memory index not initialized.
```

**Resolution:**
Initialize or refresh the persistent memory index for your workspace:

```bash
devdiff memory init
```

---

### 4. API Key Not Found Error

**Symptom:**
```
Error: Missing API key for cloud provider 'openai-cloud'.
```

**Resolution:**
Supply your API key via environment variables or configuration:

```bash
export OPENAI_API_KEY="sk-proj-..."
# OR configure via CLI:
devdiff auth add --provider openai --key "sk-proj-..."
```
