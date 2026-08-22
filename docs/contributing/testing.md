# Testing & Quality Assurance Guidelines

DevDiff enforces automated unit, integration, and stress testing across all monorepo packages to maintain 100% test reliability and zero runtime regressions.

---

## Running Automated Tests

```bash
# Run all unit and integration tests across the entire monorepo
pnpm test

# Run tests for a specific workspace package
pnpm --filter @eldrex/core test
pnpm --filter @eldrex/plugin-sdk test
pnpm --filter @eldrex/gateway test
pnpm --filter @eldrex/openclaw test

# Run full cross-platform release gate verification
pnpm gate       # macOS / Linux
pnpm gate:ps    # Windows PowerShell
```

---

## Testing Standards & Best Practices

1. **Unit Tests (`*.test.ts`)**:
   - Every new engine method, CLI command, or utility in `@eldrex/core` must include Vitest unit tests in `packages/core/tests/`.
   - All tests must pass with zero unhandled promise rejections or memory leaks.
2. **Plugin Testing with DevTools**:
   - When building or testing plugins, use `DevDiffDevTools.mockDiff()` and `DevDiffDevTools.createTestHarness()` from `@eldrex/plugin-sdk` to simulate diff transformations and error handling in memory without touching git.
3. **Mocking External Providers**:
   - Cloud AI providers (Gemini, Groq, OpenAI, Anthropic, DeepSeek) must always be mocked during standard unit tests. Real API calls are never permitted in CI runs.
4. **Redaction Engine Verification**:
   - Security tests must verify that sensitive credentials (API keys, RSA tokens, passwords) are masked in diff payloads before assertion checks pass.
