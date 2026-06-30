# How It Works

DevDiff sits between your Git history and your collaboration tools, serving as an intelligent processing and sanitization layer.

```
+--------------------+
| Git Commit / Hook  |
+---------+----------+
          |
          v
+---------+----------+
|  AST Parser/Trimmer|  <-- Prunes unmodified code
+---------+----------+
          |
          v
+---------+----------+
|   Secret Redactor  |  <-- Redacts API keys & tokens
+---------+----------+
          |
          v
+---------+----------+
| Intelligent Router |  <-- Chooses optimal model (Local/Cloud)
+---------+----------+
          |
          v
+---------+----------+
|   Persona Engine   |  <-- Formats tone & structure
+---------+----------+
          |
          v
+---------+----------+
|  Output Deliverer  |  <-- Sends Markdown, Mermaid, Slack, etc.
+--------------------+
```

---

## Detailed Pipeline Breakdown

### Step 1: Git Watcher & Event Ingestion

The process begins when code changes are made. Ingestion happens in one of three ways:

1.  **Local Execution:** Triggered directly via `devdiff generate` in the CLI.
2.  **Commit Watcher Daemon:** The `GitWatcher` listens to local git events or filesystem modifications using chokidar.
3.  **Webhook Receivers:** The DevDiff Gateway exposes endpoints to listen to incoming webhooks from GitHub Actions, GitLab CI, or Linear.

---

### Step 2: AST Trimming & Secrets Redaction

Before code changes are sent to any AI model, DevDiff processes the diff to optimize tokens and ensure strict privacy:

- **AST Trimming:** Instead of uploading entire source code files, DevDiff parses the code into an Abstract Syntax Tree (AST), identifies the precise functions or blocks that were modified, and discards the rest of the unmodified syntax.
- **Secrets Redaction:** An automated scanner matches standard API keys, passwords, and security token signatures (e.g. AWS keys, Slack webhooks). Discovered keys are immediately replaced with `[REDACTED]` to prevent leakages to cloud endpoints.

---

### Step 3: Token-Aware Intelligent Routing

The processed diff is analyzed to compute its size (token estimate) and complexity (e.g., number of files, breaking changes). The **Intelligent Router** then:

- Evaluates the capabilities of configured models (e.g., local Ollama vs cloud GPT-4o).
- Selects the most cost-effective and capable model that fits within context window limits.
- Organizes fallback chains to gracefully switch models if the primary provider fails.

---

### Step 4: Persona Engine Formatter

Once the model produces the raw analytical summary, the **Persona Engine** intercepts the output. It maps tone, formatting, emoji rules, and verbosity constraints defined in the chosen persona profile:

- _Developer Persona:_ Highly technical, showing affected files and AST function signatures.
- _Executive/CEO Persona:_ Brief, high-level business impact focus, avoiding technical jargon.
- _Compliance Persona:_ Risk-focused, security-audit styled reports.

---

### Step 5: Multi-Format Delivery

The formatted response is delivered to configured outputs, supporting Markdown logs, interactive Mermaid diagrams, JSON outputs, or Slack thread messages.
