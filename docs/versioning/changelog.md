# Changelog

All notable changes to DevDiff are documented here.

DevDiff uses [Semantic Versioning](https://semver.org). Every published version is **immutable** — it works exactly as released, forever. See the [Version Policy](./policy) for details.

---

## [1.0.3] — 2026-07-04 · Hardening Release

The **Hardening & Reliability** release locks in production-grade stability, a fully functional local playground, `create-devdiff-app` scaffolding, strict privacy enforcement, and the immutable versioning contract.

### 🔐 Security & Privacy

- **API key masking in logs**: Sensitive API keys are now masked dynamically, displaying only the first 6 and last 4 characters.
- **Secure File Permissions**: Enforced `600` read/write permissions on `.env` files automatically upon creation by the CLI tool.
- **Network Guard Firewall**: Standardized outbound restrictions blocking 20+ known telemetry/analytics platforms (Mixpanel, Sentry, Datadog) while strictly whitelisting configured local/cloud AI services.
- **Shell Command Sanitization**: Prevented command chaining and Metacharacter injection (e.g. `&&`, `||`, `;`) inside the CLI execution sandbox.
- **Path Traversal Protection**: Webhook receivers and file paths now perform strict boundary containment verification against path traversals.
- **Input Scripting Injection Guard**: Prevents prompt injection, shell escaping, SQL sequences, and path traversal vulnerabilities via strict input/commit message sanitization.
- **Encrypted Audit Trail**: Individual logs are now secured at rest using AES-256-GCM encryption with local key derivation.
- **Secure MCP Server**: Enabled authorization tokens by default for stdio and HTTP Model Context Protocol integrations.

### 🛠️ CLI Improvements

- **`devdiff auth` command suite**: Native CLI key manager providing interactive addition, listing, deletion, validation, and rotation of cloud AI credentials.
- **Secure terminal prompts**: Secure hidden password input streams (zero echo) implemented natively for CLI credential gathering.
- **Terminal Raw Mode Safeguards**: Added robust cleanup hooks restoring terminal state on error or process exits, preventing raw mode hangs.
- **Interactive Connectivity Tester**: Automated live endpoint handshakes (`fetch` probes) validating key integrity before saving.
- **`devdiff doctor --fix`**: Integrated self-repair routines correcting common permission, path, and configuration anomalies.
- **`devdiff monitor`**: Terminal-tail network monitoring dashboard streaming outbound requests in real-time.
- **`devdiff disclose`**: Privacy dashboard outputting comprehensive lists of filesystem, network, process, and memory limits.

### ⚡ Performance & Capping

- **File Watcher Debounce**: Introduced adaptive debounce limits to prevent CPU usage spikes on rapid workspace changes.
- **Large-Diff Streaming**: Diff parsers and sanitizers process files as streams, keeping memory spikes under 500MB on vibe coding edits.
- **IDE Thread Protection**: Dispatched heavy changelog logic to non-blocking microtasks (`setImmediate`), maintaining vscode responsiveness.
- **Checkers & Monitors**: Automated local storage caching and checkpoint compressions, reducing disk footprint by 60%.

### 🧠 AI & Accuracy

- **Project Context Generation**: Introduced context scrapers grounding the LLM with local README, package metadata, and directory indexes.
- **Ollama Model Auto-Detection**: Added dynamic model tag queries and code-specific capabilities scoring to routing loops.
- **Codebase Deep Indexer**: Performs lightweight structural indexing on first run to map monorepo directories and topologies.
- **AST Fingerprint Similarity**: Replaces token Jaccard similarity with structural regex fingerprinting (exports, methods, hooks) to track complex refactoring.
- **Extension & Size Prefilters**: Optimized memory overhead by pre-filtering pairs based on type (handling JS->TS migrations) and size brackets.
- **Import Matching Engine**: Resolves path aliases and relative imports to check for dangling references automatically.
- **Verification Layer**: Validates generated summaries against the raw diff using AccuracyGuard pre-checks and post-checks.
- **MVP (Deferred Queue) Mode**: Diffs exceeding 50,000 characters are saved as deferred JSON entries, enabling local templates fallback and async processing.

### 🔌 Integrations

- **CI/CD Actions**: Standardized actions templates for GitHub Actions and GitLab CI.
- **Webhook connectors**: Out-of-the-box streaming notifications support for Slack, Discord, Microsoft Teams, Telegram, and twilio-enabled WhatsApp.

### 📚 Documentation

- **VitePress Command Reference**: Published a complete CLI Command Dictionary and ports reference guide.
- **Troubleshooting guides**: Step-by-step resolution steps for Windows pathing, Ollama setup, network diagnostics, and WSL2 configurations.

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
