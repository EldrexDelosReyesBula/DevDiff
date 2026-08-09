# OpenClaw Connector Integration (`@eldrex/integrations`)

DevDiff includes native integration support for **OpenClaw** ([`@eldrex/integrations/openclaw`](https://github.com/EldrexDelosReyesBula/DevDiff/tree/main/packages/integrations/openclaw)), an open-source autonomous agent framework. This integration enables OpenClaw autonomous agents to query DevDiff codebase memory and AST indexes during automated tasks.

---

## 🎯 Architecture & Data Flow

```mermaid
flowchart LR
    OpenClaw[OpenClaw Agent Runtime] -->|Connector API| Connector[@eldrex/integrations/openclaw]
    Connector -->|Sub-50ms Read-Only Queries| DevDiffEngine[DevDiff Core Memory Engine]
    DevDiffEngine -->|Redacted AST & Change Summaries| OpenClaw
    
    style Connector fill:#bbf,stroke:#333,stroke-width:2px
    style DevDiffEngine fill:#9f9,stroke:#333,stroke-width:2px
```

---

## 💻 Usage Example

```typescript
import { OpenClawDevDiffConnector } from "@eldrex/integrations/openclaw";

const connector = new OpenClawDevDiffConnector({
  workspacePath: process.cwd(),
});

// Query codebase entity memory from OpenClaw agent tool handler
const entityInfo = await connector.queryEntity("AuthService");
console.log("Entity memory context:", entityInfo);
```
