# Changelog

All notable changes to DevDiff are documented here.

DevDiff uses [Semantic Versioning](https://semver.org). Every published version is **immutable** — it works exactly as released, forever. See the [Version Policy](./policy) for details.

---

## [1.0.3] — 2026-06-30 · Hardening Release

Production-grade stability, a fully functional local playground, `create-devdiff-app` scaffolding, and the immutable versioning contract.

### 🔐 Immutable Version Guarantee

- `VERSION_GUARANTEE` constant published in `@eldrex/core` — the full immutability contract in code.
- `checkConfigCompatibility()` validates your config against the running CLI version.
- `devdiff version --check` — checks npm with graceful offline fallback.
- `devdiff version --changelog` — prints release history in your terminal.

### 🎮 Local Playground

- `devdiff playground` — starts an HTTP + WebSocket server on port `3737`.
- REST endpoints: `/api/workspace`, `/api/stats`, `/api/changelog`, `/api/personas`.
- Real-time file-change notifications via WebSocket.
- Dark glassmorphism UI with persona pills, format switcher, and session timer.

### 🏗️ `create-devdiff-app`

- `npx create-devdiff-app` scaffolds a new project with 4 templates: `enterprise-dashboard`, `startup-changelog`, `ci-integration`, `minimal`.

### 🌐 Public Demo

- Self-contained `playground-demo/index.html` — zero server, open in any browser.

### 🧪 Testing

- 12-phase pre-release verification matrix covering 1000-file stress tests, concurrent dev storms, checkpoint recovery, playground API checks, and security audits.
- 15/15 build tasks, 100 tests passing.

### 🐛 Bug Fixes

- Fixed `ws` package bundling issue in `@eldrex/cli`.
- Exported playground helpers from `@eldrex/core` index — fixes runtime import error.
- Fixed YAML frontmatter syntax error in `docs/index.md`.

---

## [1.0.2] — 2026-06-28 · Sentinel Release

Enterprise-grade security hardening, compliance frameworks, multi-agent swarms, and hardware-accelerated local inference.

### 🔒 Security & Privacy

- Regex-based `PrivacyEnforcer` — blocks API keys, credentials, and private key structures before any AI provider sees them.
- CVE fixes for webhook path traversal (CVSS 9.1) and prompt injection via commit messages.

### 🌍 Compliance (10 Frameworks)

- GDPR, CCPA, HIPAA, SOC 2, FedRAMP, ISO 27001, PIPEDA, LGPD, PDPA, Australia Privacy Act.
- `devdiff compliance list|apply|status|validate|report`

### ⚡ Local Inference & WebGPU

- WebGPU provider via ONNX Runtime Web.
- Resilient fallback chain: WebGPU → WebAssembly → CPU → Ollama.

### 🤖 Multi-Agent Swarms

- `MultiAgentOrchestrator` — 4 agents (Architect, Security, Performance, Docs) collaborate in 4 phases.

### 🛡️ Vibe-Coder Guardian

- Pre-AI checkpoint snapshots + automatic fallback recovery.
- `devdiff recover --checkpoint <id>` for manual rollback.

### 🎭 Personas & VS Code

- 8 built-in personas: Developer, CEO, Educator, PM, Compliance, Journalist, Data Analyst, Robot.
- VS Code extension v1.0.2 with PNG icon support and offline guides.

---

## [1.0.1] — 2026-06-20 · Stability Release

Hardened the core diff engine, fixed post-launch edge cases, and expanded AI provider compatibility.

### 🐛 Bug Fixes

- Fixed silent failure on repos with no prior commits (empty `HEAD`).
- Fixed `ENOENT` crash when `.devdiff.config.js` is absent — defaults gracefully.
- Fixed incorrect token estimates for Unicode-heavy diffs.
- Fixed `devdiff watch` not re-attaching after `git reset --hard`.

### ⚡ Performance

- AST trimmer improvements — 18% additional token size reduction.
- Batch window tuned from 500ms → 250ms for faster changelog generation.
- Caching now correctly invalidates on config file changes.

### 🤖 AI Providers

- Ollama health check on startup — clear error if not running.
- Added Anthropic Claude 3.5 Sonnet and Claude 3 Haiku support.
- Improved JSON response parsing — handles trailing commas and extra whitespace.

### 🎭 New Personas

- `robot` — machine-readable structured JSON, no prose.
- `data-analyst` — change metrics, file size deltas, complexity scores.
- `journalist` — narrative-style changelog for release blog posts.

### 🔌 Integration Fixes

- GitHub Actions: fixed step ordering for `devdiff generate`.
- Vite Plugin: HMR overlay now dismisses correctly after generation.
- `@eldrex/gateway`: fixed Mermaid `classDiagram` label stripping.

---

## [1.0.0] — 2026-06-15 · Initial Release

The first public release — your codebase's memory, not just its history.

### ✨ Core Engine

- Git diff parser with structured extraction (additions, deletions, renames, binary file detection).
- AST trimmer — reduces token usage by up to 85%.
- Secret scanner — regex + entropy-based auto-redaction.
- AI router with priority-based provider selection and fallback.
- Changelog generator — Markdown, JSON, and Mermaid diagram output.

### 🤖 AI Providers

- Ollama (local, offline) — default, auto-detected on `localhost:11434`.
- OpenAI — GPT-4o and GPT-3.5-turbo.
- Anthropic — Claude 3 Opus.
- Transformers.js — browser-based WebAssembly inference.

### 💻 CLI Commands

- `devdiff init` · `devdiff generate` · `devdiff watch`
- `devdiff vibe start|status|stop`
- `devdiff audit ai-calls|network|shell`
- `--persona`, `--format`, `--dry-run`, `--since`, `--verbose`

### 🎭 Initial Personas

Developer · CEO · Educator · PM · Compliance

### 🔌 Integrations

- VS Code extension with inline gutter annotations and sidebar.
- Vite plugin with HMR changelog overlay.
- GitHub Actions CI workflow for PR changelog comments.

### 📦 Initial Package Releases

| Package            | Description                    |
| ------------------ | ------------------------------ |
| `@eldrex/core`     | Core changelog engine          |
| `@eldrex/cli`      | Command-line interface         |
| `@eldrex/personas` | Persona definitions            |
| `@eldrex/gateway`  | AI gateway & Mermaid sanitizer |
| `@eldrex/vite`     | Vite HMR plugin                |
| `devdiff`          | VS Code extension              |
