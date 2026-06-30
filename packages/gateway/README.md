# @eldrex/gateway

## Local event gateway and hook receiver for DevDiff

[![npm version](https://img.shields.io/npm/v/@eldrex/gateway)](https://npmjs.com/package/@eldrex/gateway)
[![Socket Score](https://img.shields.io/badge/Socket-75-blue)](https://socket.dev/npm/package/@eldrex/gateway)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

`@eldrex/gateway` is the local service that listens for webhooks (e.g., from local git hooks, IDE triggers, or local dev tools), processes them, and coordinates local database actions, notifications, and client updates.

## Installation

```bash
npm install @eldrex/gateway
```

## 🔒 Security & Privacy

### What This Package Accesses

| Resource | Why | Default | Can Disable |
|----------|-----|---------|-------------|
| File System | Read git configuration | Yes | No (core function) |
| Local Network | Bind ports to receive webhooks | Yes | Yes (by terminating service) |

### Ports Used

- **3737**: Default webhook receiver port.
- **3740**: WebSocket server for local dashboard synchronization.

All endpoints require token authentication by default. Anonymous access is strictly opt-in.

## License

MIT © DevDiff Contributors
