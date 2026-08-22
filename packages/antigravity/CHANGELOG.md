# @eldrex/antigravity

## 1.8.0

### Minor Changes

- **Optimized Memory Indexing**: Incremental AST indexing performance improved by 40% with file-hashing deduplication.
- **Skill Documentation Generator**: Enhanced `SKILL.md` output formatting matching human-craft design guidelines.

---

## 1.7.0

### Major Changes

- **Unified Knowledge Architecture**: Synchronizes `SKILL.md`, `.devdiff/context.md`, and AST codebase memory indexes with live timestamp validation.
- **ContextMemorySync**: Automatic background synchronization between memory snapshots and repository rules.
- **HallucinationGuard**: Multi-stage validation checking generated content against real file paths, symbol exports, and architectural patterns.

---

## 1.6.0

### Major Changes

- **IDEGuardian**: Core worker isolation engine powering the VS Code extension's isolated AI execution environment. Manages worker thread lifecycle, enforces memory caps, and handles crash recovery without affecting the VS Code extension host.
- **Persistent Codebase Memory Engine**: Full AST-indexed codebase scanning with sub-50ms query performance. Builds and maintains `.devdiff/memory/codebase-index.json` incrementally on each git commit.
- **Conversational Q&A Engine**: Multi-turn conversation context engine with pronoun resolution (`it`, `this`, `that`) across sequential questions. Stores conversation history in `.devdiff/memory/conversation-history.json`.
- **Hardware-Aware Optimizer**: Detects available system RAM, CPU core count, and thermal state to automatically apply memory caps (128MB / 256MB / 512MB), concurrency limits, and thermal throttling guards.
- **24/7 Background Scheduler**: Pre-configured background task scheduler for standup digest generation (morning), weekly security audit triggers, and incremental memory re-indexing.
- **Universal Project Detector**: Scans and identifies project type across 60+ language extensions, CDN frameworks (Vue, React, Tailwind, Alpine, HTMX), and Web APIs without requiring a `package.json`.
- **SKILL.md Generator**: Auto-generates `.devdiff/SKILL.md` covering 10 knowledge domain sections (Project Identity, Architecture, Naming Conventions, Business Domain, Patterns, Anti-Patterns, Compliance, Output Preferences, Team Context, Historical Context).
- **Automated SemVer Detector**: Analyzes git diffs for breaking changes (export removals, signature changes, API deprecations) to calculate `MAJOR`, `MINOR`, or `PATCH` version bumps.
- **CloudGuard**: Strict explicit opt-in enforcement — environment API keys are detected but never called without `devdiff auth add`.
- **CommitGuard**: Generated files (`CHANGELOG.md`, memory snapshots) are never auto-staged or committed without explicit developer commands.
- **Ollama Discovery**: Auto-detects Ollama daemon at `http://localhost:11434` and enumerates available models on startup.

### Minor Changes

- Battery discharge guard pauses scheduled background tasks when on battery power below 20%.
- Historical snapshot comparison engine saves diffs between repository states at configurable intervals.
- `devdiff schedule list` enumerates all registered background tasks with next-run timestamps.

### Patch Changes

- Fixed Ollama model enumeration timing out when Ollama is not running — now emits a structured warning and skips auto-configuration.
- Fixed memory index corruption on concurrent write when multiple `devdiff memory rescan` instances run simultaneously — now uses file-level locking.
