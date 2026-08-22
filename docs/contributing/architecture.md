# DevDiff Codebase Architecture & Monorepo Topology

This document details the monorepo architecture of DevDiff. DevDiff is organized as a unified `pnpm` workspace containing 14 specialized packages, native VS Code extension components, universal MCP server modules, and a VitePress documentation portal.

---

## Package Dependency Graph

```mermaid
flowchart TD
    Core[@eldrex/core] --> CLI[@eldrex/cli]
    Core --> Gateway[@eldrex/gateway]
    Core --> MCP[@eldrex/mcp]
    Core --> VSCode[devdiff VS Code Extension]
    Core --> VitePlugin[@eldrex/vite]
    Core --> Antigravity[@eldrex/antigravity]

    Personas[@eldrex/personas] --> Core
    Personas --> Gateway

    PluginSDK[@eldrex/plugin-sdk] --> OpenClaw[@eldrex/openclaw]
    PluginSDK --> CreateApp[create-devdiff-app]

    Connectors[@eldrex/connectors] --> Gateway

    CLI --> MCP
    VSCode --> PluginSDK
```

---

## Workspace Packages Directory

| Package Path                     | Package Name          | Responsibility & Scope                                                                                                                  |
| :------------------------------- | :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/core`                  | `@eldrex/core`        | Core AST engine, AI provider router, redaction engine v2, network guard, persistent memory, and `HallucinationGuard`.                   |
| `packages/cli`                   | `@eldrex/cli`         | Command-line interface (`devdiff agent`, `prompt`, `security`, `memory`, `mcp`, `disclose`, `study`).                                   |
| `packages/vscode`                | `devdiff`             | Native VS Code extension with 4 sidebar panels, full-tab chat window, DevTools suite, and standalone esbuild bundle.                    |
| `packages/plugin-sdk`            | `@eldrex/plugin-sdk`  | TypeScript SDK and `DevDiffDevTools` test harness, mock generators, validator, and performance profiler.                                |
| `packages/mcp`                   | `@eldrex/mcp`         | Universal Model Context Protocol (MCP) server exposing 16 tools with automated multi-IDE configuration installer.                       |
| `packages/gateway`               | `@eldrex/gateway`     | AI provider gateway, multi-agent swarm consensus coordinator, and Mermaid sanitizer v2.                                                 |
| `packages/antigravity`           | `@eldrex/antigravity` | Worker thread isolation engine (`IDEGuardian`), 24/7 background scheduler, and SKILL.md generator.                                      |
| `packages/personas`              | `@eldrex/personas`    | 9 built-in release personas (`developer`, `ceo`, `educator`, `pm`, `compliance`, `robot`, `data-analyst`, `journalist`, `study-buddy`). |
| `packages/connectors`            | `@eldrex/connectors`  | Streaming changelog webhook delivery connectors (Slack, Discord, MS Teams, Telegram, WhatsApp).                                         |
| `packages/vite-plugin`           | `@eldrex/vite`        | Vite dev server Hot Module Replacement (HMR) changelog overlay and build-time security gates.                                           |
| `packages/integrations/openclaw` | `@eldrex/openclaw`    | OpenClaw supervisor v2 agent orchestration with subtask graph decomposition.                                                            |
| `packages/create-devdiff-app`    | `create-devdiff-app`  | Project scaffolding CLI for custom DevDiff applications, plugins, and MCP servers.                                                      |
| `docs/`                          | `devdiff-docs`        | VitePress documentation portal with on-device vector search.                                                                            |

---

## Architectural Principles

1. **Local-First & Air-Gapped**: Core analysis, AST parsing, and local inference operate with zero external cloud dependencies.
2. **Zero-Impact IDE Performance**: The VS Code extension isolates AI operations and memory indexing to worker threads, strictly keeping memory under 256MB.
3. **Strict Immutability & Impartial Quality**: Quality gates (`OutputQualityGate`, `CompletenessValidator`) guarantee generated changelogs are never incomplete or cut off.
