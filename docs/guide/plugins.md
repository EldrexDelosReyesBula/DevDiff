# Plugin System

Extend DevDiff by writing custom plugins for processors or outputters.

## Custom Output Plugin

You can build custom output plugins by implementing the `CustomOutputPlugin` interface:

```typescript
import { CustomOutputPlugin } from '@eldrex/gateway'

export const mySlackPlugin: CustomOutputPlugin = {
  name: 'my-slack-plugin',
  async deliver(result) {
    // Send result.formattedOutput somewhere
  }
}
```
