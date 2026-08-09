# Plugin SDK API Reference (`@eldrex/plugin-sdk` v1.6.0)

The `@eldrex/plugin-sdk` package provides TypeScript interfaces, lifecycle hook definitions, logging utilities, and persistent storage abstractions for developing custom DevDiff plugins.

---

## 📦 Import Syntax

```typescript
import {
  DevDiffPlugin,
  PluginContext,
  ParsedDiff,
  ChangelogResult,
  AIResult,
  PluginStorage,
  PluginLogger,
} from "@eldrex/plugin-sdk";
```

---

## 🧩 Interface Specifications

### `DevDiffPlugin`

```typescript
export interface DevDiffPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: { name: string; email?: string };
  devdiffVersion: string;
  activate?: (context: PluginContext) => Promise<void>;
  deactivate?: () => Promise<void>;
  hooks?: {
    beforeAnalysis?: (diff: ParsedDiff) => Promise<ParsedDiff>;
    afterAnalysis?: (
      result: ChangelogResult,
      context: PluginContext,
    ) => Promise<void>;
    onError?: (error: Error, context: PluginContext) => Promise<void>;
    onFileChange?: (filePath: string, context: PluginContext) => Promise<void>;
    onCommit?: (commitHash: string, context: PluginContext) => Promise<void>;
    onAIComplete?: (result: AIResult, context: PluginContext) => Promise<void>;
  };
}
```

### `PluginContext`

Inside `activate()` or lifecycle hooks, plugins receive a `PluginContext` with access to:

- `context.logger`: Structured logger (`debug`, `info`, `warn`, `error`).
- `context.storage`: Key-value persistent storage (`get`, `set`, `delete`, `clear`).
- `context.config`: Plugin-specific configuration settings.
- `context.notifications`: Dispatch notifications to external endpoints.
