# Building Custom DevDiff Plugins

This guide walks you through building, testing, and deploying a custom DevDiff plugin using `@eldrex/plugin-sdk`.

---

## 🛠️ Step 1: Initialize Your Plugin Project

Create a new TypeScript project or module inside your repository or monorepo:

```bash
mkdir my-devdiff-plugin
cd my-devdiff-plugin
npm init -y
npm install @eldrex/plugin-sdk
npm install -D typescript tsup
```

### `package.json` setup:

```json
{
  "name": "devdiff-plugin-my-extension",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts"
  },
  "dependencies": {
    "@eldrex/plugin-sdk": "^1.6.0"
  }
}
```

---

## 💻 Step 2: Implement the Plugin Interface

Create `src/index.ts`:

```typescript
import {
  DevDiffPlugin,
  PluginContext,
  ChangelogResult,
} from "@eldrex/plugin-sdk";

export const MyCustomPlugin: DevDiffPlugin = {
  id: "devdiff-plugin-my-extension",
  name: "My Custom DevDiff Extension",
  version: "1.0.0",
  description: "Performs custom post-processing on DevDiff changelogs.",
  author: {
    name: "Developer Name",
  },
  devdiffVersion: ">=1.5.0",

  async activate(context: PluginContext) {
    context.logger.info("My Custom Plugin activated successfully!");
  },

  hooks: {
    async afterAnalysis(changelog: ChangelogResult) {
      console.log(
        `[My Custom Plugin] Generated changelog for ${changelog.files.length} files.`,
      );
      return changelog;
    },
  },
};

export default MyCustomPlugin;
```

---

## ⚙️ Step 3: Register Plugin in `.devdiff/config.json`

Add your plugin entry to your project's `.devdiff/config.json`:

```json
{
  "plugins": ["./my-devdiff-plugin"]
}
```

---

## 🧪 Step 4: Testing Your Plugin

Test your plugin using DevDiff CLI:

```bash
# Run DevDiff CLI with verbose logging to inspect plugin hooks
devdiff generate --verbose
```
