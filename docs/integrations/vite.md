# Vite Plugin

Automatically run changelog generation as part of your Vite build pipeline using `@eldrex/vite`.

## Setup

1. Install:
   ```bash
   pnpm add -D @eldrex/vite
   ```
2. Import in `vite.config.ts`:
   ```typescript
   import { defineConfig } from "vite";
   import devDiffPlugin from "@eldrex/vite";

   export default defineConfig({
     plugins: [
       devDiffPlugin({
         enabled: true,
         output: "CHANGELOG.md",
       }),
     ],
   });
   ```
