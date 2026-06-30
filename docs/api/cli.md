# CLI Reference

Detailed guide for `@eldrex/cli` commands, options, and behaviors.

---

## 🚀 `devdiff init`

Initializes the DevDiff configuration and registers Git hooks in your repository.

```bash
devdiff init [options]
```

### Options

- `-f, --force`: Forces overwriting of any existing config file (`.devdiff.config.js`).
- `-y, --yes`: Skips configuration prompts and uses the default local-first settings immediately.

---

## 📝 `devdiff generate`

Extracts Git diffs (staged by default) and triggers the AI generator to output explanations.

```bash
devdiff generate [options]
```

### Options

- `-p, --persona <persona>`: AI persona to customize output style (defaults to `developer`). Valid choices:
  - `developer`: Deep technical descriptions of refactors, APIs, and impact.
  - `ceo`: Executive value-focused summaries for product release updates.
  - `educator`: Explanations optimized for training and junior engineers.
  - `robot`: High-precision technical bullet points.
  - `data-analyst`: Insights on database changes, indices, and schema modifications.
  - `journalist`: Narrative release summaries.
  - `pm`: Feature changes and user-facing benefits.
  - `compliance`: Structured risk checks, security controls, and permission audit logs.
- `-f, --format <format>`: Output format. Options: `markdown`, `json`, `html` (defaults to `markdown`).
- `-o, --output <file>`: Writes the generated changelog to a file instead of stdout.
- `-r, --range <range>`: revision range to diff (e.g. `HEAD~5..HEAD` or `main..feature-branch`).
- `--since <range>`: Alias for `--range`.
- `-m, --commit-msg-file <file>`: Hooks mode; appends generated explanations under a comment header inside a commit message temp file.
- `-d, --dry-run`: Previews the parsed and secret-redacted diff without triggering AI API calls.
- `--depth <depth>`: Analysis detail depth: `minimal`, `standard`, `deep` (defaults to `standard`).

---

## 👀 `devdiff watch`

Launches a local daemon watcher that monitors your repository index.

```bash
devdiff watch [options]
```

### Options

- `-p, --persona <persona>`: AI persona for active watch summaries (defaults to `developer`).

---

## 🌐 `devdiff report`

Starts a local dashboard server to view changelogs visually.

```bash
devdiff report [options]
```

### Options

- `-p, --port <port>`: Binds the local web dashboard to a specific port (defaults to `4200`).

---

## 🔒 `devdiff compliance`

Checks and enforces compliance settings based on selected framework regulations.

```bash
devdiff compliance <action> [options]
```

### Arguments

- `<action>`: The compliance task to execute:
  - `apply`: Merges compliance framework rules directly into your config.
  - `status`: Displays compliance readiness report comparing your config to active frameworks.
  - `list`: Lists all supported compliance guidelines (GDPR, HIPAA, SOC 2, ISO 27001, PIPEDA, etc.).
  - `report`: Exports a full compliance validation report.

### Options

- `-f, --framework <id>`: Specifies the framework ID (e.g., `gdpr`, `hipaa`, `soc2`).

---

## 💾 `devdiff vibe`

Manages resilient vibe-coding checkpoints.

```bash
devdiff vibe <action>
```

### Arguments

- `<action>`: Vibe checkpoint action:
  - `start`: Restarts/initializes a clean vibe session.
  - `stop`: Stops the active session.
  - `status`: Shows session duration, success rates, and recovery recommendations.

---

## 🔄 `devdiff recover`

Restores code files to a pre-AI backup checkpoint.

```bash
devdiff recover [options]
```

### Options

- `-c, --checkpoint <id>`: The specific checkpoint ID (e.g., `ckpt-XXXXXXXXXXXXX`) to restore.

---

## 📊 `devdiff audit`

Displays log trail audits for local security compliance.

```bash
devdiff audit [type] [options]
```

### Arguments

- `[type]`: The type of audit log to inspect:
  - `ai-calls`: Displays historical logs of AI model calls (tokens, latencies, success statuses).
  - `network`: Lists network access points, ports, and configuration controls.
  - `shell`: Lists historical logs of sandboxed shell operations.

### Options

- `-p, --package <package>`: Displays detailed security/privacy disclosures and recent shell logs for a specific package (e.g., `@eldrex/core`, `@eldrex/cli`).
