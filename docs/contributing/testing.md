# Testing & Quality Assurance Guidelines

DevDiff enforces automated unit, integration, and stress testing across all monorepo packages.

---

## 🧪 Running Automated Tests

```bash
# Run unit tests across all packages via Vitest
pnpm test

# Run tests with code coverage report
pnpm test:coverage

# Run stress testing suite
pnpm --filter devdiff-stress-testing test
```

---

## 📋 Testing Standards

- **Unit Tests**: Every new feature in `@eldrex/core` must include Vitest unit tests in `packages/core/test/`.
- **Mocking External APIs**: Cloud AI providers must be mocked during unit tests (`msw` or `vitest.vi.fn()`). No real API calls are permitted during standard unit test execution.
- **Redaction Engine Verification**: Security tests must verify that credentials are masked in diff payloads before assertions pass.
