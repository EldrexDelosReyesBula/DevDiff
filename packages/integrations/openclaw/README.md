# @eldrex/openclaw

## OpenClaw AI agent integrations for DevDiff

[![npm version](https://img.shields.io/npm/v/@eldrex/openclaw)](https://npmjs.com/package/@eldrex/openclaw)
[![Socket Score](https://img.shields.io/badge/Socket-73-blue)](https://socket.dev/npm/package/@eldrex/openclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

`@eldrex/openclaw` provides integrations between DevDiff and the OpenClaw agent network, exposing Model Context Protocol (MCP) integrations and capabilities for AI agents to query changelogs, analyze commits, and trigger local builds.

## Installation

```bash
npm install @eldrex/openclaw
```

## 🔒 Security & Privacy

### What This Package Accesses

| Resource | Why | Default | Can Disable |
|----------|-----|---------|-------------|
| Network | Connect to local or remote agent networks | No | Yes (default disabled) |
| Ports | Exposes MCP endpoint on port 3739 | No | Yes |

### Agent Sandboxing
When agents interact with DevDiff through OpenClaw:
- They are constrained to the current Git repository boundary.
- They cannot run arbitrary system commands.
- Secrets are automatically redacted before leaving the local boundary.

## License

MIT © DevDiff Contributors
