# DevDiff Plugin Architecture & Extension SDK

The DevDiff Plugin System allows developers and enterprise teams to extend DevDiff's functionality without modifying the core engine. Using `@eldrex/plugin-sdk`, you can register custom lifecycle hooks, intercept diffs before AI processing, post-process generated changelogs, dispatch webhooks to Slack/Teams/Jira, and enforce security policies.

---

## 🎯 Plugin Architecture & Execution Lifecycle

```mermaid
flowchart LR
    Diff[Git Diff & Workspace] --> Hook1[beforeAnalysis Hook]
    Hook1 --> AI[DevDiff AI & Memory Engine]
    AI --> Hook2[afterAnalysis Hook]
    Hook2 --> Output[Changelog Output & Storage]

    subgraph PluginSDK [@eldrex/plugin-sdk Environment]
      Hook1
      Hook2
      Logger[PluginLogger]
      Storage[PluginStorage]
      Notify[PluginNotifications]
    end

    style PluginSDK fill:#eef,stroke:#333,stroke-width:2px
    style Output fill:#9f9,stroke:#333,stroke-width:2px
```

---

## 🔌 Lifecycle Hooks

DevDiff plugins can register for 6 core execution hooks:

| Hook Name        | Invocation Timing                           | Primary Use Case                                        |
| ---------------- | ------------------------------------------- | ------------------------------------------------------- |
| `beforeAnalysis` | Executed before diff payload is sent to LLM | Inspect diffs, inject metadata, block dangerous changes |
| `afterAnalysis`  | Executed after changelog is generated       | Post-process summaries, dispatch webhooks (Slack/Jira)  |
| `onError`        | Executed on any DevDiff error               | Centralized error logging, alerting                     |
| `onFileChange`   | Executed when workspace files modify        | Trigger external linters, background build checks       |
| `onCommit`       | Executed when a git commit occurs           | CI/CD pipeline triggers                                 |
| `onAIComplete`   | Executed when LLM completes inference       | Token tracking, cost monitoring                         |

---

## 🛠️ Plugin SDK Capabilities (`PluginContext`)

Inside the `activate(context)` method, plugins receive a `PluginContext` object with access to:

- **`context.logger`**: Structured logging (`debug`, `info`, `warn`, `error`).
- **`context.storage`**: Key-value persistence (`get`, `set`, `delete`, `clear`).
- **`context.config`**: Read & write plugin-specific configuration settings.
- **`context.notifications`**: Dispatch notifications to user-defined channels.
- **`context.engine`**: Read-only workspace inspection (`getStatus()`, `getProjectContext()`, `getRecentChanges()`).

---

## 🚀 Official Workspace Plugin Examples

DevDiff includes 4 production-ready, fully working plugin implementations inside the repository:

- 📢 [Slack Notifier Plugin](./official-examples#1--slack-notifier-plugin) (`examples/plugins/slack-notifier/index.ts`)
- 🎫 [Jira Issue Linker Plugin](./official-examples#2--jira-issue-auto-linker-plugin) (`examples/plugins/jira-linker/index.ts`)
- 💰 [Cost & Token Tracker Plugin](./official-examples#3--llm-token--cost-tracker-plugin) (`examples/plugins/cost-tracker/index.ts`)
- 🛡️ [Security Gate Enforcer Plugin](./official-examples#4--security-gate-enforcer-plugin) (`examples/plugins/security-gate/index.ts`)

---

## 🔒 Security & Supply Chain Protection

For details on how DevDiff scans transitive dependencies, detects obfuscated code, and reviews permissions before plugin installation, visit the [Plugin Security & Supply Chain Protection Documentation](./security.md).
