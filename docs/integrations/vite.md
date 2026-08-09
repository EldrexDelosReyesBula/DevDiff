# Vite Application Integration

Integrate DevDiff change tracking into your Vite web applications using `@eldrex/vite-plugin`. See [Vite Plugin Guide](./vite-plugin) for full configuration details.

---

## Quick Setup

```typescript
import { defineConfig } from "vite";
import devdiff from "@eldrex/vite-plugin";

export default defineConfig({
  plugins: [devdiff()],
});
```
