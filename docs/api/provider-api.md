# Provider API

Build custom AI provider classes.

```typescript
export interface AIProvider {
  generateExplanation(diffText: string, model: string): Promise<AIExplanationResult>
}
```
Refer to `@eldrex/core` source code for implementation details.
