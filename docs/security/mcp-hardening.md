# MCP Hardening & Security Architecture (v1.6.0)

DevDiff v1.6.0 introduces enterprise-grade hardening for Model Context Protocol (MCP) server interactions. As AI agents (Copilot, Gemini, Claude, Cursor, Windsurf) gain deeper integration into local development environments, DevDiff acts as a secure isolation layer between IDE agents and the host operating system.

---

## 🎯 Architecture & Hardening Pillars

```mermaid
flowchart LR
    SubGraph1[IDE AI Agent] -->|JSON-RPC Request| Shield[MCP Security Hardening Layer]

    subgraph Shield [Security Enforcement Layer]
      RateLimit[Query Rate Limiter\n(Max 30 req/min)]
      Sanitizer[Unicode Tag-Block Stripper]
      Validator[JSON-RPC Schema Validator]
      PathGuard[Workspace Scope Enforcer]
    end

    Shield -->|Sanitized Payload| Core[DevDiff Local Memory Index]

    style Shield fill:#eef,stroke:#333,stroke-width:2px
    style Core fill:#ddf,stroke:#333,stroke-width:2px
```

---

## 🛡️ Hardening Features

### 1. Local-First Execution Boundary

- **Zero External Network Overhead**: All 8 MCP query tools (`devdiff_query_entity`, `devdiff_query_changes`, `devdiff_query_dependencies`, `devdiff_query_architecture`, `devdiff_query_search`, `devdiff_query_compliance`, `devdiff_query_stats`, `devdiff_query_timeline`) query `.devdiff/memory/codebase-index.json` locally.
- **No Cloud Indexing**: AST analysis and memory lookups execute sub-50ms directly on the developer's workstation.

### 2. Autonomous Loop & Query Rate Limiting

- To prevent agent infinite loops or runaway query execution, DevDiff includes an integrated token-bucket rate limiter (`RateLimiter`).
- **Default Limit**: 30 queries per minute per client connection.
- **Configurable**: Configurable in `.devdiff/config.json`:

```json
{
  "mcp": {
    "rateLimiting": {
      "enabled": true,
      "maxQueriesPerMinute": 30,
      "burstSize": 5
    }
  }
}
```

### 3. Unicode Tag-Block & Adversarial Prompt Injection Stripping

- Hidden Unicode Tag Characters (`U+E0000..U+E007F`) and zero-width spaces are frequently embedded in malicious PRs or external dependencies to perform prompt injection attacks against LLMs.
- DevDiff automatically runs `PromptSanitizer.sanitize()` on all tool arguments and codebase snippets before returning data to the MCP client.

### 4. JSON-RPC Strict Schema Validation

- All incoming MCP tool requests are validated against strict TypeScript & Zod schemas.
- Extra parameters, unexpected object mutations, or malformed JSON payloads trigger immediate RPC error code `-32602 (Invalid Params)`.

---

## 📋 MCP Tool Security Matrix

| MCP Tool Name                | Access Type       | Path Validation | Secret Redaction | Rate Limited |
| ---------------------------- | ----------------- | --------------- | ---------------- | ------------ |
| `devdiff_query_entity`       | Read-only AST     | ✅ Required     | ✅ Enforced      | ✅ Yes       |
| `devdiff_query_changes`      | Read-only Git     | ✅ Required     | ✅ Enforced      | ✅ Yes       |
| `devdiff_query_dependencies` | Read-only Graph   | ✅ Required     | ℹ️ N/A           | ✅ Yes       |
| `devdiff_query_architecture` | Read-only Graph   | ✅ Required     | ℹ️ N/A           | ✅ Yes       |
| `devdiff_query_search`       | Read-only Index   | ✅ Required     | ✅ Enforced      | ✅ Yes       |
| `devdiff_query_compliance`   | Read-only Rules   | ✅ Required     | ✅ Enforced      | ✅ Yes       |
| `devdiff_query_stats`        | Read-only Metrics | ✅ Required     | ℹ️ N/A           | ✅ Yes       |
| `devdiff_query_timeline`     | Read-only Git     | ✅ Required     | ✅ Enforced      | ✅ Yes       |
