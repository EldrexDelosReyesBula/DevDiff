# Getting Started with Persistent Memory & Continuous Chat

This guide explains how to initialize, manage, and query DevDiff's **Persistent Memory Engine** in your project workspace.

---

## ⚡ Quick Start

### Step 1: Initialize Memory Index

Run `devdiff memory init` once inside your repository root:

```bash
devdiff memory init
```

*Output:*
```text
[lucide:search] Initializing codebase memory index...
   Scanning files, indexing AST entities, and building dependency graph.
   Full scan complete in 0.2s
[lucide:check-circle] Memory initialized: 476 files indexed
```

---

### Step 2: Check Memory Status

Check indexed file counts and entity breakdowns with `devdiff memory status`:

```bash
devdiff memory status
```

*Output:*
```text
[lucide:bar-chart-3] DevDiff Persistent Codebase Memory Status
──────────────────────────────────────────────
Files Indexed:        476
Lines Indexed:        46,213
Last Scan:            2026-08-07T12:22:35.598Z
Historical Snapshots: 1
Conversation Turns:   0

[lucide:layers] Indexed Entities:
  • Functions:  232
  • Classes:    125
  • Components: 7
  • Routes:     9
```

---

### Step 3: Ask Questions with Instant Memory Lookup

Query your repository using `devdiff ask`:

```bash
devdiff ask "What changed since yesterday?"
```

---

## 💬 Continuous Multi-Turn Chat

Persistent Memory tracks previous questions to resolve references automatically.

```bash
# Question 1:
devdiff ask "Show me the history of PersistentMemory"

# Question 2 (Resolves "it" to PersistentMemory):
devdiff ask "What does it depend on?"
```

---

## 🧹 Clearing & Resetting Memory

- To clear **conversation context only** (keeping codebase indices):
  ```bash
  devdiff memory clear-conversation
  ```

- To reset **all codebase memory indices and snapshots**:
  ```bash
  devdiff memory clear-all
  ```
