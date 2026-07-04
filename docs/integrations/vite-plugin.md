# Vite Plugin

Integrate DevDiff directly into your Vite development server for real-time changelog generation during development.

---

## Installation

```bash
npm install --save-dev @eldrex/vite-plugin
```

---

## Configuration

```javascript
// vite.config.js
import { defineConfig } from "vite";
import devdiff from "@eldrex/vite-plugin";

export default defineConfig({
  plugins: [
    devdiff({
      // Options (all optional)
      persona: "developer", // Default persona
      autoGenerate: false, // Generate on every build?
      onStagedChanges: true, // Show notification when staged files change
      overlay: true, // Show changelog overlay in browser
    }),
  ],
});
```

---

## What It Does

When installed, the Vite plugin:

1. **Watches** your git staging area for changes
2. **Notifies** you in the browser overlay when staged changes exist
3. **Generates** changelogs on demand from the browser UI
4. **Injects** the DevDiff panel into your dev server's browser

---

## Browser Overlay

With `overlay: true`, a small DevDiff badge appears in the bottom-right corner of your dev server. Click it to:

- View staged changes summary
- Generate changelog for current staged state
- Switch persona without leaving the browser

---

## Auto-Generate on Build

```javascript
devdiff({
  autoGenerate: true,
  outputFile: "public/changelog.json", // Bake into build artifacts
  format: "json",
});
```

This generates and bakes the changelog into your production build automatically.

---

## Framework Examples

### React + Vite

```javascript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import devdiff from "@eldrex/vite-plugin";

export default defineConfig({
  plugins: [react(), devdiff({ persona: "developer" })],
});
```

### Vue + Vite

```javascript
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import devdiff from "@eldrex/vite-plugin";

export default defineConfig({
  plugins: [vue(), devdiff({ persona: "developer", overlay: true })],
});
```

---

## Options Reference

| Option            | Type    | Default       | Description                    |
| ----------------- | ------- | ------------- | ------------------------------ |
| `persona`         | string  | `'developer'` | Default persona for generation |
| `autoGenerate`    | boolean | `false`       | Generate on every build        |
| `onStagedChanges` | boolean | `true`        | Watch for staged changes       |
| `overlay`         | boolean | `true`        | Show browser overlay           |
| `outputFile`      | string  | `null`        | Save output to file            |
| `format`          | string  | `'markdown'`  | Output format                  |
| `provider`        | object  | auto          | AI provider config             |
