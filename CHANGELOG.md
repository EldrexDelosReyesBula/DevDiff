# Changelog

All notable changes to DevDiff are documented here.

This project follows [Semantic Versioning](https://semver.org). Every released version is **immutable** — once published, a version works exactly the same forever. Updates are always opt-in. See the [Version Policy](https://github.com/EldrexDelosReyesBula/devdiff/blob/main/docs/versioning/policy.md).

## [1.0.5] — 2026-07-06 · CLI Registry & Security Hardening

The **CLI Registry & Security Hardening** release introduces production-ready resilience, unified command validation, robust local playground fallback, autocomplete schemas, and visual documentation maps.

### 🤖 Local AI Resilience & Dynamic Timeouts
- **Dynamic Timeout Calculator**: Timeout duration is computed dynamically based on prompt size (tokens) to prevent connection timeouts with larger filesets.
- **Progressive Chunking fallback**: Retries failing request batches by progressively reducing chunk sizes and extending timeouts.
- **Ollama Port Auto-Fallback**: Resolves `EADDRINUSE` errors on port `3737` by dynamically finding and listening on subsequent available local ports.
- **Network Check Abort**: Corrected `http.request` timeout hangs by adding explicit abort hooks, ensuring network status pings fail fast.

### 🛡️ Advanced Security & Data Protection
- **Injection Guard V2**: Protects prompt interfaces from jailbreaks, SQL injections, shell command chain executions, XSS patterns, and prototype pollution.
- **Redaction Engine V2**: Strips secrets, private keys, passwords, API tokens, and credentials from all dry-run payloads.
- **CI/CD Secret Scanner**: Implemented a standalone, zero-dependency `security-scan.js` script to scan commit additions for secrets inside GitHub Actions pipelines.

### ⚙️ Command Registry & Developer Experience
- **Unified Command Registry**: Enforces centralized validation hooks, aliases, options, and structured terminal help text formatting.
- **Actionable Error Boundary**: Displays styled error blocks in the terminal with targeted recommendations and recovery options (e.g. `devdiff recover --last`).
- **Editor Autocomplete**: Generates a VS Code config schema (`devdiff schema`) and Bash/PowerShell auto-completions (`devdiff completions <shell>`).
- **Dashboard Unification**: Replaced the duplicate web dashboard with a unified, Design System-aligned playground interface.

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

## [1.0.2] — 2026-06-28 (Sentinel Release)

The **Sentinel** release introduced enterprise-grade security hardening, compliance frameworks, multi-agent swarms, and hardware-accelerated local inference.

### 🔒 Security Patches & Privacy

- **CVE Fixes**: Full security advisories registry covering malformed webhook path traversals (CVSS 9.1) and Git commit message prompt injection filters.
- **`PrivacyEnforcer`**: Regex-based engine that automatically flags and blocks sensitive API keys, credentials, environments, and private key structures before they reach any AI provider.
- **Local-First Protection**: Fully separates local execution lanes from cloud routing destinations.

### 🌍 Compliance Frameworks (10 Standards)

- **Built-in configs** for: GDPR, CCPA, HIPAA, SOC 2, FedRAMP, ISO 27001, PIPEDA, LGPD, PDPA, and Australia Privacy Act.
- **CLI commands**: `devdiff compliance list|apply|status|validate|report`

### ⚡ Local Inference & WebGPU

- **WebGPU Provider**: ONNX Runtime Web integration for local GPU-accelerated inference.
- **Fallback chain**: WebGPU → WebAssembly → CPU → Ollama — guarantees continuous offline operation.

### 🤖 Multi-Agent Swarms

- **`MultiAgentOrchestrator`**: Coordinates 4 specialized agents (Architect, Security, Performance, Documentation) for consensus-based change analysis.
- Agents collaborate in 4 phases: independent analysis → collaboration → consensus → synthesis.

### 🛡️ Vibe-Coder Guardian

- **Pre-AI checkpoints**: File-state snapshots taken automatically before any AI call.
- **Automatic recovery**: Falls back to alternative models on outages, with a full transparency report.
- **`devdiff recover --checkpoint <id>`**: Manual rollback to any saved state.

### 🎭 Personas & VS Code Extension

- **8 built-in personas**: Developer, CEO, Educator, PM, Compliance, Journalist, Data Analyst, Robot.
- **VS Code extension v1.0.2**: PNG icon asset support, offline setup guides, gutter annotations.

---

## [1.0.1] — 2026-06-20 (Stability Release)

The **Stability** release focused on hardening the core diff engine, fixing edge cases discovered after the v1.0.0 launch, and expanding AI provider compatibility.

### 🐛 Bug Fixes

- Fixed diff parser failing silently on repositories with no prior commits (empty `HEAD`).
- Resolved `ENOENT` crash when `.devdiff.config.js` was absent — now gracefully falls back to defaults.
- Fixed incorrect token count estimates for diffs containing Unicode characters.
- Corrected `devdiff watch` daemon not re-attaching after a `git reset --hard`.

### ⚡ Performance

- **AST trimmer**: Improved stripping of comments, blank lines, and import blocks — reduces average diff token size by an additional 18%.
- **Batch window**: Tuned default commit batching from 500ms to 250ms for faster changelog generation on rapid commits.
- Caching layer now correctly invalidates on `.devdiff.config.js` changes.

### 🤖 AI Provider Improvements

- Added explicit Ollama connectivity health check on startup — surfaces a clear error if Ollama isn't running rather than hanging.
- Added support for Anthropic Claude model family (claude-3-5-sonnet, claude-3-haiku).
- Improved JSON output parsing robustness — handles trailing commas and extra whitespace in model responses.

### 🎭 Personas

- Added `robot` persona — machine-readable structured JSON output with no prose.
- Added `data-analyst` persona — numerical change metrics, file size deltas, and complexity scores.
- Added `journalist` persona — narrative-style changelog suitable for release blog posts.

### 🔌 Integrations

- **GitHub Actions**: Fixed workflow step ordering to ensure `devdiff generate` runs after `git checkout`.
- **Vite Plugin**: Fixed HMR overlay not dismissing after successful changelog generation.

### 📦 Package Fixes

- `@eldrex/gateway`: Fixed Mermaid diagram sanitization stripping valid `classDiagram` labels.
- `@eldrex/personas`: Added missing TypeScript type exports.

---

## [1.0.0] — 2026-06-15 (Initial Release)

The **first public release** of DevDiff — your codebase's memory, not just its history.

### ✨ Core Engine (`@eldrex/core`)

- **Git diff parser**: Watches `.git` for changes; extracts structured diffs (additions, deletions, renames, binary files).
- **AST trimmer**: Strips comments, blank lines, and boilerplate before sending to AI — reduces token usage by up to 85%.
- **Secret scanner**: Regex + entropy-based detection of API keys, tokens, and credentials — auto-redacts before AI processing.
- **AI router**: Priority-based provider selection with automatic fallback.
- **Changelog generator**: Produces structured Markdown, JSON, or Mermaid diagram output.

### 🤖 AI Providers (initial support)

- **Ollama** (local, offline) — default provider, auto-detected on `localhost:11434`.
- **OpenAI** — GPT-4o and GPT-3.5-turbo via API key.
- **Anthropic** — Claude 3 Opus via API key.
- **Transformers.js** — browser-based in-process inference (WebAssembly).

### 💻 CLI (`@eldrex/cli`)

- `devdiff init` — scaffold `.devdiff.config.js` with interactive prompts.
- `devdiff generate` — one-shot changelog generation for staged or committed changes.
- `devdiff watch` — background daemon that auto-generates on every commit.
- `devdiff vibe start|status|stop` — Vibe Coding session management with checkpointing.
- `devdiff audit ai-calls|network|shell` — transparency audit logs.
- `--persona`, `--format`, `--dry-run`, `--since`, `--verbose` flags supported.

### 🎭 Initial Personas (5)

- `developer` — technical, code-focused summary.
- `ceo` — executive-level business impact.
- `educator` — teaching-oriented explanation for junior developers.
- `pm` — project management, ticket-style summary.
- `compliance` — regulatory and audit-ready language.

### 🔌 Integrations

- **VS Code extension** (`devdiff`) — inline gutter annotations, sidebar changelog view, command palette integration.
- **Vite plugin** (`@eldrex/vite`) — HMR overlay showing live changelog as you code.
- **GitHub Actions** — CI workflow that posts a changelog comment on every PR.

### 📦 Initial Package Releases

| Package             | Version | Description                    |
| ------------------- | ------- | ------------------------------ |
| `@eldrex/core`      | 1.0.0   | Core changelog engine          |
| `@eldrex/cli`       | 1.0.0   | Command-line interface         |
| `@eldrex/personas`  | 1.0.0   | Persona definitions            |
| `@eldrex/gateway`   | 1.0.0   | AI gateway & Mermaid sanitizer |
| `@eldrex/vite`      | 1.0.0   | Vite HMR plugin                |
| `devdiff` (VS Code) | 1.0.0   | VS Code extension              |

---

_For upgrade instructions, see the [Version Policy](https://github.com/EldrexDelosReyesBula/devdiff/blob/main/docs/versioning/policy.md)._
