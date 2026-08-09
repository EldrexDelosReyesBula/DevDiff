# DevDiff Codebase Architecture & Monorepo Topology

This document details the monorepo architecture of DevDiff (v1.6.0). DevDiff is organized as a pnpm workspace containing 7 core packages, 4 plugin implementations, and VitePress documentation.

---

## 🎯 Package Dependency Graph

```mermaid
flowchart TD
    Core[@eldrex/core] --> CLI[@eldrex/cli]
    Core --> Gateway[@eldrex/gateway]
    Core --> MCP[@eldrex/mcp]
    Core --> VSCode[@eldrex/vscode Extension]
    Core --> VitePlugin[@eldrex/vite-plugin]
    
    SDK[@eldrex/plugin-sdk] --> Plugins[examples/plugins/*]
    Core --> Integrations[@eldrex/integrations]
    
    style Core fill:#9f9,stroke:#333,stroke-width:2px
    style SDK fill:#bbf,stroke:#333,stroke-width:2px
```

---

## 📂 Directory Structure

| Package Path | Package Name | Responsibility & Scope |
|---|---|---|
| `packages/core` | `@eldrex/core` | Core AST engine, AI provider router, redaction engine, network guard, persistent memory |
| `packages/cli` | `@eldrex/cli` | Command-line interface (`devdiff generate`, `devdiff memory`, `devdiff release`) |
| `packages/vscode` | `@eldrex/vscode` | VS Code extension host, 4 sidebar panels, `@devdiff` chat participant |
| `packages/mcp` | `@eldrex/mcp` | Model Context Protocol server exposing 8 sub-50ms query tools |
| `packages/gateway` | `@eldrex/gateway` | Express/Fastify REST server & webhook listener (`:3737`) |
| `packages/plugin-sdk` | `@eldrex/plugin-sdk` | TypeScript SDK for building DevDiff extensions & lifecycle hooks |
| `packages/vite-plugin` | `@eldrex/vite-plugin` | Vite dev server change tracking plugin |
| `examples/plugins` | N/A | 4 working plugin implementations (Slack, Jira, Cost Tracker, Security Gate) |
