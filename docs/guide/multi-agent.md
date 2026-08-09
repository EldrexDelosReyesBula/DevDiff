# Multi-Agent Swarm Workflows & OpenClaw Integration

DevDiff supports multi-agent swarm workflows using the OpenClaw supervisor framework ([`@eldrex/integrations/openclaw`](https://github.com/EldrexDelosReyesBula/DevDiff/tree/main/packages/integrations/openclaw)). Multi-agent mode allows specialized AI agents (Developer Agent, Security Auditor, Compliance Checker, PM) to evaluate codebase diffs concurrently and reach consensus before changelog output is finalized.

---

## 🎯 Swarm Consensus Flow

```mermaid
flowchart TD
    Diff[Staged Codebase Diff] --> Supervisor[OpenClaw Supervisor Agent]
    
    subgraph Swarm [Multi-Agent Analyst Swarm]
      Agent1[Developer Agent]
      Agent2[Security Auditor Agent]
      Agent3[Compliance Agent]
      Agent4[Product Manager Agent]
    end
    
    Supervisor --> Agent1
    Supervisor --> Agent2
    Supervisor --> Agent3
    Supervisor --> Agent4
    
    Agent1 --> Consensus{Consensus Reached?}
    Agent2 --> Consensus
    Agent3 --> Consensus
    Agent4 --> Consensus
    
    Consensus -->|Yes| FinalChangelog[Final Consensus Changelog]
    Consensus -->|Conflict| HumanReview[Human-in-the-Loop Review Trigger]
    
    style Supervisor fill:#bbf,stroke:#333,stroke-width:2px
    style FinalChangelog fill:#9f9,stroke:#333,stroke-width:2px
```

---

## 💻 CLI Multi-Agent Execution

```bash
# Run multi-agent swarm analysis
devdiff generate --swarm --agents developer,compliance,security
```
