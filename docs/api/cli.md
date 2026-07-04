# CLI Command Dictionary

## Global Flags

| Flag              | Short | Description                 |
| ----------------- | ----- | --------------------------- |
| `--help`          | `-h`  | Show help for any command   |
| `--version`       | `-v`  | Show DevDiff version        |
| `--verbose`       |       | Show detailed output        |
| `--quiet`         | `-q`  | Suppress non-error output   |
| `--no-color`      |       | Disable colored output      |
| `--config <path>` |       | Use custom config file path |

---

## Core Commands

### `devdiff init`

Initialize DevDiff in a git repository.

```bash
devdiff init                # Interactive setup
devdiff init --yes          # Skip prompts, use defaults
devdiff init --force        # Overwrite existing config
```

**Creates:**

- `.devdiff.config.js` — Configuration file
- `.devdiffignore` — File exclusion patterns
- `.devdiff/` — Cache, checkpoints, audit logs
- `.git/hooks/post-commit` — Auto-generate on commit (optional)

**Options:**

| Option            | Description              |
| ----------------- | ------------------------ |
| `--yes`, `-y`     | Accept all defaults      |
| `--force`         | Overwrite existing files |
| `--no-hooks`      | Don't install git hooks  |
| `--ai <provider>` | Set default AI provider  |

---

### `devdiff generate`

Generate changelog from staged changes.

```bash
devdiff generate                          # Basic generation
devdiff generate --persona ceo            # Executive summary
devdiff generate --format mermaid         # Diagram output
devdiff generate --dry-run                # Preview without AI
devdiff generate --since "HEAD~5..HEAD"   # Specific range
devdiff generate --since "24h"            # Time-based range
devdiff generate --since "1 week"         # Week of changes
devdiff generate --depth deep             # Detailed analysis
```

**Options:**

| Option       | Short | Default        | Description                 |
| ------------ | ----- | -------------- | --------------------------- |
| `--persona`  | `-p`  | `developer`    | AI persona for output style |
| `--format`   | `-f`  | `markdown`     | Output format               |
| `--dry-run`  | `-d`  | `false`        | Template without AI         |
| `--since`    |       | staged changes | Git revision range          |
| `--output`   | `-o`  | stdout         | Output file path            |
| `--depth`    |       | `standard`     | Analysis depth              |
| `--no-cache` |       | `false`        | Skip explanation cache      |
| `--include`  |       | all files      | File pattern to include     |
| `--exclude`  |       | from config    | File pattern to exclude     |

**Personas:**

| Value          | Description                        |
| -------------- | ---------------------------------- |
| `developer`    | Technical, precise, code-focused   |
| `ceo`          | Executive summary, business impact |
| `educator`     | Explanatory, verbose, teaching     |
| `robot`        | Ultra-concise, machine-parseable   |
| `data-analyst` | Metrics-focused, statistical       |
| `journalist`   | Narrative, engaging, story-driven  |
| `pm`           | Product-focused, user impact       |
| `compliance`   | Security, regulatory, audit        |

**Formats:**

| Value      | Description                                 |
| ---------- | ------------------------------------------- |
| `markdown` | Human-readable changelog                    |
| `json`     | Structured machine-parseable                |
| `mermaid`  | Diagram (flowchart, architecture, timeline) |

**Depths:**

| Value        | Description                |
| ------------ | -------------------------- |
| `minimal`    | File list and basic stats  |
| `standard`   | Summary with key changes   |
| `deep`       | Detailed per-file analysis |
| `exhaustive` | Full multi-agent review    |

---

### `devdiff watch`

Watch for changes continuously.

```bash
devdiff watch                    # Watch staged changes
devdiff watch --auto-generate    # Auto-generate on detection
devdiff watch --persona pm       # With specific persona
devdiff watch --debounce 5000    # 5 second debounce
```

**Options:**

| Option            | Default     | Description                 |
| ----------------- | ----------- | --------------------------- |
| `--auto-generate` | `false`     | Generate on every change    |
| `--persona`       | `developer` | Persona for auto-generation |
| `--format`        | `markdown`  | Format for auto-generation  |
| `--debounce`      | `2000`      | Debounce in milliseconds    |
| `--once`          | `false`     | Run once and exit           |

---

### `devdiff context`

Manage project context for accurate explanations.

```bash
devdiff context generate     # Auto-generate from project
devdiff context show         # Display current context
devdiff context edit         # Open in $EDITOR
devdiff context validate     # Check for secrets/issues
devdiff context update       # Regenerate and merge
```

---

### `devdiff auth`

Manage cloud AI provider API keys.

```bash
devdiff auth add <provider>     # Add API key interactively
devdiff auth list               # Show configured providers
devdiff auth remove <provider>  # Remove a provider
devdiff auth test <provider>    # Test key validity
devdiff auth rotate <provider>  # Replace existing key
```

