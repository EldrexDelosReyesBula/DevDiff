# @eldrex/vite

## Vite plugin for DevDiff — automatically runs changelog generation on build

[![npm version](https://img.shields.io/npm/v/@eldrex/vite)](https://npmjs.com/package/@eldrex/vite)
[![Socket Score](https://img.shields.io/badge/Socket-71-blue)](https://socket.dev/npm/package/@eldrex/vite)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

`@eldrex/vite` integrates with Vite to run local changelog analysis on bundle close. This is useful for automatically generating release notes on production builds or local dev runs.

## Installation

```bash
npm install @eldrex/vite
```

## Quick Start

Add to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import devDiffPlugin from '@eldrex/vite'

export default defineConfig({
  plugins: [
    devDiffPlugin({
      enabled: true,
      output: 'CHANGELOG.md'
    })
  ]
})
```

## 🔒 Security & Privacy

### What This Package Accesses

- **Shell**: Spawns `git diff HEAD~1` on compilation to parse recent code adjustments.
- **File System**: Appends markdown entries directly to local output paths (e.g. `CHANGELOG.md`).

All operations run locally inside the project folder boundary.

## License

MIT © DevDiff Contributors
