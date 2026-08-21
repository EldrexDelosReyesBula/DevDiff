# @eldrex/cli

## Command-line interface for DevDiff — intelligent, privacy-first changelog generation

[![npm version](https://img.shields.io/npm/v/@eldrex/cli)](https://npmjs.com/package/@eldrex/cli)
[![Socket Score](https://img.shields.io/badge/Socket-74-blue)](https://socket.dev/npm/package/@eldrex/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

`@eldrex/cli` provides the main command line interface to initialize, generate, watch, and audit changelogs.

## Installation

```bash
npm install -g @eldrex/cli
```

## CLI Commands

### Generation & Inspection

- `devdiff init` — Initialize configuration and local Git hooks.
- `devdiff generate` — Generate AI changelog summaries (`--since today|yesterday|this-week`, `--commit`, `--from..<ref>`).
- `devdiff watch` — Monitor repository changes in real-time.
- `devdiff report` — Output detailed codebase summary reports.
- `devdiff audit` — View execution history and security logs.
- `devdiff ask` — Query repository history and codebase memory.

### Codebase Memory Management (`devdiff memory`)

- `devdiff memory list` — List memory snapshots with date filters (`--from`, `--to`).
- `devdiff memory delete` — Delete snapshots in range (`--dry-run` available).
- `devdiff memory use` — Scope active context to specific date bounds.
- `devdiff memory categorize` — Assign snapshot labels (`--label production|experimentation`).
- `devdiff memory categories` — List snapshot categories with date bounds.
- `devdiff memory optimize` — Deduplicate snapshots and compact local storage.
- `devdiff memory status` — View memory storage metrics.

### Network Firewall & Policy (`devdiff network`)

- `devdiff network watch` — Real-time outbound network monitor.
- `devdiff network history` — View network connection logs (`--since`, `--domain`).
- `devdiff network block` — Block domain or category (`--category telemetry|analytics`).
- `devdiff network unblock` — Unblock domain.
- `devdiff network allow` / `disallow` — Manage local allowlist rules.
- `devdiff network export` — Export network audit report (`--format json|markdown`).
- `devdiff network audit` — Run network security audit against active plugins.

### Plugin Auditing & Transparency

- `devdiff plugin audit <name>` — Compare declared vs actual plugin permissions.
- `devdiff disclose` — Generate full zero-telemetry disclosure report.

## 🔒 Security & Privacy

### What This Package Accesses

| Resource    | Why                                                | Default | Can Disable |
| ----------- | -------------------------------------------------- | ------- | ----------- |
| File System | Read configurations, write local log cache         | Yes     | No          |
| Shell       | Run whitelisted git operations, detect Ollama path | Yes     | Yes         |

### Shell Access notice

This package accesses the shell for specific whitelisted operations (like `git status`, `git diff`, and checking for local binaries via `which`). You can fully disable shell execution by setting:

```json
{
  "security": {
    "disableShellAccess": true
  }
}
```

When disabled, `isomorphic-git` is used instead.

## License

MIT © DevDiff Contributors
