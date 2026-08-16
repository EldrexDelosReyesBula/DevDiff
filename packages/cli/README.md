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

### Generation & Analysis

- `devdiff init` — Set up configuration and local Git hooks.
- `devdiff generate` — Generate changelogs (`--since today|yesterday|this-week|2026-08-01`, `--commit`, `--from..--to`).
- `devdiff watch` — Monitor repository diffs in real-time.
- `devdiff report` — Launch local dashboard interface.
- `devdiff audit` — View execution history and security logs.

### 🗂️ Memory Timeline Management (`devdiff memory`)

- `devdiff memory list` — List memory snapshots (`--from`, `--to`, `--category`).
- `devdiff memory delete` — Delete snapshots in range (`--dry-run` available).
- `devdiff memory use` — Scope active context (`--from`, `--to`, `--all`).
- `devdiff memory categorize` — Assign snapshot labels (`--label production|experimentation`).
- `devdiff memory categories` — List snapshot categories with date bounds.
- `devdiff memory optimize` — Deduplicate snapshots and compact storage.
- `devdiff memory status` — View overall memory storage status.

### 📡 Network Transparency Suite (`devdiff network`)

- `devdiff network watch` — Real-time network monitor.
- `devdiff network history` — View network logs (`--since`, `--plugin`, `--domain`).
- `devdiff network block` — Block domain or category (`--category telemetry|analytics`).
- `devdiff network unblock` — Unblock domain.
- `devdiff network allow` / `disallow` — Manage allowlist.
- `devdiff network blocked` / `allowed` — List network policies.
- `devdiff network export` — Export report (`--format json|markdown`).
- `devdiff network audit` — Run network security audit.

### 🔌 Plugin Transparency & Disclosure

- `devdiff plugin audit <name>` — Compare declared vs actual plugin behavior.
- `devdiff disclose` — Generate full disclosure transparency report.

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
