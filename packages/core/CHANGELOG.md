# @eldrex/core

## 1.7.0

### Minor Changes

- **AgentRegistry & OpenClawSupervisorV2**: Multi-agent squad orchestration (`architect`, `security`, `performance`, `docs`, `qa`), fallback task routing, parallel swarm consensus building, and `.devdiff/agents/openclaw/supervisor.yaml` task graph decomposition.
- **PromptGenerator & ImportEngine**: Universal AI prompt exporter for ChatGPT, Claude, Gemini, Copilot, and clipboard-based response importer with completeness and quality validation.
- **BehavioralEngine & AdaptiveRuleEngine**: Dynamic security baseline engine with threat feed synchronization and auto-disabling rule learning.
- **DependencyScanner & ObfuscationDetector**: Supply chain protection with live OSV API & npm query integration, native binary detection, and 8-indicator threat scoring.

## 1.6.0

### Major Changes

- **StudyEngine**: Study Buddy Mode core engine — line-by-line educational explanations, learning path generator (`generateLearningPath`), 5-minute newcomer codebase tour (`generateCodebaseTour`), and interactive self-quizzes (`generateQuiz`).
- **AIDetector**: Zero-friction multi-path AI detection engine (`detectAll`) for Ollama (local), IDE Agent (built-in), and Cloud AI providers with platform-specific setup commands.
- **PluginSecurityScanner**: 7-pass static security auditing engine (`scan`) for malicious plugin detection (network destinations, shell execution, external file access, code obfuscation, telemetry exfiltration, publisher signatures, undeclared permissions).
- **IDEGuardian Worker Isolation**: All AI inference and codebase memory operations execute inside isolated Node.js worker threads with a hard 256MB memory ceiling and crash recovery.
- **Redaction Engine v2**: Expanded credential pattern coverage to 47 types including RSA private keys, GitHub tokens, AWS IAM keys, and GCP service account JSON.
- **AccuracyGuard**: Validation layer detecting hallucinated function names, fabricated file paths, and non-existent API references.
- **NetworkGuard**: Strict outbound network firewall — blocks all network calls except explicitly configured AI provider endpoints.
- **CodebaseMemoryEngine**: Persistent AST-indexed codebase memory with sub-50ms query times (`.devdiff/memory/codebase-index.json`).
- **UniversalProjectDetector**: Detects 60+ language extensions and project types without requiring `package.json`.
- **NaturalChangelogGenerator**: Post-processes AI output into factual past-tense developer prose.
- **CloudGuard**: Explicit opt-in guard — environment API keys are never called automatically without `devdiff auth add`.
- Added `publishConfig.access: "public"` for npm scoped package publishing.

### Patch Changes

- Fixed optional `threshold?: string` parameter fallback in `securityScan()` engine method.
- Fixed token estimation for Unicode-heavy diffs.
- AST trimmer token reduction improved to 85%.

### Updated Dependencies

- `@eldrex/personas@1.6.0`
- `@eldrex/plugin-sdk@1.6.0`

---

## 1.0.4

### Patch Changes

- Release v1.0.4 - Unified Design System, dynamic Ollama model detection, security guards, and contact address updates.
- Updated dependencies
  - @eldrex/personas@1.0.4
