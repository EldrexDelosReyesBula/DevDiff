# Changelog

All notable changes to the DevDiff workspace packages will be documented in this file.

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
