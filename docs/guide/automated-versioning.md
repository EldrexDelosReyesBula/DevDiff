# Getting Started with Automated Versioning & Release

This guide explains how to use DevDiff's **Automated Versioning Engine** to bump package versions and maintain CHANGELOG.md files based on code deltas.

---

## ⚡ Quick Start

### Step 1: Preview Version Bump Plan

Run `devdiff version bump --dry-run` to inspect detected change reasons and planned version bump:

```bash
devdiff version bump --dry-run
```

---

### Step 2: Execute Release

Execute a one-command release with `devdiff release`:

```bash
devdiff release
```

*Output:*
```text
[lucide:box] Current version: v1.5.0
[lucide:clipboard-list] DevDiff Version Bump Plan:
──────────────────────────────────────────────
   Type: MINOR
   From: v1.5.0
   To:   v1.6.0

[lucide:arrow-up-circle] Bumping version to v1.6.0...
   [lucide:check] package.json updated
[lucide:file-text] Generating CHANGELOG.md...
   [lucide:check] CHANGELOG.md updated
   [lucide:check] Tag v1.6.0 created
   [lucide:check] Pushed to remote repository

[lucide:check-circle] Release complete! v1.6.0 ready.
```
