# Multi-Agent Orchestrator API Reference

The `MultiAgentOrchestrator` class coordinates multiple specialized local AI agents to build consensus and generate final changelog reports.

## Import
```typescript
import { MultiAgentOrchestrator } from "@eldrex/core";
```

## Constructor
```typescript
const orchestrator = new MultiAgentOrchestrator();
```

## Methods

### `initialize(): Promise<void>`
Initializes the agent swarm mapping with default agents (Architect, Security Auditor, Performance Engineer, Documentation Writer).

### `analyze(diff: ProcessedDiff): Promise<CollaborativeAnalysis>`
Runs the parallel multi-phase analysis:
1. **Independent analysis**: Agents generate initial findings.
2. **Inter-agent discussion**: Agents review each other's outputs.
3. **Consensus building**: Computes consensus scores and status.
4. **Final synthesis**: Compiles a final report.
