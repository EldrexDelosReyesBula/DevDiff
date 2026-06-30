# Disaster Recovery

During active vibe-coding sessions, mistakes happen or remote APIs go down. DevDiff provides a local disaster recovery mechanism using pre-AI checkpoints.

## Pre-AI Checkpoints

Every time an AI command is executed, a snapshot is saved:

```bash
💾 Checkpoint: ckpt-1719000300-def456
```

## Restoring Checkpoints

If an AI-assisted session corrupts files or introduces undesired changes, restore your workspace using the recover CLI command:

```bash
npx devdiff recover --checkpoint ckpt-1719000300-def456
```

This restores all files back to their exact pre-AI state.
