# DevDiff — Known Limitations & Scope

A transparent and factual guide to DevDiff's operational boundaries, capabilities, performance expectations, and versioning lifecycle.

---

## 1. AI Reasoning & Inference Boundaries

| Limitation | Technical Reason | Recommended Solution / Workaround |
| :--- | :--- | :--- |
| **Massive Diffs (>500 files or >10k LOC)** | Exceeds LLM context window limits ($8\text{k}-128\text{k}$ tokens). | DevDiff automatically applies hierarchical AST compression. For line-by-line detail, stage smaller commits. |
| **First-Run Indexing on Large Repos** | AST indexing parses all workspace symbols on cold start. | Run `devdiff memory init` or let the background indexer complete its initial scan ($30-60\text{s}$ for $100\text{k}+$ files). |
| **Auto-Generated Code & Lockfiles** | High noise ratio with little semantic architectural value. | Ignore generated assets via `.devdiffignore` (e.g. `pnpm-lock.yaml`, `dist/`, `build/`). |
| **Internal Domain Jargon** | General LLMs lack proprietary company acronyms. | Define project-specific terms and architecture in `.devdiff/SKILL.md`. |
| **Hardware-Dependent Local Inference** | Local models run on host GPU/CPU hardware. | On machines without dedicated GPU VRAM, use quantized models (e.g. `llama3.2:3b`) or lightweight cloud providers. |
| **Binary & Minified Files** | Compiled binaries and minified bundles lack readable diff lines. | DevDiff reports binary and minified file modifications by status and byte size without generating natural prose. |

---

## 2. Platform & Environment Compatibility

| Platform / Environment | Status | Notes |
| :--- | :--- | :--- |
| **macOS (Apple Silicon & Intel)** | ✅ Native Support | Hardware acceleration supported via Metal on Apple Silicon. |
| **Windows 10 / 11 & Windows Server** | ✅ Native Support | Full support in PowerShell, CMD, and Windows Terminal. |
| **Linux (x86_64 & ARM64)** | ✅ Native Support | Fully compatible with headless servers, CI runners, and devcontainers. |
| **WSL2 (Windows Subsystem for Linux)** | ✅ Supported | Automatically detects host Ollama daemons across `localhost` bridging. |
| **Docker & Air-Gapped Containers** | ✅ Supported | 100% offline execution with local Ollama, ONNX Transformers.js, or template fallbacks. |
| **CI/CD Pipelines (GitHub Actions, GitLab CI)** | ✅ Supported | Automated headless execution via `devdiff --ci` or `pnpm gate`. |

---

## 3. Strict Privacy & Execution Guarantees

DevDiff operates under a strict, human-craft privacy and safety contract:

- ❌ **No Silent Network Traffic**: Outbound network connections are blocked by default unless explicitly configured for a cloud AI provider.
- ❌ **No Background Code Modification**: DevDiff never modifies, commits, or pushes source code automatically.
- ❌ **No Telemetry or Tracking**: Zero tracking, analytics, fingerprinting, or user behavior collection.
- ❌ **No Account Requirements**: No sign-ups, API keys, or credit cards needed for local AI execution.
- ❌ **No Model Training**: Your codebase diffs and context are never transmitted to training corpuses.

---

## 4. Performance Expectations

| Changed Files | Typical Analysis Latency | Memory Footprint | Fallback Strategy |
| :--- | :--- | :--- | :--- |
| **1 – 20 files** | $<1.5\text{ seconds}$ | $<35\text{ MB}$ | Direct line-by-line synthesis |
| **20 – 100 files** | $1.5 – 5\text{ seconds}$ | $<50\text{ MB}$ | Module-level AST aggregation |
| **100 – 500 files** | $5 – 15\text{ seconds}$ | $<75\text{ MB}$ | Architectural subsystem grouping |
| **>500 files** | $15 – 30\text{ seconds}$ | $<100\text{ MB}$ | Deterministic structural summary fallback |

---

## 5. Versioning Lifecycle & Strict SemVer 2.0.0

DevDiff follows strict [Semantic Versioning 2.0.0](https://semver.org):

$$\mathbf{\text{MAJOR}}.\mathbf{\text{MINOR}}.\mathbf{\text{PATCH}}$$

### Current Release: `v1.9.0`
The current release milestone across the monorepo, **npm**, **VS Code Marketplace** (`ebula.devdiff`), and **Open VSX Registry** (`ebula/devdiff`) is **v1.9.0**.

### Forward Release Roadmap:
- **`v1.9.1` (Next Patch)**: Reserved for backward-compatible bug fixes, performance optimizations, and security patches.
- **`v1.10.0` (Next Minor)**: Targets upcoming feature additions, new CLI/MCP tool integrations, and expanded provider drivers.
- **`v2.0.0` (Future Major)**: Reserved for breaking API contracts, architectural changes, or configuration schema evolutions.

---

## 6. Reporting Issues & Community Support

- **Issue Tracker**: [GitHub Issues](https://github.com/EldrexDelosReyesBula/devdiff/issues)
- **Discussions & RFCs**: [GitHub Discussions](https://github.com/EldrexDelosReyesBula/devdiff/discussions)
- **Maintainer Contact**: [eldrexdelosreyesbula@gmail.com](mailto:eldrexdelosreyesbula@gmail.com)
