# Core Library API Reference (`@eldrex/core` v1.6.0)

The `@eldrex/core` package contains DevDiff's core engine, including AST parsing, persistent codebase memory indexing, credential redaction, network firewalls, and AI provider routing.

---

## 📦 Import Syntax

```typescript
import {
  generateChangelog,
  loadConfig,
  CodebaseMemoryEngine,
  RedactionEngineV2,
  NetworkGuard,
  AccuracyGuard,
  SemverDetector
} from "@eldrex/core";
```

---

## 🛠️ Main Function & Class Specifications

### `generateChangelog(options: ChangelogOptions): Promise<ChangelogResult>`

Generates an AST-analyzed, redacted, persona-driven changelog output.

```typescript
const result = await generateChangelog({
  diffText: rawGitDiff,
  persona: "developer",
  format: "markdown",
  redactSecrets: true
});
console.log(result.formattedOutput);
```

### `CodebaseMemoryEngine`

Manages persistent workspace indexing and sub-50ms index queries.

```typescript
const memory = new CodebaseMemoryEngine({ workspacePath: process.cwd() });
await memory.initializeIndex();

// Sub-50ms entity memory query
const entityData = await memory.queryEntity("AuthService");
```

### `RedactionEngineV2`

Scans and masks credentials, API keys, and private certificates before LLM transmission.

```typescript
const sanitizedPayload = RedactionEngineV2.redactSecrets(diffContent);
```
