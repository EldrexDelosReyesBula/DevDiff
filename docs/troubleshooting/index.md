# Troubleshooting

## Quick Diagnostic

```bash
devdiff doctor
```

This checks everything and tells you what's wrong.

---

## Common Errors by Symptom

### "No changes detected"

**Problem:** DevDiff says there's nothing to analyze.

**Solutions:**

1. Did you stage your changes?
   ```bash
   git add .
   devdiff generate
   ```
2. Did you commit without staging new changes?
   ```bash
   # Make a change first
   echo "// test" >> anyfile.js
   git add anyfile.js
   devdiff generate
   ```
3. Is this a fresh repo with only one commit?
   ```bash
   # DevDiff compares staged changes to last commit
   # Make a change, stage it, then run devdiff generate
   ```

---

### "Not a git repository"

**Problem:** You're not in a folder with `.git`.

**Solutions:**

```bash
git init
git add .
git commit -m "initial commit"
devdiff init
devdiff generate
```

---

### "Unknown option --persona"

**Problem:** The persona flag isn't recognized.

**Solutions:**

```bash
# Use the correct syntax:
devdiff generate --persona developer    # ✅
devdiff generate -p ceo                 # ✅ (short form)

# NOT:
devdiff generate --persona              # ❌ (missing value)
devdiff generate persona developer      # ❌ (wrong order)
```

**Valid personas:** `developer`, `ceo`, `educator`, `robot`, `data-analyst`, `journalist`, `pm`, `compliance`

---

### AI errors (Ollama, OpenAI, etc.)

See dedicated guides:

- [Ollama Errors](./ollama-errors)
- [Network Errors](./network-errors)

---

## Platform-Specific Issues

- [Windows Issues](./windows-issues)
- [macOS Issues](./macos-issues)
- [Linux Issues](./linux-issues)

