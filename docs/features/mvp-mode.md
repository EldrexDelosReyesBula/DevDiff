# MVP Mode (Most Valuable Deferral)

Large code changes (1000+ files, vibe coding sessions) can exceed AI context windows or take a long time to analyze. DevDiff provides **MVP Mode** (Most Valuable Deferral) for a reliable, non-blocking workflow.

---

## How It Works

1. **Auto-Detection**: DevDiff checks the token size and file count of your diff before calling the AI.
2. **Deferral**: If the diff size exceeds the threshold (default: 50,000 characters or 30 files), DevDiff automatically defers AI changelog generation.
3. **Template Summary**: DevDiff prints an immediate template summary of stats (files changed, additions, deletions, affected directories, and the largest change).
4. **Local MVP Queue**: The raw diff and metadata are saved locally to `.devdiff/mvp/<id>.json`.
5. **Background / Manual Processing**: You can process these saved changes later when system resources are free or via a CLI run.

---

## CLI Commands

### Status

Check the queue status of deferred changelogs:
```bash
devdiff mvp status
```

### Process

Process the oldest queued changelog or a specific ID:
```bash
# Process next queued entry
devdiff mvp process

# Process a specific entry
devdiff mvp process --id mvp-20260701-001
```

### Process All

Process all queued entries:
```bash
devdiff mvp process-all
```

### Clear

Remove processed entries or clear all entries:
```bash
# Clear processed and failed entries
devdiff mvp clear

# Clear all entries (including queued ones)
devdiff mvp clear --all
```

---

## Configuration

You can customize the threshold limits in your configuration:

```javascript
// .devdiff.config.js
export default {
  mvp: {
    charThreshold: 50000, // Trigger MVP mode when diff character count exceeds this limit
    fileThreshold: 30,    // Trigger MVP mode when number of changed files exceeds this limit
  }
}
```
