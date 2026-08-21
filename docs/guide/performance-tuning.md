# Performance Tuning & Workstation Optimization

DevDiff is optimized to run efficiently alongside resource-heavy IDEs, Docker containers, and local compilers. This guide details techniques for tuning execution speed, memory footprint, and token budgeting on your development workstation.

---

## Performance Optimization Checklist

### 1. Enable Fast-Path Memory Queries

DevDiff builds a persistent codebase index (`.devdiff/memory/codebase-index.json`). Querying persistent memory avoids re-indexing unchanged source files, reducing response latency from 4.5s down to **< 50ms**.

```bash
# Initialize memory index once per workspace
devdiff memory init
```

### 2. Configure `.devdiffignore` File Filters

Exclude heavy build output, lockfiles, and generated assets from AST processing:

```gitignore
# Exclude vendor & build output
dist/
build/
node_modules/
*.log
package-lock.json
pnpm-lock.yaml
```

### 3. Tune AI Model Selection

- Use lightweight models (`ollama://llama3.2:3b` or `openai://gpt-4o-mini`) for routine pre-commit checks.
- Reserve larger models (`anthropic://claude-3-5-sonnet` or `gemini://gemini-1.5-pro`) for major release merges.

### 4. Configure `IDEGuardian` Memory Ceiling

In VS Code, adjust background worker thread memory settings in `.devdiff/config.json`:

```json
{
  "performance": {
    "memoryCapMb": 256,
    "idleDetectionSeconds": 5,
    "taskTimeoutSeconds": 120
  }
}
```
