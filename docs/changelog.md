# Changelog

All notable changes to the DevDiff workspace packages will be documented in this file.

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
