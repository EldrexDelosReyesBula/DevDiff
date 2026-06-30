# @eldrex/dashboard

## Visual, offline-first dashboard for DevDiff changelog management

[![npm version](https://img.shields.io/npm/v/@eldrex/dashboard)](https://npmjs.com/package/@eldrex/dashboard)
[![Socket Score](https://img.shields.io/badge/Socket-76-blue)](https://socket.dev/npm/package/@eldrex/dashboard)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

`@eldrex/dashboard` is the web client interface that allows developers and team leads to view, search, curate, and publish generated changelogs. It acts as the frontend companion for the DevDiff local server gateway.

## Installation

```bash
npm install @eldrex/dashboard
```

## Running the Dashboard

To serve the dashboard locally, use the CLI:

```bash
npx devdiff report --port 4200
```

## 🔒 Security & Privacy

The dashboard operates entirely inside your local network.

- **Zero Cloud Tracking**: We do not use trackers, analytics tools, or third-party tracking scripts.
- **Local Storage**: All data, preferences, and custom views are saved in your local workspace or browser localStorage.
- **Access Control**: When connected to `@eldrex/gateway`, requests are authenticated via secure local tokens.

## License

MIT © DevDiff Contributors
