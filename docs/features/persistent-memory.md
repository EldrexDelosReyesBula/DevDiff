# Persistent Codebase Memory & Continuous Chat (v1.5.0)

DevDiff **v1.5.0** introduces the **Persistent Codebase Memory Engine** and **Continuous Chat Context**, transforming DevDiff from a single-run diff tool into a persistent codebase intelligence assistant with historical memory.

---

## 🎯 Key Capabilities

- **One-Time Full Scan**: Scans the workspace once and builds an indexed codebase snapshot under `.devdiff/memory/codebase-index.json`.
- **Sub-50ms Index Queries**: Instant responses for changes, entity histories, additions, purpose summaries, and dependency structures directly from memory without re-scanning code.
- **Incremental Updates**: Detects Git commit hash changes and updates only modified files incrementally in milliseconds.
- **Continuous Conversation Context**: Tracks chat turns across sessions in `.devdiff/memory/conversation-history.json`, automatically resolving pronouns (`it`, `this`, `that`) to previously discussed entities.
- **Historical Snapshot Graph**: Maintains project snapshots over time in `.devdiff/memory/snapshot-history.json`, enabling historical comparisons ("What was the project like in June?").

---

## 🚀 CLI Commands

### 1. Persistent Memory Commands (`devdiff memory`)

```bash
# Perform one-time full codebase scan and build persistent index
devdiff memory init

# View persistent memory status, indexed file counts, and entity statistics
devdiff memory status

# List snapshots in a date range or category (v1.7.0)
devdiff memory list --from 08-01 --to 08-15 --category production

# Delete memory snapshots for a specific time range (v1.7.0)
devdiff memory delete --from 03-01 --to 03-15 --dry-run

# Restrict active context to a specific period (v1.7.0)
devdiff memory use --from 04-01 --to 04-30
devdiff memory use --all

# Categorize snapshot time ranges with labels (v1.7.0)
devdiff memory categorize --from 03-01 --to 03-15 --label "experimentation"
devdiff memory categories

# Storage optimization and deduplication (v1.7.0)
devdiff memory optimize

```

### 2. Instant Memory Queries (`devdiff ask`)

```bash
# Query changes over time
devdiff ask "What changed since yesterday?"

# Query entity history timeline
devdiff ask "Show me the history of UserService"

# Query entity creation date
devdiff ask "When was the auth module added?"

# Query entity purpose
devdiff ask "What does authenticateUser do?"

# Query historical snapshot
devdiff ask "What was the project like in June?"

# Continuous chat with pronoun resolution
devdiff ask "Show me the history of PersistentMemory"
devdiff ask "What does it depend on?" # Resolves "it" to PersistentMemory
```

---

## 🧠 Memory Storage Architecture

All persistent memory assets are stored inside the project workspace under `.devdiff/memory/`:

| File Path                                   | Description                                                                   |
| :------------------------------------------ | :---------------------------------------------------------------------------- |
| `.devdiff/memory/codebase-index.json`       | Current indexed snapshot (entities, AST declarations, lines, dependency map). |
| `.devdiff/memory/snapshot-history.json`     | Array of historical codebase snapshots over time.                             |
| `.devdiff/memory/conversation-history.json` | Session conversation turns for pronoun resolution.                            |

---

## 📊 Performance Benchmark

| Operation                | Standard Re-Scan | Persistent Memory (v1.5.0) |
| :----------------------- | :--------------- | :------------------------- |
| **Initial Full Scan**    | 30–60s           | 200ms – 4s (one-time)      |
| **Incremental Update**   | 30s              | < 50ms                     |
| **Entity Lookup**        | 15–30s           | < 5ms                      |
| **Change History Query** | 20s              | < 15ms                     |
| **Context Resolution**   | N/A (Forgotten)  | < 1ms                      |
