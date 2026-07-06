# DevDiff Plugin System

Build extensions for DevDiff without modifying core.

## Quick Start

```bash
# Use the official template
npx create-devdiff-plugin my-plugin

# Or copy manually
cp -r node_modules/@eldrex/plugin-sdk/template ./my-plugin
cd my-plugin
npm install
```

## Plugin Lifecycle

```
Install → Activate → [Run Hooks] → Deactivate
```

1. **Install:** `npm install ./my-plugin` or publish to npm
2. **Register:** Add to `.devdiff.config.js` plugins array
3. **Activate:** `activate()` called on DevDiff start
4. **Hooks:** Your hooks run at specific points
5. **Deactivate:** `deactivate()` called on DevDiff stop

## Available Hooks

| Hook             | When                      | Use Case                              |
| ---------------- | ------------------------- | ------------------------------------- |
| `beforeAnalysis` | Before AI processes diff  | Add metadata, validate changes        |
| `afterAnalysis`  | After changelog generated | Post-process, send to external system |
| `onError`        | Any DevDiff error         | Custom error handling, monitoring     |
| `onFileChange`   | Files modified            | Trigger external actions              |
| `onCommit`       | New commit detected       | CI/CD integration                     |
| `onAIComplete`   | AI call finishes          | Track usage, cost monitoring          |

## Plugin API

Plugins have access to:

- **Logger** — Structured logging (debug, info, warn, error)
- **Storage** — Persistent key-value store
- **Config** — Read plugin configuration
- **Notifications** — Send to configured channels
- **Engine (read-only)** — Access DevDiff status and context

## Testing

```bash
# Unit tests
npm test

# Integration test with DevDiff
npx devdiff plugin test ./my-plugin

# Debug mode
npx devdiff plugin test ./my-plugin --verbose
```

## Publishing

```bash
npm publish
# Tag with devdiff-plugin for discovery
npm dist-tag add my-plugin@1.0.0 devdiff-plugin
```

## Examples

- [Slack Notification Plugin](https://github.com/devdiff/plugin-slack)
- [Jira Integration Plugin](https://github.com/devdiff/plugin-jira)
- [Cost Tracker Plugin](https://github.com/devdiff/plugin-cost-tracker)
- [Custom Persona Plugin](https://github.com/devdiff/plugin-custom-persona)
