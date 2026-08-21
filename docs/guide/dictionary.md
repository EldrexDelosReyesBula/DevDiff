# DevDiff v1.7.0 Reference Dictionary

The complete, authoritative dictionary for DevDiff commands, settings, tools, environment variables, personas, and default ports.

---

## CLI Commands Dictionary

| Command Syntax                                             | Description                                                                                                                                 | Common Flags / Options                                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `devdiff init`                                             | Initializes DevDiff in the workspace root, generating `.devdiff.config.js` and `.devdiff/SKILL.md`.                                         | `--force`, `--provider <name>`                                                               |
| `devdiff generate`                                         | Generates a persona-driven changelog for staged or uncommitted git changes.                                                                 | `-p, --persona <name>`, `-f, --format <markdown\|json\|html>`, `--since <time>`, `--dry-run` |
| `devdiff watch`                                            | Runs a background watcher process that generates changelogs automatically whenever changes are staged in git.                               | `--persona <name>`, `--interval <ms>`                                                        |
| `devdiff vibe start\|status\|stop`                         | Manages Vibe-Coding Resilience mode — creates pre-AI checkpoints before processing changes.                                                 | `--checkpoint <id>`, `--auto-recover`                                                        |
| `devdiff recover --checkpoint <id>`                        | Manually rolls back repo files to a saved pre-AI checkpoint snapshot.                                                                       | `--checkpoint <id>`                                                                          |
| `devdiff memory init`                                      | Scans codebase AST once and builds persistent codebase index (`.devdiff/memory/codebase-index.json`).                                       | `--force`, `--verbose`                                                                       |
| `devdiff memory status`                                    | Reports memory index health, total indexed files, entity count, and snapshot timestamps.                                                    | `--json`                                                                                     |
| `devdiff memory rescan`                                    | Re-indexes modified files incrementally based on recent git commits.                                                                        | `--full`                                                                                     |
| `devdiff memory clear-conversation`                        | Clears multi-turn conversation context (`.devdiff/memory/conversation-history.json`).                                                       | —                                                                                            |
| `devdiff memory clear-all`                                 | Clears all persistent memory snapshots and indices.                                                                                         | `--force`                                                                                    |
| `devdiff ask "<question>"`                                 | Performs natural language Q&A against persistent codebase memory with sub-50ms query speeds.                                                | `--persona <name>`, `--json`                                                                 |
| `devdiff skill generate`                                   | Auto-generates `.devdiff/SKILL.md` knowledge base covering 10 domain knowledge sections.                                                    | `--overwrite`                                                                                |
| `devdiff skill validate`                                   | Validates current `.devdiff/SKILL.md` knowledge base file for completeness and schema correctness.                                          | —                                                                                            |
| `devdiff release`                                          | Single-command release flow — calculates SemVer bump, updates `CHANGELOG.md`, creates git tag, and pushes to remote.                        | `--dry-run`, `--type <auto\|major\|minor\|patch>`                                            |
| `devdiff version bump`                                     | Calculates and applies a version bump based on git diff analysis.                                                                           | `--type <auto\|major\|minor\|patch>`                                                         |
| `devdiff compliance list\|apply\|status\|validate\|report` | Runs 10-framework compliance rules engine (GDPR, SOC 2, HIPAA, FedRAMP, ISO 27001, CCPA, PIPEDA, LGPD, PDPA, Australia Privacy Act).        | `--framework <name>`, `--report <pdf\|markdown\|json>`                                       |
| `devdiff schedule list`                                    | Lists 24/7 background scheduled operational tasks (standup digests, security audits).                                                       | —                                                                                            |
| `devdiff auth add <provider>`                              | Explicitly configures a cloud AI provider API key in user configuration (`CloudGuard` opt-in).                                              | `<provider>` (openai, anthropic, gemini, groq, deepseek)                                     |
| `devdiff plugin install <name>`                            | Installs and runs static security scan validation (`PluginSecurityScanner`) on a DevDiff plugin.                                            | `--force`                                                                                    |
| `devdiff audit ai-calls\|network\|shell\|redaction`        | Displays audit trail logs for past AI calls, network requests, shell executions, and redactions.                                            | `--since <time>`, `--package <pkg>`                                                          |
| `devdiff study start\|tour\|learn\|ask\|quiz\|stop`        | DevDiff Study Buddy Mode — interactive newcomer codebase tours, educational line-by-line code breakdowns, learning paths, and self-quizzes. | `<topic>`, `<question>`                                                                      |

