# Quick Fixes Reference

## The "Fix Everything" Sequence

```bash
# 1. Health check
devdiff doctor

# 2. Ensure git repo
git status

# 3. Make a test change
echo "// test $(date)" >> test.js

# 4. Stage it
git add test.js

# 5. Dry run (no AI needed)
devdiff generate --dry-run

# 6. If dry run works, try with AI
devdiff generate --persona developer
```

---

## Fix by Symptom

| Symptom | Quick Fix |
|---------|-----------|
| Nothing happens | `devdiff --version` (check install) |
| No changes detected | `git add .` then try again |
| Unknown option error | Check spelling: `devdiff --help` |
| Ollama not found | Install: [ollama.com](https://ollama.com) |
| Model not found | `ollama pull llama3.2:3b` |
| Connection refused | Start Ollama app |
| Permission denied | `chmod +x` on Linux/macOS, run as admin on Windows |
| Out of memory | Use smaller model: `ollama pull llama3.2:1b` |
| VS Code not working | Reload window: `Ctrl+Shift+P` → `Reload Window` |
| Config not loading | Check `.devdiff.config.js` syntax |

---

## Reset Everything

```bash
# Remove DevDiff from project
rm -rf .devdiff
rm .devdiff.config.js
rm .devdiffignore

# Reinstall CLI
npm uninstall -g @eldrex/cli
npm install -g @eldrex/cli

# Fresh init
devdiff init
```

---

## Still Stuck?

1. Run `devdiff doctor` and share output
2. Check [GitHub Issues](https://github.com/eldrex/devdiff/issues)
3. Join [Discord](https://discord.gg/devdiff)
4. Include: OS, Node version, DevDiff version, error message
