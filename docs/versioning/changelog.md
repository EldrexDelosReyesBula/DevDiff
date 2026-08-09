# Changelog

All notable changes to DevDiff are documented here.

DevDiff uses [Semantic Versioning](https://semver.org). Every published version is **immutable** — it works exactly as released, forever. See the [Version Policy](./policy) for details.

## [1.6.0] — 2026-08-08 · IDE-Native Reliability & Hardening

The **IDE-Native Reliability & Hardening** release pivots DevDiff to an IDE-native experience. Everything takes place inside VS Code, the CLI, and your custom SDK applications:

### 🖥️ IDE-Native Architecture
- **4 VS Code Sidebar Panels**: Changelog Explorer, Q&A Chat Panel, Security & Compliance Panel, and Settings Panel.
- **`@devdiff` Chat Integration**: Native VS Code chat participant (`@devdiff`) answering questions in <500ms using persistent memory.
- **IDEGuardian Performance Protection**: Worker task execution, 256MB memory cap, 5s typing activity idle tracking, and 120s safety timeouts so DevDiff never freezes the editor.
- **Gutter Annotations & CodeLens**: Inline `⚡ DevDiff: Explain Changes` CodeLens triggers directly inside active file editors.

### 🎨 Unified Design System & SDK
- **Adaptive Design System Tokens**: Theme-adaptive VS Code colors, font tokens, and Codicon icons.
- **Build-Your-Own-Dashboard**: SDK documentation and guides for developers building custom web dashboards, Slack integrations, or internal team tools.

### 📊 Cross-Platform CLI Updates
- **Improved Windows Support**: `win32-shell.ts` and `windows-hardening.ts` stabilize Windows execution, arg parsing, and shell command handling.
- **Config Command**: New `devdiff config set` and `devdiff config get` commands to manage engine flags, scheduler settings, notification endpoints, cloud integrations, and memory policies.

---

## [1.5.0] — 2026-08-07 · Persistent Codebase Memory & Continuous Chat

The **Persistent Codebase Memory & Continuous Chat** release introduces a persistent, fast-query codebase memory engine that eliminates re-scanning and remembers conversation context across sessions.

### 🧠 Persistent Codebase Memory Engine

- **One-Time Full Scan**: Scans codebase once and saves indexed snapshot (`.devdiff/memory/codebase-index.json`).
- **Sub-50ms Index Queries**: Instant index-based lookup for time-range diffs, entity change histories, creation dates, purpose summaries, and dependencies.
- **Incremental Updates**: Detects Git commit changes and updates only modified files incrementally in milliseconds.
- **Continuous Conversation Context**: Resolves pronouns (`it`, `this`, `that`) automatically across multi-turn session chat history (`.devdiff/memory/conversation-history.json`).
- **Historical Snapshot Comparisons**: Saves historical repository snapshots over time (`.devdiff/memory/snapshot-history.json`).

### 💻 New CLI Commands

- `devdiff memory init` · `devdiff memory status` · `devdiff memory rescan` · `devdiff memory clear-conversation` · `devdiff memory clear-all`
- `devdiff ask "<question>"`

---

## [1.0.6] — 2026-07-06 · Windows & Command Argument Hardening

The **Windows & Command Argument Hardening** release resolves critical command execution, argument parsing, option ordering, and environment performance behaviors:

- **Commander Argument Parsing**: Filtered out Command class instances from execution argument arrays, preventing CLI parameter mismatches.
- **Option Flag Standardization**: Re-ordered option flags so short options are parsed before long options consistently (e.g. `-p, --persona`).
- **Windows Process Performance**: Tuned test threshold bounds to accommodate child process spawning time on Windows file structures.
- **Port Reuse Handlers**: Verified playground listen fallback routines handling port collisions natively.

---

## [1.0.5] — 2026-07-06 · CLI Registry & Security Hardening

The **Agentic Workspace & Supervisor** release introduces a hyper-optimized developer playground with a responsive React layout, CORS-enabled port routing, OpenClaw Supervisor automation, and comprehensive messaging connector integrations.

### 🎮 Playground & Developer Workspace

- **Enterprise-Grade React UI:** Overhauled the playground into a robust React application featuring collapsible three-panel file explorer, side-by-side code editor/diff viewer, and settings panel.
- **Dynamic CORS & Port Routing:** Automatically detects custom port hosting (such as VS Code Live Server on port `5500`) and routes API calls securely back to the local backend gateway on port `3737`.
- **AI Chat Relay & Animations:** Added smooth bouncing dot streaming loading animation and fade-in/slide-in bubble transitions for chat responses.
- **Mobile Responsiveness:** Implemented custom bottom-tab-bar navigation for mobile screens, ensuring a full workspace layout experience on everything from a 5" phone to a 32" 4K display.

### 🤖 OpenClaw Supervisor Swarm

- **Supervisor Pipeline Automation:** Added YAML-based supervisor orchestration (`.devdiff/automations/supervisor-pipeline.yaml`) for routing tasks to distinct agent personas.
- **Resilient Fallback Handlers:** Automatically intercepts model timeout, context overflow, connection refusal, or output format failures, and executes smart recovery chains (pruning context, switching models, re-prompting).
- **Dependency Auto-Installation:** Standardized package manager detection (`npm`, `pnpm`, `yarn`, `bun`) to automatically verify and install missing local binaries and models.
- **Human-in-the-Loop Reviews:** Provides interactive terminal TTY prompts (`Approve`, `Reject`, `Modify`, `Delegate`) with automatic non-interactive fallbacks for CI/CD environments.

### 🔌 Connectors & Messaging Platforms

- **Unified Connectors Registry:** Extracted notification pathways into `@eldrex/connectors` featuring complete credential validation.
- **Multi-Platform Support:** Added native endpoints and formatting configurations for Slack, Discord, Telegram, Microsoft Teams, WhatsApp, Email, Custom HTTP Webhooks, OpenClaw Bus, and MCP Protocol.

---

## [1.0.4] — 2026-07-04 · Maintenance Release

A maintenance update fixing internal workspace routing and dependency structures.

### 🛠️ Internal Stability

- Resolves cross-dependency compilation order inside the pnpm workspace.
- Cleans and aligns local TSConfig configurations across all monorepo packages.

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
