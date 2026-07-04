# JavaScript SDK

The `@eldrex/core` package provides a full JavaScript/TypeScript API for embedding DevDiff functionality in your own applications, scripts, and tools.

---

## Installation

```bash
npm install @eldrex/core
```

---

## Quick Start

```typescript
import { DevDiff } from '@eldrex/core';

const devdiff = new DevDiff({
  ai: {
    providers: [
      { name: 'local', url: 'ollama://llama3.2:3b', priority: 1 }
    ]
  }
});

const changelog = await devdiff.generate({
  persona: 'developer',
  format: 'markdown'
});

console.log(changelog.output);
```

---

## API Reference

### `new DevDiff(config?)`

Creates a new DevDiff instance.

```typescript
import { DevDiff, DevDiffConfig } from '@eldrex/core';

const config: DevDiffConfig = {
  ai: {
    providers: [
      { name: 'ollama', url: 'ollama://llama3.2:3b', priority: 1 }
    ],
    timeout: 60000
  },
  output: {
    format: 'markdown'
  }
};

const devdiff = new DevDiff(config);
```

---

### `devdiff.generate(options)`

Generates a changelog for staged changes or provided diff text.

```typescript
const result = await devdiff.generate({
  persona: 'developer',          // Persona to use
  format: 'markdown',            // Output format
  diffText: string,              // Optional: provide diff directly
  dryRun: false,                 // If true, returns prompt without calling AI
});

// Result
interface GenerateResult {
  output: string;                 // The generated changelog
  metadata: {
    persona: string;
    format: string;
    model: string;
    tokensUsed: number;
    duration: number;             // milliseconds
    filesChanged: number;
    linesAdded: number;
    linesRemoved: number;
  };
}
```

**Examples:**

```typescript
// From staged git changes
const result = await devdiff.generate({ persona: 'ceo' });

// From a raw diff string
const result = await devdiff.generate({
  diffText: `
+++ b/src/app.ts
@@ -10,6 +10,10 @@ export function main() {
+  // New feature
+  console.log('hello');
`,
  persona: 'developer'
});

// Dry run (get prompt without calling AI)
const result = await devdiff.generate({ dryRun: true });
console.log(result.output); // Shows the prompt that would be sent
```

---

### `devdiff.generateMultiAgent(options)`

Runs multiple personas simultaneously.

```typescript
const result = await devdiff.generateMultiAgent({
  personas: ['developer', 'ceo', 'compliance'],
  synthesize: true,
  format: 'markdown'
});

// Result
interface MultiAgentResult {
  outputs: Record<string, string>;  // Per-persona outputs
  synthesis: string;                // Combined output (if synthesize: true)
  metadata: { /* ... */ };
}
```

---

### `devdiff.getDiff()`

Gets the current staged diff without AI analysis.

```typescript
const diff = await devdiff.getDiff();

interface DiffResult {
  raw: string;          // Raw unified diff
  files: FileDiff[];    // Parsed file-level diffs
  stats: {
    filesChanged: number;
    linesAdded: number;
    linesRemoved: number;
  };
}
```

---

### `devdiff.compliance.check(framework)`

Checks the current staged changes against a compliance framework.

```typescript
const report = await devdiff.compliance.check('gdpr');

interface ComplianceReport {
  framework: string;
  score: number;        // 0–100
  compliant: ComplianceItem[];
  warnings: ComplianceItem[];
  violations: ComplianceItem[];
  actions: string[];
}
```

---

### `devdiff.config`

Access and validate the active configuration.

```typescript
// Get config
const config = await devdiff.config.load('./my-project');

// Validate config
const result = await devdiff.config.validate();
if (!result.valid) {
  console.error(result.errors);
}
```

---

## TypeScript Types

```typescript
import type {
  DevDiffConfig,
  GenerateOptions,
  GenerateResult,
  MultiAgentOptions,
  MultiAgentResult,
  DiffResult,
  ComplianceReport,
  Persona,
  OutputFormat,
  ProviderConfig,
} from '@eldrex/core';
```

---

## Events

```typescript
const devdiff = new DevDiff(config);

// Listen for events
devdiff.on('generate:start', ({ persona, format }) => {
  console.log(`Generating with ${persona} persona...`);
});

devdiff.on('generate:complete', (result) => {
  console.log(`Done in ${result.metadata.duration}ms`);
});

devdiff.on('provider:error', ({ provider, error }) => {
  console.error(`Provider ${provider} failed:`, error.message);
  // DevDiff will automatically try next provider
});
```

---

## Example: Custom CLI Tool

```typescript
#!/usr/bin/env node
import { DevDiff } from '@eldrex/core';
import { writeFileSync } from 'fs';

const devdiff = new DevDiff();

const result = await devdiff.generate({
  persona: process.argv[2] || 'developer',
  format: 'markdown'
});

const filename = `changelog-${Date.now()}.md`;
writeFileSync(filename, result.output);
console.log(`✅ Saved to ${filename}`);
```
