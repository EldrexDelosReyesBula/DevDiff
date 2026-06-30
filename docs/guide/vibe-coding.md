# Vibe-Coding Resilience & Guardian

Vibe-Coding sessions are rapid, iterative, AI-assisted development periods. The **Vibe-Coder Guardian** protects you during these sessions from unexpected failures, rate-limiting, and bad model output, ensuring **zero data loss**.

## Core Guarantees

1. **Local Checkpoints**: Before every AI call, DevDiff takes a snapshot of your staged and unstaged files.
2. **Auto-Recovery**: If a routed AI model fails, the system switches to fallback models (e.g. falling back to local Llama 3.1 8B).
3. **Manual Recovery**: If everything fails, you can manually revert to the last working checkpoint.

## CLI Usage

### Start a Vibe Session

```bash
npx devdiff vibe start
```

### Check Session Status

```bash
npx devdiff vibe status
```

### Manual Checkpoint Restore

If you need to recover a specific checkpoint:

```bash
npx devdiff recover --checkpoint ckpt-1719000300-def456
```
