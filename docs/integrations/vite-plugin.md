# DevDiff Vite Plugin (`@eldrex/vite-plugin`)

The DevDiff Vite Plugin ([`@eldrex/vite-plugin`](https://github.com/EldrexDelosReyesBula/DevDiff/tree/main/packages/vite-plugin)) integrates DevDiff codebase change tracking directly into Vite development servers (Vite, Vue, React, Svelte, Next/Vite).

---

## 🚀 Quick Start

### 1. Install `@eldrex/vite-plugin`

```bash
npm install -D @eldrex/vite-plugin
```

### 2. Configure `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import devdiff from "@eldrex/vite-plugin";

export default defineConfig({
  plugins: [
    devdiff({
      autoMemoryUpdate: true,
      showDevBanner: true,
    }),
  ],
});
```

---

## ⚙️ Options & Configuration

| Option             | Type       | Default               | Description                                                                 |
| ------------------ | ---------- | --------------------- | --------------------------------------------------------------------------- |
| `autoMemoryUpdate` | `boolean`  | `true`                | Automatically updates `.devdiff/memory` index when files change in dev mode |
| `showDevBanner`    | `boolean`  | `true`                | Displays DevDiff dev server status banner in terminal                       |
| `exclude`          | `string[]` | `['node_modules/**']` | Globs to exclude from change tracking                                       |
