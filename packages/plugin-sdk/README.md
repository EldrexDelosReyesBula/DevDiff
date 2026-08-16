# @eldrex/plugin-sdk

## Official Plugin Development SDK for DevDiff

> Build DevDiff plugins without touching core. Stable API, semantic versioning, TypeScript-first.

[![npm version](https://img.shields.io/npm/v/@eldrex/plugin-sdk)](https://npmjs.com/package/@eldrex/plugin-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Installation

```bash
npm install @eldrex/plugin-sdk
```

## Quick Start — Building a Plugin

```typescript
import {
  DevDiffPlugin,
  PluginContext,
  ParsedDiff,
  ProjectContext,
  ChangelogResult,
} from "@eldrex/plugin-sdk";

export const myPlugin: DevDiffPlugin = {
  id: "my-custom-plugin",
  name: "My Custom Plugin",
  version: "1.0.0",
  description: "Extends DevDiff with custom notifications",
  author: {
    name: "Developer",
    url: "https://github.com/example/my-custom-plugin",
  },
  devdiffVersion: ">=1.0.0",

  async activate(context: PluginContext) {
    context.logger.info("Plugin activated!");
  },

  hooks: {
    async afterAnalysis(changelog: ChangelogResult) {
      console.log(`Changelog generated: ${changelog.summary}`);
      return changelog;
    },
  },
};

export default myPlugin;
```

---

## 🔒 Permissions & Security

Plugins declare permissions in their manifest:

- `network`: Array of allowed domain endpoints.
- `filesystem`: Paths allowed for reading/writing.
- `shell`: Allowed binary operations.

Users can audit declared vs actual plugin behavior via `devdiff plugin audit <plugin-name>`.

---

## License

MIT © DevDiff Contributors
