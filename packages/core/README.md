# @eldrex/core

## Core engine for DevDiff — intelligent, privacy-first changelog generation

[![npm version](https://img.shields.io/npm/v/@eldrex/core)](https://npmjs.com/package/@eldrex/core)
[![Socket Score](https://img.shields.io/badge/Socket-75-blue)](https://socket.dev/npm/package/@eldrex/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

`@eldrex/core` is the engine that powers DevDiff. It parses git diffs, analyzes code changes, and generates human-readable changelogs using AI that runs entirely on your machine.

## Installation

```bash
npm install @eldrex/core
```

## Quick Start

```typescript
import { generateChangelog } from '@eldrex/core'

const result = await generateChangelog({
  diffText: "...",
  dryRun: false
})

console.log(result.formattedOutput)
```

## API Reference

Full documentation: [docs.eldrex.dev/core](https://docs.eldrex.dev/core)

## 🔒 Security & Privacy

### What This Package Accesses

| Resource | Why | Default | Can Disable |
|----------|-----|---------|-------------|
| File System | Read git repos, write changelogs | Yes | No (core function) |
| Shell | Execute git, detect tools | Yes | Yes |
| Network | Cloud AI, webhooks, notifications | No | Yes (default off) |

### What This Package NEVER Does
- ❌ Send telemetry or analytics
- ❌ Read files outside your project
- ❌ Access environment variables except configured API keys
- ❌ Execute arbitrary shell commands
- ❌ Share data with third parties

### Shell Access Notice

This package may execute shell commands for:
- **Git operations** (`git log`, `git diff`) — for analyzing code changes
- **Tool detection** (`which ollama`) — to find installed AI providers

**All shell access is:**
- Whitelisted (only `git`, `ollama`, `which`, `node` allowed)
- Audited (logged to security trail)
- Disableable (set `{ security: { disableShellAccess: true } }`)

### Network Access Notice

DevDiff is **local-first by default**. Network access only occurs when you explicitly configure:

| Feature | Default | Network Required |
|---------|---------|-----------------|
| AI Analysis | Local only | No |
| Cloud AI (OpenAI, etc.) | Disabled | Yes (your API key) |
| Webhooks (incoming) | Disabled | Yes |
| Notifications (Slack, etc.) | Disabled | Yes |
| Version check | Enabled | Yes (can disable) |

### AI Security Disclosure

DevDiff integrates with AI/LLM models for code analysis. We take specific precautions to mitigate AI-related risks:

- **Prompt Injection Protection**: All inputs to AI models are sanitized to prevent prompt injection.
- **Data Minimization**: We send the minimum data required (only the diff, not the entire file). Secrets are automatically redacted before AI processing.
- **Local-First Default**: By default, AI processing uses local models (Ollama, WebGPU, WASM). No data leaves your machine unless you explicitly configure a cloud provider.
- **Model Verification**: When using local models, we verify model checksums to prevent supply-chain attacks through model files.

### Audit Trail
Every sensitive operation is logged:
```bash
npx devdiff audit --package @eldrex/core
```

## License

MIT © DevDiff Contributors
