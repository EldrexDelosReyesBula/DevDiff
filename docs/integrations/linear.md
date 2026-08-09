# Linear Issue Integration

Automatically match Linear issue keys (e.g. `ENG-402`) in git commits and link them to DevDiff changelog summaries using `@eldrex/plugin-sdk`.

---

## 🚀 Setup via Plugin SDK

```typescript
import { DevDiffPlugin, ParsedDiff } from "@eldrex/plugin-sdk";

export const LinearLinkerPlugin: DevDiffPlugin = {
  id: "linear-linker",
  name: "Linear Issue Linker",
  version: "1.0.0",
  description: "Extracts Linear issue keys from diffs.",
  author: { name: "DevDiff Team" },
  devdiffVersion: ">=1.5.0",

  hooks: {
    async beforeAnalysis(diff: ParsedDiff) {
      const linearRegex = /[A-Z]{2,6}-\d+/g;
      // Scans diff content for Linear issue keys
      return diff;
    },
  },
};
```
