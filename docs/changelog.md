# Changelog

All notable changes to the DevDiff workspace packages will be documented in this file.

## [1.7.0] — 2026-08-16 · Agentic Platform, SKILL.md Unification, Memory Control & Trust Transparency

The **v1.7.0** release introduces the Unified Knowledge Architecture, Memory Control & Timeline Management, Output Quality & Never-Push-Incomplete Protection, SKILL.md Universal Agent Standard, Universal Study Buddy Plugin (`@eldrex/plugin-study-buddy`), and the Complete Trust & Transparency Platform.

### 🛡️ Trust & Transparency Platform

- **`NetworkGuardV2` & `NetworkConfig`**: Built-in 100+ domain blocklist across 5 categories (`telemetry`, `analytics`, `errorTracking`, `advertising`, `cdn_unknown`). Audits outbound requests into `.devdiff/audit/network.log`.
- **`PluginAuditor` & `DisclosureReport`**: Plugin manifest permission auditor and system transparency disclosure reports (`devdiff disclose`) detailing network activity, plugin behavior, filesystem access, shell execution history, AI processing, privacy guarantees, and compliance status (GDPR, HIPAA, SOC 2, CCPA).
- **CLI Commands**: `devdiff network watch`, `history`, `block`, `unblock`, `blocked`, `allowed`, `allow`, `disallow`, `export`, `audit`, `devdiff plugin audit`, `devdiff disclose`.

### 🗂️ Memory Timeline Control & Time-Aware Generation

- **`MemoryManager` & `MemoryConfig`**: Date range snapshot deletion (`devdiff memory delete --from --to --dry-run`), active range scoping (`devdiff memory use`), snapshot labeling (`devdiff memory categorize`), and storage deduplication (`devdiff memory optimize`).
- **`TimeAwareGenerator`**: Resolves human time expressions (`today`, `yesterday`, `this-week`, `date-range`, `since-initial`, `between-commits`) into git revision ranges.
- **CLI Commands**: `devdiff memory list`, `delete`, `use`, `categorize`, `categories`, `optimize`, `status`.

### 🧠 Unified Knowledge Architecture & Hallucination Guard

- **`UnifiedContext`**: Single source of truth knowledge resolution (`SKILL.md` → `.devdiff/context.md` → recursive tree scanner).
- **`ContextMemorySync`**: Timestamp-based auto-synchronization between persistent memory and `SKILL.md` updates.
- **`HallucinationGuard`**: Multi-stage verification verifying AI outputs against diff file paths, casing conventions, anti-pattern rules, and hedging language.

### 🎓 Universal Study Buddy Plugin (`@eldrex/plugin-study-buddy`)

- **Standalone Plugin**: Universal code explanation engine supporting ANY programming language across 5 progressive levels (`beginner`, `student`, `developer`, `senior`, `architect`).
- **Language Explainers**: Specialized explainers for CSS/SCSS (selectors and plain-English properties like `flex`, `grid`, `margin`, `padding`, `z-index`), JS/TS, Python, HTML, Rust, Go, plus universal fallback structural analyzer.
- **`StudyBuddyAIRouter`**: Priority AI router (IDE Agent → Local Ollama → Cloud AI).
- **CLI Commands**: `devdiff study explain`, `devdiff study ask`.

### 🎯 Output Quality Gates & Never-Push-Incomplete Protection

- **`CompletenessValidator`**: 6 structural checks for cut-offs, minimum length, intro-only text, ending punctuation, template indicators, and balanced code blocks.
- **`OutputQualityGate`**: 5-stage quality processor for AI outputs.
- **`NeverPushIncomplete`**: Throws errors to block git push/commit when generated output is cut off.

### 📄 SKILL.md Universal Agent Standard & MCP Tool

- **`SkillLoader`**: Loader, parser, auto-generator, and validator for 10-section `SKILL.md` files.
- **`devdiff_read_skill`**: MCP tool registered in `@eldrex/mcp` server.
- **CLI Commands**: `devdiff skill generate`, `validate`, `preview`.

---

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

## [1.5.0] - 2026-08-07 (Persistent Codebase Memory & Universal Intelligence Release)

The **v1.5.0** major release introduces persistent codebase memory, automated semantic versioning, universal project detection, SKILL.md knowledge base validation, developer sovereignty controls, natural changelogs, hardware-aware optimization, and 24/7 background operation scheduling.

### 🧠 Persistent Codebase Memory Engine

- **One-Time Full Scan**: Scans codebase once and saves indexed snapshot (`.devdiff/memory/codebase-index.json`).
- **Sub-50ms Index Queries**: Instant index-based lookup for time-range diffs, entity change histories, creation dates, purpose summaries, and dependencies.
- **Incremental Updates**: Detects Git commit changes and updates only modified files incrementally in milliseconds.
- **Continuous Conversation Context**: Resolves pronouns (`it`, `this`, `that`) automatically across multi-turn session chat history (`.devdiff/memory/conversation-history.json`).
- **Commands**: `devdiff memory init`, `devdiff memory status`, `devdiff memory rescan`, `devdiff memory clear-conversation`, `devdiff memory clear-all`, `devdiff ask "<question>"`.

### 📦 Automated Semantic Versioning & Release

- **Automated SemVer Detection**: Analyzes git diffs, export removals, function signature changes, SQL drops, and commit messages to calculate `MAJOR`, `MINOR`, or `PATCH` version bumps.
- **Keep a Changelog Formatting**: Groups change entries into `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security`.
- **One-Command Release**: `devdiff release` bumps version, updates CHANGELOG.md, creates git tag, and pushes to remote.

### 🔍 Universal Language & Project Detection

- **Universal Project Detector**: Analyzes single-file HTML/CSS/JS or Python scripts, static web apps, PWAs, Python projects, and generic repositories without requiring `package.json`.
- **Framework & Web API Scanning**: Detects CDN frameworks (Tailwind, Bootstrap, Vue, React, Alpine, HTMX, jQuery, Google Fonts) and Web APIs (`IndexedDB`, `localStorage`, `fetch`, `Web Speech`, `Vibration`).

### 🧠 SKILL.md Knowledge Base System

- **Project Knowledge Base**: Auto-generates `.devdiff/SKILL.md` covering 10 domain knowledge sections.
- **Commands**: `devdiff skill generate`, `devdiff skill validate`.

### 🔐 Developer Sovereignty & Cloud Guard

- **Explicit Cloud Opt-In (`CloudGuard`)**: Environment API keys are detected but **NEVER** called automatically without explicit setup via `devdiff auth add`.
- **Flexible Engine Exclusions (`FlexibleIgnore`)**: Engine operational files are filtered dynamically; `.devdiffignore` is fully developer-controlled.
- **Natural Developer Changelogs (`NaturalChangelogGenerator`)**: Sanitizes AI-sounding hedging terms (`appears to`, `seems to`) into factual past-tense developer language.
- **Git Commit Guard (`CommitGuard`)**: Generated files are never auto-staged or committed without explicit developer commands.

### ⚡ Low-End Device Optimizer & 24/7 Scheduler

- **Hardware-Aware Memory Caps**: RAM caps (128MB Low, 256MB Medium, 512MB High) and single-worker concurrency limits.
- **Battery & Thermal Throttling Guard**: Pauses background tasks during high thermal states or battery discharge.
- **24/7 Background Scheduler**: Pre-configured background operational tasks (`devdiff schedule list`).

---

## [1.0.6] - 2026-07-06 (Windows & Command Argument Hardening Release)

The **Windows & Command Argument Hardening** release resolves critical command execution, argument parsing, option ordering, and environment performance behaviors.
