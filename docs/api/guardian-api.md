# Vibe-Coder Guardian API Reference

The `VibeCoderGuardian` class handles workspace checkpoints, automatic AI failure recovery, and session state tracking.

## Import

```typescript
import { VibeCoderGuardian } from "@eldrex/core";
```

## Constructor

```typescript
const guardian = new VibeCoderGuardian();
```

## Methods

### `loadSession(): Promise<void>`

Loads an existing vibe session from `.devdiff/vibe-session.json`.

### `saveSession(): Promise<void>`

Saves the active vibe session to `.devdiff/vibe-session.json`.

### `deleteSession(): Promise<void>`

Removes the current vibe session file.

### `preAICheckpoint(context: { files: string[]; model: string; prompt: string }): Promise<Checkpoint>`

Captures file snapshots and writes a checkpoint JSON file to `.devdiff/checkpoints/`. Returns a `Checkpoint` object.

### `handleFailure(failure: { error: Error; model: string; checkpointId: string; attempt: number }): Promise<RecoveryResult>`

Processes a failed AI call, records the failure, and returns a recovery strategy (either a retry command with a fallback model or a checkpoint restore recommendation).

### `restoreCheckpoint(checkpointId: string): Promise<void>`

Restores all files modified in the checkpoint back to their pre-AI state.

### `generateReport(): VibeSessionReport`

Generates a structured report detailing duration, total changes, checkpoints created, and AI calls status.
