# Core Library API

The `@eldrex/core` library can be imported programmatically inside Node.js applications.

## API Reference

### `generateChangelog(options)`

Generates a formatted explanation based on staged changes or git diff.

```typescript
import { generateChangelog } from "@eldrex/core";

const result = await generateChangelog({
  diffText: "...",
  depth: "standard",
});
console.log(result.formattedOutput);
```

### `loadConfig(path)`

Loads and validates the project configuration.
