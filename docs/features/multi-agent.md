# Multi-Agent Swarms

DevDiff's multi-agent mode runs multiple AI personas simultaneously and combines their perspectives into a unified, multi-dimensional changelog.

---

## What is Multi-Agent Mode?

Instead of analyzing your diff once, DevDiff spawns multiple AI agents in parallel — each with a different perspective — then synthesizes their outputs.

```
Your diff
   │
   ├── Agent 1: developer  ──┐
   ├── Agent 2: ceo         ─┤
   ├── Agent 3: compliance  ─┼──► Orchestrator ──► Final Report
   └── Agent 4: data-analyst ┘
```

---

## Quick Start

```bash
# Analyze with all default personas in parallel
devdiff generate --multi-agent

# Specify which personas to include
devdiff generate --multi-agent --personas developer,ceo,compliance

# Save multi-agent report to file
devdiff generate --multi-agent > multi-report.md
```

---

## Configuration

```javascript
// .devdiff.config.js
export default {
  multiAgent: {
    enabled: true,
    personas: ["developer", "ceo", "compliance"], // Agents to run
    parallel: true, // Run simultaneously
    synthesize: true, // Combine into one report
    model: {
      orchestrator: "ollama://llama3.1:8b", // Orchestrator model
      agents: "ollama://llama3.2:3b", // Per-agent model
    },
  },
};
```

---

## Example Output

```markdown
# Multi-Agent Changelog — July 1, 2026

## 🧑‍💻 Developer Perspective

Added refresh token mechanism (`src/auth/jwt.ts:47`) using jsonwebtoken v9.
Rate limiter added in middleware layer — 100 req/min per IP using sliding window.
Dependency: `jsonwebtoken` 8.5.1 → 9.0.2 (closes CVE-2022-23540 mitigation).

---

## 💼 CEO Perspective

Session duration extended from 24 hours to 7 days, reducing user re-login
friction. Expected to improve DAU retention by reducing logout-related churn.
Security update applied proactively — no user impact.

---

## ⚖️ Compliance Perspective

Session extension (7 days) requires review under GDPR Article 5 data
minimization principle. Authentication library updated — SBOM should reflect
new version. Rate limiting added — document in security controls inventory.

---

## 🎯 Synthesis

**High agreement:** This is a low-risk, user-experience improvement with
a proactive security posture.

**Action required:** Legal team to review session extension under GDPR.
**Recommended:** Update data retention policy documentation.
```

---

## When to Use Multi-Agent

| Scenario                     | Use Multi-Agent?               |
| ---------------------------- | ------------------------------ |
| Daily commits, small changes | ❌ Use single persona          |
| Weekly release preparation   | ✅ Great for release notes     |
| Security-sensitive PRs       | ✅ Always run compliance agent |
| Major version releases       | ✅ Run all personas            |
| Pre-audit snapshots          | ✅ Run compliance + developer  |

---

## Agent Communication

Agents can be configured to share context — one agent's findings feed into the next:

```javascript
export default {
  multiAgent: {
    mode: "sequential", // 'parallel' | 'sequential' | 'debate'
    // debate: agents critique each other's outputs before synthesis
  },
};
```

**Modes:**

- `parallel` — All agents run simultaneously (fastest)
- `sequential` — Agents run one by one, each seeing previous output (more coherent)
- `debate` — Agents argue, then synthesize (most thorough, slowest)

---

## Resource Requirements

Multi-agent mode is more resource-intensive:

| Agents       | RAM Needed | Time (llama3.2:3b) |
| ------------ | ---------- | ------------------ |
| 2 agents     | 8GB        | ~30 seconds        |
| 4 agents     | 16GB       | ~60 seconds        |
| All 8 agents | 32GB       | ~2 minutes         |

> **Tip:** Use `gpt-4o-mini` or `claude-3-5-haiku` as the agent model for multi-agent runs — cloud APIs are faster and cheaper for parallel workloads.
