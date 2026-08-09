# Swarm Orchestrator & OpenClaw API Reference

The `SwarmOrchestrator` and OpenClaw Connector (`@eldrex/integrations/openclaw`) handle multi-agent swarm analysis, parallel AI evaluations, and consensus resolution.

---

## 📦 Import Syntax

```typescript
import { SwarmOrchestrator, AgentConsensusEngine } from "@eldrex/core";
import { OpenClawDevDiffConnector } from "@eldrex/integrations/openclaw";
```

---

## 🛠️ Class Specifications

### `SwarmOrchestrator`

```typescript
const orchestrator = new SwarmOrchestrator({
  agents: ["developer", "compliance", "security"],
  consensusThreshold: 0.8,
});

const consensusResult = await orchestrator.executeSwarmAnalysis(diffPayload);
```

### `OpenClawDevDiffConnector`

```typescript
const connector = new OpenClawDevDiffConnector({
  workspacePath: process.cwd(),
});

const entityMemory = await connector.queryEntity("AuthService");
```
