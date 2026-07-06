# Configuration Guide

DevDiff supports flexible configuration using a `.devdiff.config.js` file (recommended), `.devdiff.config.json`, or other `.devdiffrc` configurations in the root directory of your repository.

---

## Complete Configuration Template

Here is a full schema reference detailing all available options in `.devdiff.config.js` format:

```javascript
// .devdiff.config.js
export default {
  version: "1.0.5",

  // ── AI CONFIGURATION ──
  ai: {
    providers: [
      {
        name: "ollama-local",
        url: "ollama://qwen2.5-coder:7b",
        priority: 1,
        timeout: 60000, // 60 seconds
        maxTokens: 4096,
      },
      {
        name: "openai-cloud",
        url: "openai://gpt-4o-mini",
        apiKey: process.env.OPENAI_API_KEY,
        priority: 2,
        timeout: 30000,
      },
    ],
    routing: {
      strategy: "priority", // priority, cost-aware, latency, capability
      complexityThreshold: 0.5,
      localOnly: false,
      maxDailyCost: 0.5, // USD limit
    },
  },

  // ── SECURITY CONTROLS ──
  security: {
    disableShellAccess: false,
    disableNetworkAccess: false,
    allowedShellCommands: ["git", "ollama", "which"],
    auditEncryption: true,
    fipsMode: false,
  },

  // ── PRIVACY CONTROLS ──
  privacy: {
    auditLogRetention: 30, // retain logs for 30 days
    autoDeleteAuditLogs: false,
    dataMinimization: "strict", // strict, moderate, relaxed
    blockExternal: ["**/.env", "**/secrets/**", "**/keys/**"],
  },

  // ── PERFORMANCE TUNING ──
  performance: {
    maxMemoryMB: 256, // limit peak heap memory to 256MB
    maxFilesPerAnalysis: 500,
    useIncrementalDiffing: true,
    cacheASTRuns: true,
  },

  // ── CONTEXT WINDOW LIMITS ──
  context: {
    maxContextTokens: 4000,
    overflowStrategy: "summarize", // truncate, summarize, split, mcp
  },

  // ── AGENTIC WORKSPACE SETTINGS ──
  agentic: {
    enabled: true,
    autoStart: true,
    autoAnalyzeOnCommit: false,
    notificationMode: "minimal", // silent, minimal, verbose
    maxAutoAnalysesPerHour: 20,
  },

  exclude: [
    "**/node_modules/**",
    "pnpm-lock.yaml",
    "package-lock.json",
    "dist/**",
    "*.log",
  ],

  cache: {
    enabled: true,
    path: ".devdiff/cache.json",
  },

  format: "markdown",
};
```

---

## Detailed Option Breakdown

### AI & Routing Parameters

| Option                           | Type      | Default      | Description                                                                                                                          |
| :------------------------------- | :-------- | :----------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `ai.providers`                   | `Array`   | _Required_   | List of model provider endpoints and credentials. Supports local (`ollama://`) and cloud (`openai://`, `gemini://`, `anthropic://`). |
| `ai.routing.strategy`            | `string`  | `"priority"` | Strategy used by the Intelligent Router. Options: `'priority'`, `'cost-aware'`, `'latency'`, `'capability'`.                         |
| `ai.routing.complexityThreshold` | `number`  | `0.5`        | Complexity value above which changes trigger escalation to higher capacity models (0-1).                                             |
| `ai.routing.localOnly`           | `boolean` | `false`      | When true, prevents the router from selecting any external cloud providers regardless of complexity.                                 |
| `ai.routing.maxDailyCost`        | `number`  | `0.50`       | Maximum daily spend on cloud AI services (in USD) to prevent surprise billing.                                                       |

---

### Security Parameters

| Option                          | Type            | Default                      | Description                                                                       |
| :------------------------------ | :-------------- | :--------------------------- | :-------------------------------------------------------------------------------- |
| `security.disableShellAccess`   | `boolean`       | `false`                      | Disables execution of all shell commands, running purely in static analysis mode. |
| `security.disableNetworkAccess` | `boolean`       | `false`                      | Block all outbound connections, forcing local-only Ollama runs.                   |
| `security.allowedShellCommands` | `Array<string>` | `["git", "ollama", "which"]` | Whitelist of executable commands.                                                 |
| `security.auditEncryption`      | `boolean`       | `true`                       | Encrypt audit logs at rest using AES-256-GCM.                                     |
| `security.fipsMode`             | `boolean`       | `false`                      | Run with FIPS 140-2 validated cryptography libraries.                             |

---

### Privacy & Data Minimization

| Option                        | Type            | Default                                      | Description                                                                                               |
| :---------------------------- | :-------------- | :------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| `privacy.auditLogRetention`   | `number`        | `30`                                         | Number of days to retain system audit logs.                                                               |
| `privacy.autoDeleteAuditLogs` | `boolean`       | `false`                                      | Auto-prune logs older than `auditLogRetention` days.                                                      |
| `privacy.dataMinimization`    | `string`        | `"strict"`                                   | How aggressively to minimize payload data sent to the AI. Options: `'strict'`, `'moderate'`, `'relaxed'`. |
| `privacy.blockExternal`       | `Array<string>` | `["**/.env", "**/secrets/**", "**/keys/**"]` | Glob patterns of files that must NEVER be sent to external cloud APIs.                                    |

---

### Performance & Memory Tuning

| Option                              | Type      | Default | Description                                             |
| :---------------------------------- | :-------- | :------ | :------------------------------------------------------ |
| `performance.maxMemoryMB`           | `number`  | `256`   | Heap memory cap (in MB) for DevDiff processes.          |
| `performance.maxFilesPerAnalysis`   | `number`  | `500`   | Max count of files allowed in a single generate run.    |
| `performance.useIncrementalDiffing` | `boolean` | `true`  | Enables indexing to check changed blocks incrementally. |
| `performance.cacheASTRuns`          | `boolean` | `true`  | Cache AST parses to optimize CPU usage.                 |

---

### Context Window & Agentic Mode

| Option                     | Type      | Default       | Description                                                                                     |
| :------------------------- | :-------- | :------------ | :---------------------------------------------------------------------------------------------- |
| `context.maxContextTokens` | `number`  | `4000`        | Token limit for prompts.                                                                        |
| `context.overflowStrategy` | `string`  | `"summarize"` | How to handle tokens exceeding limit. Options: `'truncate'`, `'summarize'`, `'split'`, `'mcp'`. |
| `agentic.enabled`          | `boolean` | `true`        | Enable or disable agentic IDE workspace integration.                                            |
| `agentic.autoStart`        | `boolean` | `true`        | Start agentic daemon automatically when editor opens.                                           |
| `agentic.notificationMode` | `string`  | `"minimal"`   | Alert verbosity. Options: `'silent'`, `'minimal'`, `'verbose'`.                                 |

---

## Editor Autocomplete (IntelliSense)

DevDiff CLI can generate JSON Schema files to enable auto-complete, parameter descriptions, and validation directly in your editor:

```bash
# Generate the VS Code settings schema
devdiff schema
```

This creates a local `.vscode/devdiff-schema.json` file. Follow the CLI directions to add the schema mapping in your `.vscode/settings.json`.
