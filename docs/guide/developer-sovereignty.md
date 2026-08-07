# Developer Sovereignty & Privacy Guarantees

DevDiff **v1.5.0** enforces strict **Developer Sovereignty**: your code and API credentials belong to you. DevDiff never makes unapproved cloud network requests, never auto-mutates developer configuration files, and never stages or commits files without explicit human approval.

---

## 🔐 The 4 Pillars of Developer Sovereignty

```
┌─────────────────────────────────────────────────────────────┐
│                 DEVELOPER SOVEREIGNTY PILLARS               │
│                                                             │
│  1. CLOUD GUARD (No Auto-Cloud AI Execution)                │
│     • API keys in env are detected, NEVER called silently.  │
│     • Explicit setup required: devdiff auth add <provider>  │
│                                                             │
│  2. FLEXIBLE IGNORE (Engine-Level Isolation)                │
│     • Internal engine files ignored dynamically.           │
│     • .devdiffignore is 100% developer-owned & untouched.  │
│                                                             │
│  3. COMMIT GUARD (No Staging or Auto-Committing)            │
│     • Generated files are NEVER auto-staged into Git.       │
│     • Explicit human git commit required.                  │
│                                                             │
│  4. LOCAL-FIRST PROCESSING (Ollama Default)                 │
│     • Runs on localhost:11434 with zero network egress.     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Pillar 1: No Auto Cloud AI (`CloudGuard`)

### The Problem
Traditional AI tools detect environment variables like `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` and silently begin sending codebase snippets over the internet without explicit developer knowledge or consent.

### The DevDiff Solution
`CloudGuard` inspects system environment variables but **blocks all automatic execution**. To use cloud providers, developers must explicitly add the provider using `devdiff auth add`.

```typescript
// packages/core/src/ai/cloud-guard.ts
export class CloudGuard {
  static isExplicitlyConfigured(provider: string, config: any): boolean {
    const p = config?.ai?.providers?.[provider];
    // Must be explicitly enabled by user command, not just env variable detection
    return Boolean(p && p.explicitlyAdded === true && p.disabled !== true);
  }
}
```

```bash
# Explicitly opt-in to a cloud provider
devdiff auth add openai --key sk-proj-1234...

# Remove or disable a cloud provider
devdiff auth remove openai
```

---

## 📂 Pillar 2: Flexible Ignore (`FlexibleIgnore`)

### Engine Exclusions vs. `.devdiffignore`
DevDiff uses operational state files (`.devdiff/cache.json`, `.devdiff/memory/codebase-index.json`, `.devdiff/security-audit.enc`) to accelerate analysis. 

Rather than polluting or overwriting your project's `.devdiffignore` file, `FlexibleIgnore` dynamically filters operational paths at the runtime engine level:

```bash
# Your .devdiffignore remains 100% clean and human-authored
# DevDiff will NEVER append lines or modify .devdiffignore
```

---

## 📦 Pillar 3: Git Commit Safety (`CommitGuard`)

DevDiff **never** automatically runs `git add` or `git commit`. 

- DevDiff-generated files (`.devdiff/`, `.devdiff.config.js`, `.devdiffignore`, `CHANGELOG.md`) remain untracked or unstaged until you explicitly choose to commit them.
- If DevDiff detects that generated engine files were accidentally staged, `CommitGuard` issues a helpful terminal alert:

```text
[lucide:alert-triangle] DevDiff Commit Guard Alert:
──────────────────────────────────────────────
  The following DevDiff engine state files are staged for git commit:
  • .devdiff/memory/codebase-index.json

  To keep your repository clean, unstage state files:
  git restore --staged .devdiff/memory/
```

---

## ⚡ Summary Checklist

| Principle | DevDiff Behavior |
| :--- | :--- |
| **API Keys in `.env`** | Detected but **BLOCKED** until `devdiff auth add` |
| **`.devdiffignore` Editing** | **NEVER** modified by DevDiff |
| **Git Staging & Commits** | **NEVER** auto-staged or auto-committed |
| **Code Privacy** | Processed 100% locally via Ollama by default |
