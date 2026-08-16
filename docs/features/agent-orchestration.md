# DevDiff Agent Orchestration & OpenClaw Integration Platform

The **DevDiff Agent Orchestration Platform** (introduced in DevDiff v1.7.0) establishes DevDiff as the shared memory, execution engine, and coordination layer for multi-agent swarms (OpenClaw, Copilot, Gemini, Claude, and custom agents).

---

## 🎯 Architecture Vision

```
┌─────────────────────────────────────────────────────────────┐
│              DEVDIFF — THE AGENTIC PLATFORM                   │
│                                                              │
│  "DevDiff isn't a tool agents can use.                       │
│   DevDiff is the platform agents LIVE on."                   │
│                                                              │
│  Every agent — OpenClaw, Copilot, Gemini, Claude, custom —   │
│  connects to DevDiff as their shared memory, execution        │
│  engine, and coordination layer.                              │
│                                                              │
│  Agents don't call DevDiff. Agents run THROUGH DevDiff.      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🦞 OpenClaw Supervisor v2 (`OpenClawSupervisorV2`)

The `OpenClawSupervisorV2` orchestrates specialized agent squads according to project configuration in `.devdiff/agents/openclaw/supervisor.yaml`:

### 1. Specialized Agent Roles

- 🏗️ **Architect**: `architecture_analysis`, `design_pattern_detection`, `refactoring_identification`, `dependency_mapping`.
- 🔒 **Security**: `vulnerability_scanning`, `secret_detection`, `cve_matching`, `compliance_verification`.
- ⚡ **Performance**: `complexity_analysis`, `memory_profiling`, `bundle_impact`, `query_optimization`.
- 📝 **Documentation**: `changelog_generation`, `api_documentation`, `migration_guide`, `release_notes`.
- 💬 **Q&A**: `code_explanation`, `architecture_questions`, `historical_context`.

### 2. Task Graph Decomposition

The supervisor automatically decomposes user objectives into parallel and sequential subtasks:

- **`changelog_generation`**: Parallel diff & context scanning ➔ Sequential architecture, security, and performance analysis ➔ Final documentation synthesis & quality review.
- **`security_audit`**: Parallel secret, dependency, and injection scans ➔ Sequential code pattern & compliance checks ➔ Final report generation.
- **`answer_question`**: Parallel memory & index lookups ➔ Sequential Q&A synthesis.

### 3. Automated Validation Gates

- **Auto-Approve Threshold**: $\ge 85\%$ confidence.
- **Human Review Threshold**: $70\% - 84\%$ confidence.
- **Auto-Retry Threshold**: $< 50\%$ confidence.

---

## 🤖 Universal Agent Registry (`AgentRegistry`)

The `AgentRegistry` allows connecting ANY AI agent via OpenClaw, MCP, REST, or WebSockets:

```typescript
import { AgentRegistry } from "@eldrex/core";

// Register custom agent
AgentRegistry.register({
  id: "custom-reviewer",
  name: "Custom Code Reviewer",
  type: "custom",
  protocol: "mcp",
  status: "active",
  capabilities: ["code_review"],
  currentLoad: 0.1,
  successRate: 95.0,
  execute: async (task) => ({ confidence: 95, findings: ["Approved"] }),
});

// Delegate task with fallback routing
const result = await AgentRegistry.delegate({
  id: "task-1",
  type: "security_audit",
  requiredCapabilities: ["secret_detection"],
  priority: "high",
  data: {},
});

// Run multi-agent swarm with pairwise consensus
const swarm = await AgentRegistry.swarm(
  {
    id: "task-2",
    type: "changelog_generation",
    requiredCapabilities: [],
    priority: "high",
    data: {},
  },
  3,
);
```

---

## 💻 CLI Commands

```bash
# Deploy full multi-agent swarm on an objective
devdiff agent swarm "Analyze security and performance impact of new auth endpoints"

# Deploy specific agent roles
devdiff agent deploy --agents architect,security "Review PR changes"

# Query a specific agent role directly
devdiff agent ask architect --prompt "Explain the rate limiter pattern"

# Run parallel subtasks
devdiff agent parallel --tasks "security scan, performance analysis"

# Trigger inter-agent conversation bus
devdiff agent converse --agents architect,security "Caching Strategy Trade-offs"

# Render ASCII Swarm Dashboard
devdiff agent dashboard
```

Learn more on the official website: [https://devdiff.vercel.app/](https://devdiff.vercel.app/)
