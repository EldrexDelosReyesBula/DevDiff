# Changelog

All notable changes to DevDiff are documented here.

## [1.5.0] — 2026-08-07 · Persistent Codebase Memory & Universal Intelligence

The **v1.5.0** major release introduces persistent codebase memory, automated semantic versioning, universal project detection, SKILL.md knowledge base validation, developer sovereignty controls, natural changelogs, hardware-aware optimization, and 24/7 background operation scheduling.

### 🧠 Persistent Codebase Memory Engine
- **One-Time Full Scan**: Scans codebase once and saves indexed snapshot (`.devdiff/memory/codebase-index.json`).
- **Sub-50ms Index Queries**: Instant index-based lookup for time-range diffs, entity change histories, creation dates, purpose summaries, and dependencies.
- **Incremental Updates**: Detects Git commit changes and updates only modified files incrementally in milliseconds.
- **Continuous Conversation Context**: Resolves pronouns (`it`, `this`, `that`) automatically across multi-turn session chat history (`.devdiff/memory/conversation-history.json`).
- **Historical Snapshot Comparisons**: Saves historical repository snapshots over time (`.devdiff/memory/snapshot-history.json`).
- **Commands**: `devdiff memory init`, `devdiff memory status`, `devdiff memory rescan`, `devdiff memory clear-conversation`, `devdiff memory clear-all`, `devdiff ask "<question>"`.

### 📦 Automated Semantic Versioning & Release
- **Automated SemVer Detection**: Analyzes git diffs, export removals, function signature changes, SQL drops, and commit messages to calculate `MAJOR`, `MINOR`, or `PATCH` version bumps.
- **Keep a Changelog Formatting**: Groups change entries into `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security`.
- **One-Command Release**: `devdiff release` bumps version, updates CHANGELOG.md, creates git tag, and pushes to remote in a single command.
- **Commands**: `devdiff version bump --type auto`, `devdiff release`.

### 🔍 Universal Language & Project Detection
- **Universal Project Detector**: Analyzes single-file HTML/CSS/JS or Python scripts, static web apps, PWAs, Python projects, and generic repositories without requiring `package.json`.
- **Framework & Web API Scanning**: Detects CDN frameworks (Tailwind, Bootstrap, Vue, React, Alpine, HTMX, jQuery, Google Fonts) and Web APIs (`IndexedDB`, `localStorage`, `fetch`, `Web Speech`, `Vibration`).
- **60+ Language Extensions**: Mapped extension parser for all popular programming languages.

### 🧠 SKILL.md Knowledge Base System
- **Project Knowledge Base**: Auto-generates `.devdiff/SKILL.md` covering 10 domain knowledge sections (Project Identity, Architecture, Naming Conventions, Business Domain, Patterns, Anti-Patterns, Compliance, Output Preferences, Team Context, Historical Context).
- **Commands**: `devdiff skill generate`, `devdiff skill validate`.

### 🔐 Developer Sovereignty & Cloud Guard
- **Explicit Cloud Opt-In (`CloudGuard`)**: Environment API keys (`OPENAI_API_KEY`, etc.) are detected but **NEVER** called automatically without explicit setup via `devdiff auth add`.
- **Flexible Engine Exclusions (`FlexibleIgnore`)**: Engine operational files are filtered dynamically; `.devdiffignore` is fully developer-controlled and never modified automatically.
- **Natural Developer Changelogs (`NaturalChangelogGenerator`)**: Sanitizes AI-sounding hedging terms (`appears to`, `seems to`, `could potentially`) into factual past-tense developer language.
- **Git Commit Guard (`CommitGuard`)**: Generated files are never auto-staged or committed without explicit developer commands.

### ⚡ Low-End Device Optimizer & 24/7 Scheduler
- **Hardware-Aware Memory Caps**: Automatically applies RAM caps (128MB Low, 256MB Medium, 512MB High) and single-worker concurrency limits on low-spec hardware.
- **Battery & Thermal Throttling Guard**: Pauses background tasks during high thermal states or battery discharge.
- **24/7 Background Scheduler**: Pre-configured background operational tasks for morning standup digests and weekly security audits (`devdiff schedule list`).

---

## [1.0.6] — 2026-07-06 · Windows & Command Argument Hardening

The **Windows & Command Argument Hardening** release resolves critical command execution, argument parsing, option ordering, and environment performance behaviors:

- **Commander Argument Parsing**: Filtered out Command class instances from execution argument arrays, preventing CLI parameter mismatches.
- **Option Flag Standardization**: Re-ordered option flags so short options are parsed before long options consistently (e.g. `-p, --persona`).
- **Windows Process Performance**: Tuned test threshold bounds to accommodate child process spawning time on Windows file structures.
- **Port Reuse Handlers**: Verified playground listen fallback routines handling port collisions natively.

---

This project follows [Semantic Versioning](https://semver.org). Every released version is **immutable** — once published, a version works exactly the same forever. Updates are always opt-in. See the [Version Policy](https://github.com/EldrexDelosReyesBula/devdiff/blob/main/docs/versioning/policy.md).

## [1.0.5] — 2026-07-06 · CLI Registry & Security Hardening

The **CLI Registry & Security Hardening** release introduces production-ready resilience, unified command validation, robust local playground fallback, autocomplete schemas, and visual documentation maps.
