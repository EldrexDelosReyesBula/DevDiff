# @eldrex/gateway

## 1.6.0

### Major Changes

- **Groq LPU Provider**: Added `groq://` protocol provider routing to Groq's Language Processing Unit cloud engine (`llama-3.1-8b-instant`, `llama-3.1-70b-versatile`). Enables sub-100ms changelog generation.
- **Google Gemini Provider**: Added `gemini://` protocol routing to Google AI Studio API (`gemini-1.5-flash`, `gemini-1.5-pro`) with 1M token context window support.
- **DeepSeek AI Provider**: Added `deepseek://` protocol routing — supports both local Ollama execution (`deepseek-coder:6.7b`) and the DeepSeek OpenAI-compatible cloud endpoint.
- **Transformers.js (ONNX) Provider**: Added `transformers://` in-process provider using `@xenova/transformers` runtime — zero external daemon dependency.
- **Multi-Agent Orchestrator v2**: 4 specialized agent swarm (Architect, Security, Performance, Docs) with configurable consensus voting and phase-based output aggregation.
- **AccuracyGuard integration**: Gateway validates AI provider responses for hallucinated function names, fabricated file paths, and non-existent API references before returning output.
- **Mermaid Diagram Sanitizer**: Strips unsafe node labels, HTML injection, and unsupported syntax from AI-generated Mermaid diagrams before rendering.
- Added `publishConfig.access: "public"` for npm scoped package publishing.
- Added `repository` field pointing to monorepo directory `packages/gateway`.
- Fixed `author` field — corrected from `"DevDiff Contributors"` to `"Eldrex Delos Reyes Bula"`.

### Minor Changes

- Provider fallback chain now supports 4 levels: primary → secondary → tertiary → offline stub.
- Added provider health check on startup — emits a structured warning if a configured provider is unreachable.
- `Mermaid classDiagram` label stripping bug fixed — node labels with special characters no longer get incorrectly stripped.

### Patch Changes

- Fixed WebSocket reconnection after provider timeout under heavy load.
- Fixed JSON response parsing edge cases — trailing commas and extra whitespace now handled correctly.

### Updated Dependencies
- `@eldrex/core@1.6.0`
- `@eldrex/personas@1.6.0`

---

## 1.0.4

### Patch Changes

- Release v1.0.4 - Unified Design System, dynamic Ollama model detection, security guards, and contact address updates.
- Updated dependencies
  - @eldrex/core@1.0.4
  - @eldrex/personas@1.0.4
