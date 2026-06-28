# Temporal Integration

For enterprise workflows, DevDiff can run as part of a **Temporal** orchestrator pipeline to automatically audit and sanitize commits before they are published to production branches.

## Workflow Integration

You can define a Temporal Activity that runs `generateChangelog` or validates compliance rules before approving releases:

```typescript
import { generateChangelog, applyCompliance } from "@eldrex/core";

export async function devDiffAuditActivity(diff: string): Promise<string> {
  const result = await generateChangelog({ diffText: diff });
  return result.formattedOutput;
}
```
