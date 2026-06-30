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

- `devdiff init` — Set up the configuration and install local Git hook triggers.
- `devdiff generate` — Perform manual diff parsing and prompt generation.
- `devdiff watch` — Monitor repository indexes for staged diff changes in real-time.
- `devdiff report` — Start the local dashboard interface.
- `devdiff audit` — Show the local AI execution history and security logs.

## 🔒 Security & Privacy

### What This Package Accesses

| Resource | Why | Default | Can Disable |
|----------|-----|---------|-------------|
| File System | Read configurations, write local log cache | Yes | No |
| Shell | Run whitelisted git operations, detect Ollama path | Yes | Yes |

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
