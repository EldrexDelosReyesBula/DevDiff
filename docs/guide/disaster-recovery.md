# Disaster Recovery & Workspace Rollbacks

DevDiff provides an automated local **Disaster Recovery Engine** to protect developer codebases against broken AI refactoring, corrupt AST states, or unapproved multi-file edits.

---

## 🎯 How Checkpoints Work

DevDiff automatically records a snapshot fingerprint before executing any AI-assisted operation:

```
💾 Created Pre-AI Checkpoint: ckpt-1719000300-def456
```

Snapshots reside locally inside `.devdiff/memory/snapshots/` and are strictly private to your local workstation.

---

## 🚀 Recovery Steps

### Step 1: List Available Checkpoints

```bash
devdiff recover list
```

Output:
```
Available Workspace Checkpoints:
  ID: ckpt-1719000300-def456  Time: 2026-08-08 22:10:00  Files: 5
  ID: ckpt-1719000120-abc123  Time: 2026-08-08 22:05:00  Files: 2
```

### Step 2: Restore a Specific Checkpoint

```bash
# Revert workspace to pre-AI state
devdiff recover --checkpoint ckpt-1719000300-def456
```

---

## 🧹 Clearing Old Checkpoints

To free local disk space, clear historical recovery snapshots:

```bash
# Delete recovery snapshots older than 24 hours
devdiff recover clean --older-than 24h
```
