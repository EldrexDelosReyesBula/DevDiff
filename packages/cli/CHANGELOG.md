# @eldrex/cli

## 1.7.0

### Minor Changes

- **`devdiff agent` command group**: `swarm`, `deploy`, `ask`, `parallel`, `converse`, `status`, `dashboard` — deploys multi-agent swarms and OpenClaw Supervisor v2 orchestration.
- **`devdiff prompt export` & `devdiff import changelog`**: Exports tailored prompts for ChatGPT, Claude, Gemini, Copilot and imports clean AI responses into `CHANGELOG.md`.
- **`devdiff security` command group**: `profile`, `check`, `rules`, `feedback`, `feed` — manages 7-day dynamic security baselines, anomaly checks, and threat intel feeds.

## 1.6.0

### Major Changes

- **`devdiff study` command group**: `start`, `tour`, `learn <topic>`, `ask "<question>"`, `quiz <topic>`, `stop` — DevDiff Study Buddy Mode for interactive newcomer codebase tours, educational line-by-line breakdowns, learning paths, and self-quizzes.
- **`devdiff memory` command group**: `init`, `status`, `rescan`, `clear-conversation`, `clear-all` — manages persistent codebase memory index.
- **`devdiff ask "<question>"`**: Natural language Q&A against persistent codebase memory index with sub-50ms query speeds.
- **`devdiff skill generate|validate`**: Auto-generates and validates `.devdiff/SKILL.md` project knowledge base.
- **`devdiff release`**: One-command release flow — calculates SemVer bump, updates `CHANGELOG.md`, creates git tag, and pushes to remote.
- **`devdiff compliance list|apply|status|validate|report`**: Full 10-framework compliance command suite.
- **`devdiff schedule list`**: Lists 24/7 pre-configured background operational tasks.
- **`devdiff auth add`**: Explicit cloud AI provider opt-in command.
- **`devdiff plugin install <name>`**: Installs and runs static security scanning validation (`PluginSecurityScanner`) on DevDiff plugins.
- Added `publishConfig.access: "public"` for npm scoped package publishing.

### Patch Changes

- Fixed Commander argument parsing and option flag ordering.
- Fixed port collision in playground `listen` fallback.
- Added `--no-color` / `NO_COLOR=1` ANSI escape stripping.

### Updated Dependencies

- `@eldrex/core@1.6.0`
- `@eldrex/mcp@1.6.0`

---

## 1.0.4

### Patch Changes

- Release v1.0.4 - Unified Design System, dynamic Ollama model detection, security guards, and contact address updates.
