# @eldrex/openclaw

## 1.5.0 → 1.6.0

### Minor Changes

- OpenClaw integration updated to use `@eldrex/gateway` v1.6.0 provider routing — now supports Groq, Gemini, DeepSeek, and Transformers.js endpoints in addition to Ollama and OpenAI.
- Added `AccuracyGuard` validation pass on OpenClaw AI-generated diff annotations.
- Added `publishConfig.access: "public"` for npm scoped package publishing.

### Patch Changes

- Fixed authentication token refresh race condition under high request concurrency.
- Fixed diff annotation rendering for binary file changes.

### Updated Dependencies
- `@eldrex/core@1.6.0`
- `@eldrex/gateway@1.6.0`

---

## 1.0.4

### Patch Changes

- Release v1.0.4 - Unified Design System, dynamic Ollama model detection, security guards, and contact address updates.
- Updated dependencies
  - @eldrex/core@1.0.4
  - @eldrex/gateway@1.0.4
