# DevDiff SDK Examples

Complete reference code snippets demonstrating `@eldrex/core` API usage in NodeJS and TypeScript applications.

---

## 1. Local Codebase Q&A

```typescript
import { ConversationalQA } from '@eldrex/core';

const qa = new ConversationalQA(process.cwd());

// Sub-50ms indexed question
const response = await qa.ask("What changed recently in the auth module?");
console.log(response.answer);
console.log("Sources:", response.sources);
```

---

## 2. Programmatic Security Scan

```typescript
import { DevDiffEngine } from '@eldrex/core';

const engine = new DevDiffEngine({ workspacePath: process.cwd() });
const report = await engine.securityScan({ since: '7d', threshold: 'high' });

console.log(report);
```
