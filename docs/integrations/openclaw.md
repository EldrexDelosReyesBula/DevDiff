# OpenClaw Supervisor Swarm & Automation

DevDiff integrates with **OpenClaw** environments for local-first, privacy-respecting LLM routing, task delegation, and multi-agent swarm orchestration.

Beginning in DevDiff **v1.0.5**, the **OpenClaw Supervisor** manages automated pipelines, error recovery, package verification, and interactive human reviews.

---

## 📋 Supervisor configuration (`supervisor-pipeline.yaml`)

Orchestrate your development agents by placing a `supervisor-pipeline.yaml` automation script inside your repository's `.devdiff/automations/` directory. This script configures roles, routing models, thresholds, and delegation rules:

```yaml
version: "1.0"
pipeline:
  name: "OpenClaw Swarm Supervisor"
  defaultModel: "ollama://qwen2.5-coder:7b"

  agents:
    - name: "writer"
      role: "Changelog synthesis and formatting"
      model: "ollama://qwen2.5-coder:7b"
      confidenceThreshold: 80

    - name: "security_reviewer"
      role: "Security scanner and dependency auditor"
      model: "ollama://llama3.2:3b"
      confidenceThreshold: 90

    - name: "compliance_officer"
      role: "License and framework compliance verification"
      model: "ollama://llama3.2:3b"
      confidenceThreshold: 90

  tasks:
    - id: "diff_analysis"
      description: "Analyze git diff for logic changes"
      assignedTo: "writer"

    - id: "security_scan"
      description: "Check diffs for security vulnerabilities"
      assignedTo: "security_reviewer"
      dependsOn: "diff_analysis"
```

Once defined, the DevDiff core orchestrator swarms the task analysis across your local agents and synthesizes the finalized changelog.

---

## 🛠️ Resilient Diagnostics & Error Recovery

The OpenClaw supervisor wraps all agent tasks in a **resilient error recovery handler** that intercepts failures and auto-retries tasks with fallbacks.

The handler diagnoses and recovers from:

- **Connection Refusal:** Auto-starts local Ollama endpoints or switches to backup cloud models.
- **Context Length Overflow:** Intelligently prunes unnecessary diff files, removes test code, and reduces the token payload.
- **Output Hallucinations:** Detects if an agent returns invalid JSON format or empty outputs, re-prompting with strict schema validations.
- **Model Timeouts:** Retries the request using faster, lightweight local models (e.g. `llama3.2:3b`) to ensure completion.

---

## 📦 Dependency Auto-Installation

To save developer setup time, the supervisor contains an automated **Dependency Manager** that checks for missing local packages and models on startup:

1. **Package Managers:** Auto-detects active package tools (`npm`, `pnpm`, `yarn`, `bun`).
2. **Missing Dependencies:** Identifies missing CLI binaries or configurations.
3. **Auto-Install:** Promptlessly runs `pnpm add` or system installations to configure the environment, ensuring all agent dependencies are linked.

---

## 👤 Human-in-the-Loop Interruption

If an agent finishes analysis with a low confidence score, or detects a critical concern (like a security flag), the supervisor halts the pipeline and starts the **Human Review System**:

```
┌─────────────────────────────────────────────┐
│  👤 HUMAN REVIEW REQUESTED                   │
├─────────────────────────────────────────────┤
│  Type: security_finding                     │
│  Confidence: 45                             │
│  Priority: CRITICAL                         │
├─────────────────────────────────────────────┤
│  AI Output:                                 │
│  Found critical CVE vulnerability in database│
├─────────────────────────────────────────────┤
│  Evidence:                                  │
│  • package.json                             │
└─────────────────────────────────────────────┘

  Options:
  [A] Approve — Accept AI output as-is
  [R] Reject  — Discard AI output, retry with different approach
  [M] Modify  — Edit the AI output
  [D] Delegate — Send to another AI agent
```

### Review Modes:

- **Interactive (TTY):** Prompts the developer in their terminal with options: `[A] Approve`, `[R] Reject`, `[M] Modify`, or `[D] Delegate` (routes to another model).
- **Non-Interactive (CI/CD):** When running in automated environments (like GitHub Actions), the system bypasses interactive prompts, logs warnings, and falls back to a safe confidence resolution.
