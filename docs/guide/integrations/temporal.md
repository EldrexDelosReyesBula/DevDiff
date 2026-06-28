# Temporal Workflows Integration Guide

Run reliable, distributed, and stateful code review pipelines using **Temporal** and DevDiff.

## Activity Definition Example

In your Temporal workflow project, register the DevDiff analysis run as a Temporal Activity:

```typescript
import { OpenClawAdapter } from '@eldrex/openclaw'

export async function runDevDiffActivity(repoPath: string, range: string): Promise<string> {
  const adapter = new OpenClawAdapter('http://localhost:3737')
  const result = await adapter.runSkill({
    inputs: {
      repository: repoPath,
      since: range,
      persona: 'developer'
    }
  })
  return result.results?.changelog || ''
}
```
Register this activity with your Temporal worker to run it as part of any continuous delivery workflow.
