# Changelog

All notable changes to DevDiff are documented here.

## [1.8.0] — 2026-08-21 · Multi-Registry Extension Distribution, External Plugin Architecture & Documentation Overhaul

The **v1.8.0** release establishes unified distribution across both the VS Code Marketplace and Open VSX Registry, cleanly decouples third-party plugins into standalone repositories, overhauls the documentation suite to human-craft engineering standards, and standardizes local release gate verification.

### Added & Enhanced

- **Universal Multi-Registry Distribution**:
  - Published and verified identical `.vsix` binaries across both the **VS Code Marketplace** (`ebula.devdiff`) and the **Open VSX Registry** (`ebula/devdiff`).
  - Added dedicated installation instructions for VS Code, Cursor, Windsurf, VSCodium, Gitpod, and Eclipse Theia.
- **External Plugin Decoupling**:
  - Extracted Study Buddy into a dedicated external standalone repository (`@eldrex/plugin-study-buddy` at [github.com/EldrexDelosReyesBula/devdiff-study-buddy](https://github.com/EldrexDelosReyesBula/devdiff-study-buddy)).
  - Refactored core `explainCode` engine to natively utilize `ProgressiveExplainer` with 5 skill levels.
  - Consolidated official reference plugins into documentation and template repository.
- **Documentation & UI/UX Overhaul**:
  - Refactored entire documentation portal to human-craft engineering standards, eliminating robotic jargon and emoji clutter.
  - Configured minimalist, high-contrast dark Mermaid diagram theme matching modern IDE design systems.
  - Streamlined sidebar navigation with clear, developer-friendly titles.
- **Repository Hygiene & Test Architecture**:
  - Reorganized end-to-end and stress tests into structured `test/e2e`, `test/stress`, and `test/performance` directories.
  - Added root release gate shortcuts (`pnpm gate` and `pnpm gate:ps`).
  - Minified VS Code extension bundle to 3.82 MB.
  - 100% test pass rate across 38 test suites (217 unit tests).

---

## [1.7.0] — 2026-08-16 🚀 Agentic Platform, Dynamic Security Engine, Universal Prompt Export, Plugin Protection & VS Code Overhaul

The **v1.7.0** release introduces the Agent Orchestration & OpenClaw Integration Platform, Dynamic Security Engine, Universal AI Prompt Export & Import Engine, Plugin Security & Supply Chain Protection, Complete VS Code Native UI/UX Overhaul, Full Chat Editor Tab Window, Unified Knowledge Architecture, Memory Control & Timeline Management, Output Quality Gates, and the Complete Trust & Transparency Platform.

### 🌟 Added

#### 🤖 Agent Orchestration Platform & OpenClaw Supervisor v2

- **`AgentRegistry`**: Universal agent connector supporting OpenClaw, Copilot, Gemini, Claude, and custom agents. Implements capability scoring, task delegation with fallback routing, parallel swarm execution with pairwise consensus building (`agreements`, `disagreements`, `confidence`), and inter-agent bus messaging.
- **`OpenClawSupervisorV2`**: Loads `.devdiff/agents/openclaw/supervisor.yaml` configuration. Decomposes tasks into subtask graphs (`changelog_generation`, `security_audit`, `answer_question`), enforces output validation thresholds (`auto_approve_threshold: 85`), and manages multi-channel escalation.
- **CLI Commands**: `devdiff agent swarm`, `deploy`, `ask`, `parallel`, `converse`, `status`, `dashboard`.

#### 📋 Universal AI Prompt Export & Import Engine

- **`PromptGenerator`**: Generates copy-paste-ready prompts tailored for ChatGPT, Claude, Gemini, Copilot, or generic LLMs across 8 developer personas. Assembles project context, `SKILL.md` rules, recent changes, git diffs, and output schemas with token estimation.
- **`ImportEngine`**: Strips conversational preambles/postscripts, extracts code blocks, validates completeness (`CompletenessValidator`) and quality (`OutputQualityGate`), reads from OS clipboards (`pbpaste`, `powershell Get-Clipboard`, `xclip`), and prepends to `CHANGELOG.md`.
- **CLI Commands**: `devdiff prompt export` and `devdiff import changelog`.

#### 🧠 Dynamic Security Engine

- **`BehavioralEngine`**: Learns 7-day baseline profiles across 5 dimensions (Network, Filesystem, AI Usage, Plugins, Development) and detects real-time activity anomalies.
- **`AdaptiveRuleEngine`**: Ingests threat feeds from `https://devdiff.vercel.app/api/security/threat-intel.json`, tracks true/false positive feedback, auto-disables rules hitting 5 false positives, and calculates accuracy metrics.
- **CLI Commands**: `devdiff security profile`, `check`, `rules`, `feedback`, `feed`.

#### 🛡️ Plugin Security & Supply Chain Protection

- **`DependencyScanner`**: Scans transitive dependencies up to depth 10, queries live OSV API (`api.osv.dev`) and npm APIs, detects native binary modules (`.node`, `.so`, `.dll`), and extracts network endpoints.
- **`ObfuscationDetector`**: 8-indicator code obfuscation threat scoring engine.
- **`PermissionReviewer`**: Audits declared manifest permissions against code capabilities.
- **`PluginConsentModal`**: VS Code webview consent modal rendering visual dependency tree nodes and threat findings.

#### 🎨 VS Code Native UI/UX Overhaul & Full Chat Window

- **`NativeTheme` & `Spacing`**: Uses VS Code `--vscode-*` CSS variables exclusively with 0 hardcoded colors and 4px grid spacing rhythm.
- **`SidebarView`**: Undistracted Webview sidebar provider with single primary CTA and collapsible sections.
- **`Accessibility`**: WCAG 2.1 AA compliant with high-contrast overrides (`prefers-contrast: high`), screen reader announcements (`aria-live`), focus indicators (`:focus-visible`), and reduced motion (`prefers-reduced-motion: reduce`).
- **`CalmNotifications` & `ZeroImpactPerformance`**: Non-intrusive status bar progress spinners, lazy command loading, and 1-second debounced file watching ($<50\text{MB}$ RAM).
- **`FullChatWindow` & `ChatHistory`**: Opens full editor tab chat panel (`vscode.ViewColumn.Active`) with state retention (`retainContextWhenHidden`), multi-thread conversation persistence in `globalState`, thread search, clear, and Markdown export (`devdiff.openFullChat`).

#### 🛡️ Trust & Transparency Platform

- **`NetworkGuardV2` & `NetworkConfig`**: Built-in 100+ domain blocklist across 5 categories (`telemetry`, `analytics`, `errorTracking`, `advertising`, `cdn_unknown`). Audits outbound requests into `.devdiff/audit/network.log`.
- **`PluginAuditor`**: Audits installed plugins by comparing declared manifest permissions (network, filesystem, shell, AI) against real execution logs.
- **`DisclosureReport`**: Generates full system transparency disclosure reports (`devdiff disclose`) detailing 30-day network activity, plugin behavior, filesystem access, shell execution history, AI processing, privacy guarantees, and compliance status (GDPR, HIPAA, SOC 2, CCPA).
- **CLI Commands**: Added `devdiff network watch`, `history`, `block`, `unblock`, `blocked`, `allowed`, `allow`, `disallow`, `export`, `audit`, `devdiff plugin audit`, and `devdiff disclose`.

#### 🗂️ Memory Timeline Control & Time-Aware Generation

- **`MemoryManager` & `MemoryConfig`**: Date range snapshot deletion (`devdiff memory delete --from --to --dry-run`), active range scoping (`devdiff memory use`), snapshot labeling (`devdiff memory categorize`), and storage deduplication (`devdiff memory optimize`).
- **`TimeAwareGenerator`**: Resolves human time expressions (`today`, `yesterday`, `this-week`, `date-range`, `since-initial`, `between-commits`) into git revision ranges.
- **CLI Commands**: Added `devdiff memory list`, `delete`, `use`, `categorize`, `categories`, `optimize`, `status`.

#### 🧠 Unified Knowledge Architecture & Hallucination Guard

- **`UnifiedContext`**: Single source of truth knowledge resolution (`SKILL.md` → `.devdiff/context.md` → recursive tree scanner).
- **`ContextMemorySync`**: Timestamp-based auto-synchronization between persistent memory and `SKILL.md` updates.
- **`HallucinationGuard`**: Multi-stage verification verifying AI outputs against diff file paths, casing conventions, anti-pattern rules, and hedging language.

#### 🎓 Universal Study Buddy Plugin (`@eldrex/plugin-study-buddy`)

- **Standalone Plugin**: Universal code explanation engine supporting ANY programming language across 5 progressive levels (`beginner`, `student`, `developer`, `senior`, `architect`).
- **Language Explainers**: Specialized explainers for CSS/SCSS (selectors and plain-English properties like `flex`, `grid`, `margin`, `padding`, `z-index`), JS/TS, Python, HTML, Rust, Go, plus universal fallback structural analyzer.
- **`StudyBuddyAIRouter`**: Priority AI router (IDE Agent → Local Ollama → Cloud AI).
- **CLI Commands**: `devdiff study explain` and `devdiff study ask`.

#### 🎯 Output Quality Gates & Never-Push-Incomplete Protection

- **`CompletenessValidator`**: 6 structural checks for cut-offs, minimum length, intro-only text, ending punctuation, template indicators, and balanced code blocks.
- **`OutputQualityGate`**: 5-stage quality processor for AI outputs.
- **`NeverPushIncomplete`**: Throws errors to block git push/commit when generated output is cut off.

#### 📄 SKILL.md Universal Agent Standard & MCP Tool

- **`SkillLoader`**: Loader, parser, auto-generator, and validator for 10-section `SKILL.md` files.
- **`devdiff_read_skill`**: MCP tool registered in `@eldrex/mcp` server.
- **CLI Commands**: `devdiff skill generate`, `validate`, `preview`.

#### 🤝 Community Growth & Feedback Engine

- **Trust Banners**: Added privacy trust banners to package READMEs.
- **Review Prompt Manager**: `ReviewPrompt` managing milestone prompts (`[5, 10, 25, 50, 100]`), 30-day cooldown, and selection idle detection via `waitForIdle()`.
- **Feedback Commands**: Added `devdiff.feedback` QuickPick dialog in VS Code extension.

---

## [1.6.1] — 2026-08-09 🛠️ Monorepo Hardening & Type Exports

### Fixed & Improved

- **Type Declaration Exports**: Re-exported `FileChangeInfo` from `@eldrex/core` (`packages/core/src/index.ts`) for clean TypeScript type resolution.
- **Monorepo Typechecking**: Removed `rootDir: "./src"` constraint from package `tsconfig.json` files to support cross-package monorepo typechecking.
- **Vercel ESM Compatibility**: Converted `scripts/build-docs.js` to ES module syntax (`import { execSync } from "child_process"`).
- **Code Style Hardening**: Workspace-wide Prettier formatting for 100% clean CI lint validation.

---

## [1.6.0] — 2026-08-08 🚀 Production Readiness, Study Buddy & Zero-Friction Onboarding

The **v1.6.0** release delivers full production deployment readiness: VS Code 4-panel sidebar, `@devdiff` native chat participant, Study Buddy Mode (`devdiff study`), Zero-Friction AI Detection (`AIDetector`), Native Virtual Editor Getting Started Guide, Plugin Security Scanner (`PluginSecurityScanner`), `IDEGuardian` worker isolation, complete package manifest hardening for npm publishing, expanded AI provider suite (Groq, Gemini, DeepSeek, Transformers.js), and the DevDiff Reference Dictionary.

### 🎓 DevDiff Study Buddy Mode (`devdiff study`)

- **Interactive Codebase Study Buddy**: Interactive senior developer AI assistant for students, beginners, and developers exploring new projects.
- **Line-by-Line Educational Explanations**: Provides Overview, Line-by-Line breakdown with "Why?" rationale, Key Concepts Learned, Try It Yourself experiments, and Related Concepts.
- **`study-buddy` Persona**: Warm, encouraging educational persona (9th built-in persona).
- **5 CLI Commands**: `devdiff study start`, `devdiff study tour`, `devdiff study learn <topic>`, `devdiff study ask "<question>"`, `devdiff study quiz <topic>`.
- **VS Code Triggers**: `devdiff.study.start` and `devdiff.study.explain` integration.

### ⚡ Zero-Friction AI Detection & Guidance (`AIDetector`)

- **Multi-Path Auto-Detection**: Priority evaluation of 3 AI paths:
  1. Ollama (Local) — detects running models on `http://localhost:11434`.
  2. IDE Agent — detects VS Code / Cursor environment for `@devdiff` chat with 0 setup.
  3. Cloud AI — detects environment API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `DEEPSEEK_API_KEY`).
- **OS-Tailored Instructions**: Returns platform-specific setup commands for Windows (`win32`), macOS (`darwin`), and Linux.

### 📖 Native Virtual Editor Getting Started Guide

- **Virtual Markdown Provider**: `devdiff://onboarding/DEVDIFF_GETTING_STARTED.md` opens a native Virtual Markdown tab on first install.
- **Personalized Quick Start**: Generates getting started steps customized to live `AIDetector` results.
- **Command Palette Action**: `DevDiff: Show Getting Started Guide` (`devdiff.showGettingStarted`).

### 🛡️ Plugin Ecosystem Security Scanner (`PluginSecurityScanner`)

- **7-Pass Static Security Auditing**:
  1. Network Destinations (flags raw GitHub, ngrok, serveo, localtunnel, pastes, raw IPs, `.ru`/`.cn`/`.su` TLDs).
  2. Shell Command Execution (flags `child_process`, `execSync`, `spawn`, `exec`, `SHELL`).
  3. External Filesystem Access (flags access outside workspace boundary).
  4. Obfuscation Detection (flags `eval`, `atob`, `btoa`, `Function`, `fromCharCode`, hex/unicode escapes, un-reviewable minified code).
  5. Telemetry & Exfiltration Patterns (`telemetry`, `analytics`, `track`, `collect`, `beacon`, `sendBeacon`).
  6. Publisher Identity Signatures (flags unsigned plugins).
  7. Undeclared Permission Analysis (compares declared manifest permissions vs actual code usage).

### 📖 DevDiff Reference Dictionary (`docs/guide/dictionary.md`)

- Single-page reference manual for:
  - 16 CLI Commands
  - 10 VS Code Commands + `@devdiff` Chat Participant
  - 6 MCP Tools
  - 11 Configuration Settings
  - 7 Environment Variables
  - 9 Personas (`developer`, `ceo`, `educator`, `robot`, `data-analyst`, `journalist`, `pm`, `compliance`, `study-buddy`)
  - Default Network Ports (`11434` Ollama, `3000` Gateway)

### 🖥️ VS Code Extension — 4-Panel Sidebar Architecture

- **Changelog Explorer**: Inspect staged diff summaries, preview markdown changelogs, and render Mermaid architecture diagrams directly inside VS Code.
- **Q&A Chat Panel (`@devdiff`)**: Registered as a VS Code native chat participant — use `@devdiff` directly in VS Code Chat view in <50ms.
- **Security & Compliance Panel**: One-click vulnerability scanning against 10 regulatory frameworks (GDPR, SOC 2, HIPAA, FedRAMP, ISO 27001).
- **Settings & Personas Panel**: Configure AI model, active persona, secret redaction rules, and memory caps from a dedicated webview.
- Added `devdiff.model`, `devdiff.memoryCapMb`, `devdiff.idleDetectionSeconds` settings.
- Fixed extension `categories`: `["AI", "Other"]`.

### 🛡️ IDEGuardian Worker Isolation

- All AI inference and memory operations execute inside isolated Node.js worker threads.
- Hard 256MB memory ceiling enforced per worker with automatic cleanup on completion.
- 5-second typing activity idle detection pauses background tasks during active coding sessions.

### 📦 Package Publishing Readiness

- Added `"access": "public"` to `publishConfig` across all scoped `@eldrex/*` packages (`core`, `cli`, `mcp`, `plugin-sdk`, `gateway`, `vite`, `personas`, `connectors`).
- Fixed `create-devdiff-app`: added `publishConfig`, `files: ["dist"]`, `author`, `repository`, bumped `engines` from `>=18` to `>=20`.
- Added TypeScript monorepo path mappings for all 12 packages in root `tsconfig.json`.

---

## [1.5.1] — 2026-08-08

### Changed

- Updated `.devdiff.config.js`
- Updated `package.json`
- Updated `index.ts`
- Updated `persistent-memory.ts`
- Updated `conversational-qa.ts`
- Updated `server-v2.ts`
- Updated `codebase-query-tools.ts`

---

## [1.5.0] — 2026-08-07 🧠 Persistent Codebase Memory & Universal Intelligence

- Persistent Codebase Memory Engine (`.devdiff/memory/codebase-index.json`).
- Sub-50ms index queries and continuous conversation context (`.devdiff/memory/conversation-history.json`).
- Automated Semantic Versioning & Release (`devdiff release`).
- Universal Project Detector (60+ language extensions, CDN frameworks, Web APIs).
- SKILL.md Knowledge Base System (`devdiff skill generate`).
- Developer Sovereignty (`CloudGuard`, `FlexibleIgnore`, `NaturalChangelogGenerator`).
- Hardware-Aware Memory Caps & 24/7 Background Scheduler.

---

## [1.0.6] — 2026-07-06 🪟 Windows & Command Argument Hardening

- Fixed Commander argument parsing and option flag ordering.
- Tuned Windows process performance test threshold bounds.

---

## [1.0.5] — 2026-07-06 🔒 CLI Registry & Security Hardening

- Unified command validation, playground fallback routing, autocomplete schemas.

---

## [1.0.4] — 2026-07-01 🎨 Unified Design System

- Unified Design System across CLI output and VS Code extension UI.

---

## [1.0.3] — 2026-06-30 🔗 Integrations Release

- Standardized CI/CD Actions templates and webhook streaming connectors.

---

## [1.0.2] — 2026-06-28 🛡️ Sentinel Release

- Enterprise-grade security hardening with `PrivacyEnforcer` and 10 compliance frameworks.

---

## [1.0.1] — 2026-06-20 🔧 Stability Release

- AST trimmer improvements, bug fixes, and AI provider expansion.

---

## [1.0.0] — 2026-06-15 🚀 Initial Release

- First public release of DevDiff core engine, CLI, VS Code extension, Vite plugin, and gateway.

---

This project follows [Semantic Versioning](https://semver.org). Every released version is **immutable** — once published, it works exactly the same forever. See the [Version Policy](https://devdiff.vercel.app/versioning/policy).
