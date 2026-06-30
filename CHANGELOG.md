# Changelog

All notable changes to DevDiff are documented here.

This project follows [Semantic Versioning](https://semver.org). Every released version is **immutable** — once published, a version works exactly the same forever. Updates are always opt-in. See the [Version Policy](https://github.com/EldrexDelosReyesBula/devdiff/blob/main/docs/versioning/policy.md).

---

## [1.0.3] — 2026-06-30 (Hardening Release)

The **Hardening** release locks in production-grade stability, a fully functional local playground, `create-devdiff-app` scaffolding, and the immutable versioning contract.

### 🔐 Immutable Version Guarantee
- **`VERSION_GUARANTEE` constant**: Published in `@eldrex/core` — documents the full immutability contract in code. Every published version works exactly as released, forever.
- **`checkConfigCompatibility()`**: Validates that your `.devdiff.config.js` is compatible with the running CLI version. Warns on minor mismatches, blocks on major version gaps.
- **`devdiff version --check`**: Fetches the latest version from npm with a 5-second timeout and graceful offline fallback. Displays side-by-side current vs. latest.
- **`devdiff version --changelog`**: Prints the embedded release history directly in your terminal — no browser required.

### 🎮 Local Playground (`devdiff playground`)
- **HTTP + WebSocket server** on port `3737` — launch with `devdiff playground`.
- **REST endpoints**: `/api/workspace` (git info), `/api/stats` (diff statistics), `/api/changelog` (generate live), `/api/personas` (list all 8).
- **Real-time file-change notifications** via WebSocket — the UI toasts whenever your workspace changes.
- **Dark glassmorphism UI** (`playground.html`) — sidebar with workspace/AI status, persona pills, format switcher, markdown/Mermaid/JSON output, and a session timer.

### 🏗️ `create-devdiff-app` Scaffolding
- New standalone package `create-devdiff-app` — run `npx create-devdiff-app` to scaffold a new project in seconds.
- **4 templates**: `enterprise-dashboard` (Express + Slack/SMTP), `startup-changelog` (public page + RSS), `ci-integration` (GitHub Actions + GitLab CI), `minimal` (bare SDK).

### 🌐 Public Demo Page
- Self-contained `packages/playground-demo/index.html` — zero server, zero backend. Open in any browser for a live demo with 5 sample repos and all 8 personas.

### 🧪 Pre-Release Verification Matrix
- **12-phase release gate** (`test/phase1–12` scripts) covering: environment setup, CLI commands, git integration, AI providers, personas, stress testing (1000 files), checkpoint recovery, playground APIs, security audits, and version immutability.
- **15/15 build tasks** and **100 unit tests** pass cleanly.

### 📚 Documentation
- VitePress docs updated with full troubleshooting suite: Ollama errors, Windows-specific issues, common fixes matrix.
- `devdiff generate --dry-run` confirmed working without AI — safe for CI environments.

### 🐛 Bug Fixes
- Fixed `ws` package bundling in `@eldrex/cli` by marking it as external in `tsup.config.ts`.
- Exported `getGitInfo`, `getDiffStats`, `getTotalFiles`, `checkAIStatus` from `@eldrex/core` index — resolves runtime import error.
- Fixed YAML frontmatter syntax error in `docs/index.md` (backtick in feature `details` field).

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
| Package | Version | Description |
|---------|---------|-------------|
| `@eldrex/core` | 1.0.0 | Core changelog engine |
| `@eldrex/cli` | 1.0.0 | Command-line interface |
| `@eldrex/personas` | 1.0.0 | Persona definitions |
| `@eldrex/gateway` | 1.0.0 | AI gateway & Mermaid sanitizer |
| `@eldrex/vite` | 1.0.0 | Vite HMR plugin |
| `devdiff` (VS Code) | 1.0.0 | VS Code extension |

---

*For upgrade instructions, see the [Version Policy](https://github.com/EldrexDelosReyesBula/devdiff/blob/main/docs/versioning/policy.md).*
