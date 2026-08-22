# @eldrex/cli

## 1.9.0

### Major Changes

- **`devdiff mcp` Command Suite**: Added dedicated subcommands for universal MCP server management:
  - `devdiff mcp install`: Interactive and automated 1-click installer configuring VS Code, Cursor, Windsurf, Antigravity, Claude Desktop, and JetBrains.
  - `devdiff mcp status`: Live health and configuration inspection of all detected IDE MCP configurations.
  - `devdiff mcp test`: Runs self-diagnostic tests against the local MCP server with tool registry validation.
  - `devdiff mcp serve`: Starts the DevDiff MCP server on stdio.

---

## 1.8.0

### Minor Changes

- **Release Gate Architecture**: Added `pnpm gate` and `pnpm gate:ps` verification scripts for cross-platform pre-flight release gates.
- **Minified Build Output**: Optimized CLI package artifacts for sub-50ms cold startup execution.

---

## 1.7.0

### Major Changes

- **`devdiff agent` Command Group**: `swarm`, `deploy`, `ask`, `parallel`, `converse`, `status`, `dashboard` — deploys multi-agent swarms and OpenClaw Supervisor v2 orchestration.
- **`devdiff prompt export` & `devdiff import changelog`**: Exports tailored prompts for ChatGPT, Claude, Gemini, Copilot and imports clean AI responses into `CHANGELOG.md`.
- **`devdiff security` Command Group**: `profile`, `check`, `rules`, `feedback`, `feed` — manages 7-day dynamic security baselines, anomaly checks, and threat intel feeds.
- **`devdiff network` Command Group**: `watch`, `history`, `block`, `unblock`, `blocked`, `allowed`, `allow`, `disallow`, `export`, `audit` — audits and manages outbound network traffic.
- **`devdiff memory` Timeline Suite**: `delete --from --to --dry-run`, `use`, `categorize`, `categories`, `optimize`, `status` — granular snapshot lifecycle and time-aware range filtering.
- **`devdiff disclose`**: Generates full system transparency disclosure reports detailing 30-day network activity, plugin behavior, filesystem access, shell execution history, and AI processing.

---

## 1.6.0

### Major Changes

- **`devdiff study` Command Group**: `start`, `tour`, `learn <topic>`, `ask "<question>"`, `quiz <topic>`, `stop` — DevDiff Study Buddy Mode for interactive newcomer codebase tours, educational line-by-line breakdowns, learning paths, and self-quizzes.
- **`devdiff memory` Command Group**: `init`, `status`, `rescan`, `clear-conversation`, `clear-all` — manages persistent codebase memory index.
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
