# @eldrex/personas

## Code analysis personas for DevDiff — customize the voice and focus of generated changelogs

[![npm version](https://img.shields.io/npm/v/@eldrex/personas)](https://npmjs.com/package/@eldrex/personas)
[![Socket Score](https://img.shields.io/badge/Socket-74-blue)](https://socket.dev/npm/package/@eldrex/personas)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

`@eldrex/personas` provides a collection of pre-configured AI analysis profiles for DevDiff. It adapts the output changelog based on the target audience (e.g., developers, product managers, security auditors, or marketing).

## Installation

```bash
npm install @eldrex/personas
```

## Quick Start

```typescript
import { getPersonaPrompt } from '@eldrex/personas'

const systemPrompt = getPersonaPrompt('product-manager')
```

## Available Personas

- **developer**: Deep technical analysis focused on refactoring, architecture, and API surface changes.
- **product-manager**: High-level, value-oriented summaries focused on user features, bugs fixed, and product impact.
- **security-auditor**: Security-centric view highlighting risk changes, permission changes, secrets, and CVE fixes.
- **general**: A balanced summary suitable for team updates.

## 🔒 Security & Privacy

This package is a pure metadata and template definition package. It has:
- ❌ **No network access**
- ❌ **No shell command execution**
- ❌ **No file system access**

All data processing remains entirely local.

## License

MIT © DevDiff Contributors
