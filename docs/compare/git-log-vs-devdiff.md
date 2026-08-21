# git log vs DevDiff: AI Codebase Intelligence Comparison

Understanding what changed across commits, PRs, and monorepo merges is critical for software engineering teams. This page compares traditional `git log` output with DevDiff's AST-aware, persona-driven AI changelog engine.

---

## Detailed Feature Comparison Matrix

| Feature                      | `git log`                           | DevDiff (v1.6.0)                                                         |
| ---------------------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| **Audience Targeting**       | Technical developers only           | Custom personas (Developer, PM, Security Auditor, Executive, Educator)   |
| **Content Source**           | Manually typed commit messages      | AST-analyzed code differences, export changes, & package manifests       |
| **Codebase Memory Context**  | None (reads raw commit text only)   | Persistent codebase memory index (`.devdiff/memory/codebase-index.json`) |
| **Executive / PM Summaries** | Raw commit hashes                   | Clean Keep a Changelog narrative grouped by business impact              |
| **Credential Redaction**     | Plaintext (exposes leaked API keys) | `RedactionEngineV2` masks credentials before output processing           |
| **Injection Safeguards**     | None                                | `PromptSanitizer` strips Unicode Tag Blocks & malicious payloads         |
| **SemVer Detection**         | Manual tag creation                 | Automated AST breaking change detection (`SemverDetector`)               |
| **Query Latency**            | Command execution dependent         | Sub-50ms index queries via MCP Server (`@eldrex/mcp`)                    |

---

## Raw `git log` Example vs DevDiff Natural Output

### Traditional `git log` Output

```text
commit b3f84d91a92e10a6234b
Author: Developer <dev@project.dev>
Date:   Sat Aug 8 12:34:56 2026

    refactor signal reactivity and update login
```

_Problem:_ `git log` only shows what the developer typed. It does not explain what functions were altered, whether breaking API changes occurred, or whether credentials were included.

---

### DevDiff AI Explanation Output

```markdown
### Reactivity System Refactoring (`packages/core`)

- **Added**: `batch()` utility function to group signal state updates into a single re-render cycle (`packages/core/src/signals.ts`).
- **Fixed**: Prevented unnecessary layout thrashing on heavy dashboard components.
- **Security**: Sanitized session authentication tokens during user login redirect (`packages/core/src/auth.ts`).
- **SemVer Recommendation**: MINOR increment (Feature addition, fully backward-compatible).
```

_Solution:_ DevDiff parses AST modifications, extracts modified exported functions, filters sensitive keys, and formats the output into clean, scannable developer language.