---

## VS Code Commands & Shortcuts Dictionary

| VS Code Command              | Title in Command Palette                  | Default Keybinding             | Description                                                         |
| ---------------------------- | ----------------------------------------- | ------------------------------ | ------------------------------------------------------------------- |
| `devdiff.generateChangelog`  | `DevDiff: Generate Changelog`             | `Ctrl+Shift+G` / `Cmd+Shift+G` | Generates a persona-driven markdown changelog for staged diffs      |
| `devdiff.explainChanges`     | `DevDiff: Explain Staged Changes`         | —                              | Analyzes staged diffs and displays explanations                     |
| `devdiff.generateDiagram`    | `DevDiff: Generate Diagram`               | `Ctrl+Shift+D` / `Cmd+Shift+D` | Generates inline Mermaid architecture diagrams                      |
| `devdiff.securityScan`       | `DevDiff: Security Scan`                  | `Ctrl+Shift+X` / `Cmd+Shift+X` | Runs vulnerability scan on staged changes                           |
| `devdiff.explainSelection`   | `DevDiff: Explain Selected Code`          | `Ctrl+Shift+E` / `Cmd+Shift+E` | Explains highlighted code in active text editor                     |
| `devdiff.askAI`              | `DevDiff: Ask DevDiff (natural language)` | `Ctrl+Shift+A` / `Cmd+Shift+A` | Asks natural language question against codebase memory              |
| `devdiff.showChangelog`      | `DevDiff: Show Changelog`                 | —                              | Opens the Changelog Explorer sidebar view                           |
| `devdiff.toggleWatch`        | `DevDiff: Toggle Auto-Watch`              | —                              | Toggles background Git staging watcher                              |
| `devdiff.showOutput`         | `DevDiff: Show Output Panel`              | —                              | Opens the DevDiff extension log channel                             |
| `devdiff.showGettingStarted` | `DevDiff: Show Getting Started Guide`     | —                              | Reopens the native Virtual Markdown Getting Started Guide           |
| `@devdiff`                   | Native VS Code Chat Participant           | In VS Code Chat                | Chat participant (`@devdiff`) for natural language codebase queries |

---

## MCP Server Tools Dictionary (`@eldrex/mcp`)

| Tool Identifier         | Input Parameters                         | Description                                                             |
| ----------------------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| `devdiff_ask`           | `{ question: string, persona?: string }` | Multi-turn conversational Q&A against persistent codebase memory        |
| `query_codebase`        | `{ query: string, filter?: string }`     | Queries the codebase AST index for entity definitions and relationships |
| `get_diff_summary`      | `{ since?: string }`                     | Retrieves a structured JSON summary of git diff changes                 |
| `get_compliance_status` | `{ framework?: string }`                 | Returns compliance audit status against regulatory frameworks           |
| `get_changelog`         | `{ format?: string, persona?: string }`  | Generates and returns a formatted changelog string                      |
| `devdiff_version`       | `{}`                                     | Returns current DevDiff version, build metadata, and active providers   |

---

## Configuration Settings Dictionary (`.vscode` & `.devdiff.config.js`)

