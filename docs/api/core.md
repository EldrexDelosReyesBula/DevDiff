# Core Library API Reference (`@eldrex/core` v1.9.0)

The `@eldrex/core` package contains DevDiff's core engine, including AST parsing, unified knowledge resolution, persistent codebase memory timeline indexing, credential redaction, network firewalls, and AI provider routing.

---

## Import Syntax

```typescript
import {
  generateChangelog,
  loadConfig,
  UnifiedContext,
  ContextMemorySync,
  HallucinationGuard,
  MemoryManager,
  MemoryConfig,
  TimeAwareGenerator,
  NetworkGuardV2,
  PluginAuditor,
  DisclosureReport,
  SkillLoader,
  CompletenessValidator,
  OutputQualityGate,
  NeverPushIncomplete,
} from "@eldrex/core";
```

---

## Main Specification Highlights (v1.7.0)

### `UnifiedContext`

Priority knowledge resolution (`SKILL.md` → `.devdiff/context.md` → recursive tree scanner).

```typescript
const knowledge = await UnifiedContext.load(workspacePath);
```

### `MemoryManager`

Date range snapshot deletion, active range scoping, snapshot labeling, and deduplication.

```typescript
const dryRunResult = await MemoryManager.deleteRange({
  from: "2026-03-01",
  to: "2026-03-15",
  workspacePath,
  dryRun: true,
});
```

### `TimeAwareGenerator`

Resolves human time expressions (`today`, `yesterday`, `this-week`, `date-range`, `since-initial`, `between-commits`) to git ranges.

```typescript
const changelog = await TimeAwareGenerator.generate({
  workspacePath,
  timeReference: { type: "today" },
});
```

### `NetworkGuardV2` & `DisclosureReport`

100+ domain blocklist across 5 categories and full disclosure report generation.

```typescript
const decision = NetworkGuardV2.checkConnection({ domain: "api.mixpanel.com" });
const report = await DisclosureReport.generate(workspacePath);
```
