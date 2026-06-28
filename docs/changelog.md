# Changelog

All notable changes to the DevDiff workspace packages will be documented in this file.

## [1.0.0] - 2026-06-28 (Initial Release)

We are proud to release version **1.0.0** of all DevDiff packages under the `@eldrex` NPM scope. This release establishes the autonomous, privacy-first changelog and code intelligence layer.

### `@eldrex/core`

- Initial release of the core changelog engine.
- Diff parser with line extraction and token estimation.
- Token-aware Intelligent Router with model tiering, complexity scores, capability weights, and fallback chain retry loops.
- AST parsing, trimming, and secret redaction.

### `@eldrex/cli`

- Command-line interface with interactive setups.
- Commands: `devdiff generate`, `devdiff watch`, `devdiff config`, and `devdiff audit`.

### `@eldrex/gateway`

- Standardized automation hub and protocol gateway.
- Simultaneous support for HTTP, WebSockets, Model Context Protocol (MCP), and OpenClaw protocol endpoints.
- Concurrent Semaphore locks and per-repository sequentialPriority commit queues.
- Mermaid diagram rendering engine with strict safety formatting and validation.
- Progressive webhook streaming for real-time progress delivery.

### `@eldrex/personas`

- Persona configuration engine and profile registry.
- 8 built-in developer personas (developer, ceo, pm, compliance, educator, robot, journalist, data-analyst).
- Custom YAML configuration loader with profile inheritance.

### `@eldrex/openclaw`

- Protocol adapter, triggers engine, and custom skill triggers.

### `@eldrex/vite` & `@eldrex/vscode`

- Automatic changelog generation plugin for Vite bundles.
- VS Code extension with status-bar quick trigger, sidebar webview panel, and inline explains.