| Setting Key                             | Data Type | Default Value    | Description                                                                                                                                                                  |
| --------------------------------------- | --------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `devdiff.persona`                       | `string`  | `"developer"`    | Active AI persona (`developer`, `ceo`, `educator`, `robot`, `data-analyst`, `journalist`, `pm`, `compliance`)                                                                |
| `devdiff.provider`                      | `string`  | `"ollama-local"` | Primary AI provider routing strategy (`ollama-local`, `openai-cloud`, `anthropic-cloud`, `gemini-cloud`, `groq-cloud`, `deepseek-cloud`, `transformers-local`, `webllm-gpu`) |
| `devdiff.model`                         | `string`  | `"llama3.2:3b"`  | Target model name identifier (e.g. `llama3.2:3b`, `qwen2.5-coder:7b`, `gpt-4o-mini`)                                                                                         |
| `devdiff.autoStart`                     | `boolean` | `true`           | Auto-starts DevDiff session monitoring when VS Code opens                                                                                                                    |
| `devdiff.autoGenerate`                  | `boolean` | `false`          | Automatically generates explanations when files are staged in Git                                                                                                            |
| `devdiff.showGutterAnnotations`         | `boolean` | `true`           | Displays inline gutter decorations next to modified code lines                                                                                                               |
| `devdiff.showCodeLens`                  | `boolean` | `true`           | Displays `⚡ DevDiff: Explain` CodeLens triggers above modified functions                                                                                                    |
| `devdiff.memoryCapMb`                   | `number`  | `256`            | Hard RAM ceiling in megabytes for `IDEGuardian` worker processes                                                                                                             |
| `devdiff.idleDetectionSeconds`          | `number`  | `5`              | Inactivity timer (seconds) to pause background analysis while typing                                                                                                         |
| `devdiff.security.restrictFileAccess`   | `boolean` | `true`           | Limits file reading exclusively to workspace directory boundaries                                                                                                            |
| `devdiff.security.maxFileSize`          | `number`  | `10485760`       | Maximum file size in bytes for processing (10MB default)                                                                                                                     |
| `devdiff.security.blockExternalScripts` | `boolean` | `true`           | Blocks dynamic execution of unverified external scripts                                                                                                                      |

---

## Environment Variables Dictionary

| Variable Name             | Description                                              | Default / Example        |
| ------------------------- | -------------------------------------------------------- | ------------------------ |
| `OPENAI_API_KEY`          | Secret key for OpenAI models (`gpt-4o`, `gpt-4o-mini`)   | `sk-proj-...`            |
| `ANTHROPIC_API_KEY`       | Secret key for Anthropic models (`claude-3-5-sonnet`)    | `sk-ant-...`             |
| `GEMINI_API_KEY`          | Secret key for Google Gemini models (`gemini-1.5-flash`) | `AIzaSy...`              |
| `GROQ_API_KEY`            | Secret key for Groq LPU engine (`llama-3.1-8b-instant`)  | `gsk_...`                |
| `DEEPSEEK_API_KEY`        | Secret key for DeepSeek Cloud API                        | `sk-...`                 |
| `OLLAMA_HOST`             | Host address for local Ollama daemon                     | `http://localhost:11434` |
| `NO_COLOR` / `NO_COLOR=1` | Strips all ANSI color escape sequences from CLI output   | `1`                      |

---

## Personas Dictionary

| Persona ID     | Output Focus & Tone                                                       | Target Audience                     |
| -------------- | ------------------------------------------------------------------------- | ----------------------------------- |
| `developer`    | Technical diffs, function signatures, AST changes, refactoring rationale  | Software Engineers, Code Reviewers  |
| `ceo`          | High-level business impact, strategic feature releases, customer value    | Executives, Product Leaders         |
| `educator`     | Conceptual explanations, code patterns, learning takeaways, beginner tips | Junior Developers, Students         |
| `pm`           | Product features, user-facing improvements, release milestone status      | Product Managers, Scrum Masters     |
| `compliance`   | Regulatory impact, data privacy, security controls, audit log references  | Security Officers, Legal Compliance |
| `robot`        | Raw structured JSON output, zero prose, machine-readable metrics          | Automation Scripts, CI/CD Pipelines |
| `data-analyst` | Quantitative diff stats, line counts, cyclomatic complexity deltas        | Engineering Analytics, Team Ops     |
| `journalist`   | Engaging narrative prose suitable for release blog posts and product news | Developer Relations, Marketing      |

---

## Default Network Ports Reference

| Port Number | Protocol / Service              | Description                                            |
| ----------- | ------------------------------- | ------------------------------------------------------ |
| `11434`     | HTTP (`http://localhost:11434`) | Local Ollama REST API daemon endpoint                  |
| `3000`      | HTTP / WebSocket                | DevDiff Gateway automation hub and live streaming port |
