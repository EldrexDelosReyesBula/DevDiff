# @eldrex/core

## Core engine for DevDiff — intelligent, privacy-first changelog generation

> **🔒 Built for Privacy** — DevDiff tracks zero telemetry, logs no data, and makes no external calls except directly to your configured AI provider. [Verify yourself →](https://devdiff.vercel.app/security/disclosure)

[![npm version](https://img.shields.io/npm/v/@eldrex/core)](https://npmjs.com/package/@eldrex/core)
[![Socket Score](https://img.shields.io/badge/Socket-75-blue)](https://socket.dev/npm/package/@eldrex/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

`@eldrex/core` is the engine that powers DevDiff. It parses git diffs, analyzes code changes, and generates human-readable changelogs using AI that runs entirely on your machine.

---

## ⭐ Love DevDiff?

If DevDiff saves you time, **leave a review** — it helps other developers find us.

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=ebula.devdiff&ssr=false#review-details">
    <img src="https://img.shields.io/badge/VS%20Code-Review%20on%20Marketplace-6366f1?style=for-the-badge&logo=visualstudiocode" alt="Review on VS Code Marketplace">
  </a>
  &nbsp;&nbsp;
  <a href="https://open-vsx.org/extension/ebula/devdiff/reviews">
    <img src="https://img.shields.io/badge/Open%20VSX-Review%20Extension-6366f1?style=for-the-badge" alt="Review on Open VSX">
  </a>
</p>

---

## Installation

```bash
npm install @eldrex/core
```

## Quick Start

```typescript
import { generateChangelog } from "@eldrex/core";

const result = await generateChangelog({
  diffText: "...",
  dryRun: false,
});

console.log(result.formattedOutput);
```

## Key Capabilities

- **Project Context Awareness**: Automatically loads workspace rules (`SKILL.md`, `.devdiff/context.md`) so summaries reflect your actual codebase conventions.
- **Diff Fact-Checking**: Validates AI-generated explanations against raw git diffs and syntax trees to eliminate fabricated changes or non-existent files.
- **Codebase Memory & History**: Maintains a persistent local timeline of changes with pruning, deduplication, and date range filtering.
- **Natural Time References**: Resolves human time ranges (`today`, `yesterday`, `this-week`, ISO dates) directly to git revision ranges.
- **Network Firewall & Secret Redaction**: Intercepts outbound traffic to block telemetry, scrubs high-entropy credentials, and audits plugin permissions.

## API Reference

Full documentation: [devdiff.vercel.app](https://devdiff.vercel.app)

## 🔒 Security & Privacy

### What This Package Accesses

| Resource    | Why                               | Default | Can Disable        |
| ----------- | --------------------------------- | ------- | ------------------ |
| File System | Read git repos, write changelogs  | Yes     | No (core function) |
| Shell       | Execute git, detect tools         | Yes     | Yes                |
| Network     | Cloud AI, webhooks, notifications | No      | Yes (default off)  |

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

| Feature                     | Default    | Network Required   |
| --------------------------- | ---------- | ------------------ |
| AI Analysis                 | Local only | No                 |
| Cloud AI (OpenAI, etc.)     | Disabled   | Yes (your API key) |
| Webhooks (incoming)         | Disabled   | Yes                |
| Notifications (Slack, etc.) | Disabled   | Yes                |
| Version check               | Enabled    | Yes (can disable)  |

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

---

## 💬 Feedback & Community

<p align="center">
  <a href="https://github.com/EldrexDelosReyesBula/devdiff/discussions">
    <img src="https://img.shields.io/badge/Discussions-Ask%20%2F%20Suggest-6366f1?style=for-the-badge&logo=github" alt="GitHub Discussions">
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/EldrexDelosReyesBula/devdiff/issues/new?template=feature_request.md">
    <img src="https://img.shields.io/badge/Feature-Request%20a%20Feature-22c55e?style=for-the-badge&logo=github" alt="Feature Request">
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/EldrexDelosReyesBula/devdiff/issues/new?template=bug_report.md">
    <img src="https://img.shields.io/badge/Bug-Report%20an%20Issue-ef4444?style=for-the-badge&logo=github" alt="Report Bug">
  </a>
</p>

<p align="center">
  <sub>Enjoying DevDiff? <a href="https://marketplace.visualstudio.com/items?itemName=ebula.devdiff&ssr=false#review-details">Leave a review</a> — it takes 30 seconds and helps more than you know.</sub>
</p>

## License

MIT © DevDiff Contributors
