# Building Custom Integrations with DevDiff

DevDiff v1.6.0 provides first-class extension hooks via `@eldrex/core`, `@eldrex/mcp`, and `@eldrex/plugin-sdk`. You can easily integrate DevDiff changelog and codebase Q&A capabilities into custom CI/CD pipelines, Discord bots, GitHub webhooks, or internal dev tools.

---

## 🔧 Building a Custom MCP Agent Integration

DevDiff exposes 8 sub-50ms query tools via its Model Context Protocol (MCP) server. Any agent compatible with standard MCP can query codebase changes, security scans, or architecture graphs.

```typescript
import { PersistentMemory } from "@eldrex/core";

// Instantiate persistent codebase memory
const memory = new PersistentMemory(process.cwd());
await memory.initialize();

// Query entity dependencies
const deps = memory.queryDependencies("UserService", "downstream");
console.log("Entities depending on UserService:", deps);

// Query compliance scan
const compliance = memory.queryCompliance("gdpr", "high");
console.log("GDPR Findings:", compliance.findings);
```
