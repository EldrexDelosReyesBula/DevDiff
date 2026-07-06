# Changelog

All notable changes to the DevDiff workspace packages will be documented in this file.

## [1.0.6] - 2026-07-06 (Windows & Command Argument Hardening Release)

The **Windows & Command Argument Hardening** release resolves critical command execution, argument parsing, option ordering, and environment performance behaviors:

- **Commander Argument Parsing**: Filtered out Command class instances from execution argument arrays, preventing CLI parameter mismatches.
- **Option Flag Standardization**: Re-ordered option flags so short options are parsed before long options consistently (e.g. `-p, --persona`).
- **Windows Process Performance**: Tuned test threshold bounds to accommodate child process spawning time on Windows file structures.
- **Port Reuse Handlers**: Verified playground listen fallback routines handling port collisions natively.

## [1.0.5] - 2026-07-06 (CLI Registry & Security Hardening Release)

The **CLI Registry & Security Hardening** release introduces production-grade resilience, unified command validation, local playground port auto-fallback, config auto-completions, and advanced security guards.

### `@eldrex/cli`

- Overhauled CLI command registration using a unified dynamic [Command Registry](file:///c:/Users/Eldrex/Downloads/classhost/DevDiff/packages/cli/src/registry/command-registry.ts) with pre-run validations.
- Added visual terminal error boundaries with custom suggestions and recovery help.
- Added settings schema generation (`devdiff schema`) and Bash/PowerShell completion script output.
- Configured dynamic port retry fallbacks for the local playground server when port `3737` is occupied.

### `@eldrex/core`

- Implemented `ProgressiveChunking` and dynamic prompt-token-based timeout calculators to prevent Ollama connections from timing out on large diffs.
- Created `InjectionGuardV2` protecting LLM interfaces against jailbreaks, command chainings, and injection payloads.
- Upgraded the `RedactionEngineV2` to strip private keys and API tokens from dry-run prints.

### `@eldrex/dashboard`

- Unified the web-dashboard layout by serving the Design System-styled playground directly as the root application.

### `@eldrex/connectors`

- Added native connectors registry for Slack, Discord, Telegram, Microsoft Teams, WhatsApp, Email, Custom Webhooks, OpenClaw Bus, and MCP Protocol.

### `@eldrex/openclaw`

- Added OpenClaw Supervisor pipeline automation supporting consensus configs, automated fallback error handling, package manager dependency auto-installation, and human-in-the-loop interactive prompts.

## [1.0.4] - 2026-07-04 (Maintenance Release)

Maintenance update fixing internal workspace TSConfig and routing packages compilation.

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