**Supported providers:**
`openai`, `anthropic`, `groq`, `gemini`, `deepseek`, `together`

---

### `devdiff vibe`

Vibe coding session management.

```bash
devdiff vibe start         # Start protected session
devdiff vibe stop          # End session, save summary
devdiff vibe status        # View session statistics
devdiff vibe history       # View past sessions
```

**Session guarantees:**

- Auto-checkpoint before every AI call
- Zero data loss on failure
- Session report with statistics

---

### `devdiff compliance`

Compliance framework management.

```bash
devdiff compliance list                    # List all frameworks
devdiff compliance apply --framework gdpr  # Apply framework
devdiff compliance status                  # Current compliance status
devdiff compliance report                  # Generate audit report
devdiff compliance validate --framework all # Check all frameworks
```

**Frameworks:**
`gdpr`, `ccpa`, `hipaa`, `soc2`, `fedramp`, `iso27001`, `pipeda`, `lgpd`, `pdpa`, `australia_privacy`

---

### `devdiff audit`

View security and privacy audit logs.

```bash
devdiff audit ai-calls      # AI call history
devdiff audit network       # Network access log
devdiff audit shell         # Shell command log
devdiff audit all           # Complete audit trail
devdiff audit export        # Export audit to JSON
```

---

### `devdiff doctor`

System health check.

```bash
devdiff doctor              # Full diagnostic
devdiff doctor --fix        # Auto-fix common issues
devdiff doctor --json       # Machine-parseable output
```

**Checks:**

- Node.js version
- Git installation and config
- Ollama installation and status
- Model availability
- Network connectivity
- Disk space
- Configuration validity

---

### `devdiff disclose`

Full transparency report.

```bash
devdiff disclose            # Complete disclosure
devdiff disclose --network  # Network activity only
devdiff disclose --files    # File access only
devdiff disclose --ai       # AI processing only
```

**Shows:**

- Every network call made
- Every file accessed
- Every shell command run
- AI tokens used
- Data sent externally (always 0 by default)

---

### `devdiff monitor`

Real-time network activity monitor.

```bash
devdiff monitor             # Watch all network calls
devdiff monitor --alerts    # Alert on unauthorized access
```

---

### `devdiff mvp`

Manage MVP storage queue.

```bash
devdiff mvp status          # View queued changes
devdiff mvp process         # Process one queued item
devdiff mvp process-all     # Process entire queue
devdiff mvp clear           # Remove processed items
```

---

### `devdiff playground`

Start local web UI.

```bash
devdiff playground              # Start at localhost:3737
devdiff playground --port 8080  # Custom port
devdiff playground --open       # Auto-open browser
```

---

### `devdiff recover`

Recover from checkpoints.

```bash
devdiff recover                    # List available checkpoints
devdiff recover --checkpoint <id>  # Restore specific checkpoint
devdiff recover --last             # Restore most recent
devdiff recover --list             # List all checkpoints
```

---

### `devdiff version`

Version information.

```bash
devdiff version            # Current version
devdiff version --check    # Check for updates
devdiff version --info     # Detailed version info
devdiff version --changelog # Version changelog
```

---

### `devdiff config`

Configuration management.

```bash
devdiff config              # Show current config
devdiff config --path       # Show config file path
devdiff config --validate   # Validate config
devdiff config --reset      # Reset to defaults
```

---

## Exit Codes

| Code | Meaning                      |
| ---- | ---------------------------- |
| `0`  | Success                      |
| `1`  | General error                |
| `2`  | Configuration error          |
| `3`  | Git repository error         |
| `4`  | AI provider error            |
| `5`  | Network error                |
| `6`  | Permission error             |
| `7`  | Resource limit (memory/disk) |

---

## Environment Variables

| Variable                | Purpose                     |
| ----------------------- | --------------------------- |
| `DEVVIFF_HOME`          | Override .devdiff directory |
| `DEVVIFF_CONFIG`        | Override config file path   |
| `DEVVIFF_DISABLE_COLOR` | Disable color output        |
| `DEVVIFF_LOG_LEVEL`     | debug, info, warn, error    |
| `OPENAI_API_KEY`        | OpenAI API key              |
| `ANTHROPIC_API_KEY`     | Anthropic API key           |
| `GROQ_API_KEY`          | Groq API key                |
| `GEMINI_API_KEY`        | Google Gemini API key       |
| `DEEPSEEK_API_KEY`      | DeepSeek API key            |
| `TOGETHER_API_KEY`      | Together AI API key         |
| `OLLAMA_HOST`           | Custom Ollama URL           |
| `SLACK_WEBHOOK_URL`     | Slack webhook               |
| `DISCORD_WEBHOOK_URL`   | Discord webhook             |
| `TEAMS_WEBHOOK_URL`     | Teams webhook               |
| `TELEGRAM_BOT_TOKEN`    | Telegram bot token          |
