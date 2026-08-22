# @eldrex/plugin-sdk

## 1.9.0

### Major Changes

- **DevDiff Foundations DevTools Suite**: Complete testing, validation, and benchmarking utilities for plugin authors (`DevDiffDevTools`):
  - **`mockDiff(options)`**: Realistic synthetic git diff generator supporting customizable file counts, line additions, line deletions, hunks, and renames for zero-dependency unit tests.
  - **`mockContext(options)`**: Mock project context generator producing structured hierarchies, languages, dependencies, and raw summaries.
  - **`createTestHarness(plugin)`**: In-memory lifecycle simulation harness with `activate`, `beforeAnalysis`, `afterAnalysis`, `onError`, and `deactivate` execution and log/error capture.
  - **`validatePlugin(plugin)`**: Structural and SemVer validator verifying plugin manifest schema, hook signatures, and version constraints.
  - **`benchmarkPlugin(plugin, options)`**: Performance profiler measuring average execution latency (ms) and memory overhead across iterations.

---

## 1.8.0

### Minor Changes

- **Decoupled Plugin Architecture**: Standardized standalone third-party plugin loading and isolated lifecycle boundaries.
- **Progressive Explainer Protocol**: Exported interface definitions for 5-stage progressive code explanation plugins.

---

## 1.7.0

### Minor Changes

- **Supply Chain Security & Permission Hooks**: Added plugin lifecycle contracts for permission declaration audits and dependency scanning validation.
- **Universal Prompt Transformer Support**: Plugins can now intercept and format prompt export outputs for external LLM models.

---

## 1.6.0

### Major Changes

- **Plugin Lifecycle Hooks v2**: Expanded plugin hook surface from 4 to 12 hooks:
  - `onDiffParsed(diff: ParsedDiff): Promise<ParsedDiff>` — transform raw diff before AI processing.
  - `onBeforeAI(context: AIContext): Promise<AIContext>` — modify context before AI provider call.
  - `onAfterAI(result: AIResult): Promise<AIResult>` — post-process AI output.
  - `onChangelogGenerated(changelog: Changelog): Promise<Changelog>` — transform final changelog.
  - `onSecurityScan(findings: SecurityFinding[]): Promise<SecurityFinding[]>` — filter or enrich security findings.
  - `onMemoryUpdated(snapshot: MemorySnapshot): Promise<void>` — react to codebase memory index updates.
  - `onProviderSelected(provider: ProviderConfig): Promise<ProviderConfig>` — override provider selection logic.
  - `onTokensEstimated(tokens: number): Promise<number>` — modify token count before truncation decisions.
  - `onRedactionApplied(redacted: string): Promise<string>` — inspect or modify post-redaction content.
  - `onPersonaApplied(output: string, persona: string): Promise<string>` — customize persona formatting.
  - `onError(error: DevDiffError): Promise<void>` — handle plugin-level errors.
  - `onShutdown(): Promise<void>` — clean up plugin resources on DevDiff exit.
- **Plugin Manifest Schema**: Added Zod-validated `PluginManifest` type for `package.json` `devdiff.plugin` configuration block.
- **Plugin Cost Tracker**: Built-in `CostTracker` utility class for tracking cumulative AI token costs across plugin lifecycle calls.
- Added `publishConfig.access: "public"` for npm scoped package publishing.

### Minor Changes

- `createPlugin()` factory function now accepts `async` initializers.
- Added `PluginContext.logger` — structured log emitter for plugin diagnostic output.
- Added `PluginContext.memory` — read-only access to the codebase memory index from within plugin hooks.

### Patch Changes

- Fixed TypeScript declaration output — `dist/index.d.ts` now correctly exports all hook types.
- Fixed plugin hook execution order — hooks now execute in registration order (FIFO) rather than insertion-sort order.
