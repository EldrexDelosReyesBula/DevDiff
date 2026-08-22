# Building Custom DevDiff Plugins

This guide walks you through building, testing, and deploying a custom DevDiff plugin using `@eldrex/plugin-sdk` and the **DevDiff Foundations DevTools Suite**.

---

## Step 1: Initialize Your Plugin Project

Create a new TypeScript project or module inside your repository or monorepo:

```bash
mkdir my-devdiff-plugin
cd my-devdiff-plugin
npm init -y
npm install @eldrex/plugin-sdk
npm install -D typescript tsup vitest
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
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "test": "vitest run"
  },
  "dependencies": {
    "@eldrex/plugin-sdk": "^1.9.0"
  }
}
```

---

## Step 2: Implement the Plugin Interface

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

## Step 3: Unit Testing with DevDiff DevTools

`@eldrex/plugin-sdk` exports `DevDiffDevTools` — an in-memory test harness and synthetic mock generator allowing you to test plugin lifecycles and transformations with zero dependency on git or real disk writes.

Create `tests/plugin.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { DevDiffDevTools } from "@eldrex/plugin-sdk";
import { MyCustomPlugin } from "../src/index.js";

describe("MyCustomPlugin with DevDiffDevTools", () => {
  it("passes plugin validation schema", () => {
    const validation = DevDiffDevTools.validatePlugin(MyCustomPlugin);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("runs full lifecycle harness with synthetic mock diff", async () => {
    const harness = DevDiffDevTools.createTestHarness(MyCustomPlugin);
    await harness.init();

    const mockDiff = DevDiffDevTools.mockDiff({
      filesCount: 3,
      additionsPerFile: 15,
      deletionsPerFile: 5,
    });

    const mockContext = DevDiffDevTools.mockContext({
      name: "test-workspace",
    });

    const result = await harness.runAnalysis(mockDiff, mockContext);
    expect(result).toBeDefined();
    expect(harness.getLogs().some((l) => l.includes("activated"))).toBe(true);

    await harness.destroy();
  });

  it("benchmarks plugin execution latency", async () => {
    const benchmark = await DevDiffDevTools.benchmarkPlugin(MyCustomPlugin, {
      iterations: 20,
    });

    expect(benchmark.avgDurationMs).toBeLessThan(100);
  });
});
```

---

## Step 4: Register Plugin in `.devdiff/config.json`

Add your plugin entry to your project's `.devdiff/config.json`:

```json
{
  "plugins": ["./my-devdiff-plugin"]
}
```

---

## Step 5: Run with DevDiff CLI

```bash
# Run DevDiff CLI with verbose logging to inspect plugin hooks in production
devdiff generate --verbose
```
