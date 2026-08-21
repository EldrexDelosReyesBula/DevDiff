# DevDiff Test Suites & Quality Assurance Matrix

This directory houses the end-to-end (E2E), stress testing, and performance benchmark suites for the **DevDiff** monorepo.

---

## 🧪 Testing Architecture

```
test/
├── e2e/                     # End-to-end sequential phase test matrix (01 - 13)
│   ├── 01-environment.sh    # Node.js, Git, and environment prerequisites
│   ├── 02-install.sh        # Dependency installation & package resolution
│   ├── 03-commands.sh       # Core CLI command execution
│   ├── 04-git.sh            # Git diff parsing & staging analysis
│   ├── 05-ai-providers.sh   # AI provider auto-detection & routing
│   ├── 06-personas.sh       # Persona generation & switching
│   ├── 07-stress-vibe.sh    # High-throughput diff processing
│   ├── 07b-concurrent.sh    # Concurrent commit handling
│   ├── 08-recovery.sh       # Error recovery & graceful fallbacks
│   ├── 09-playground.sh     # Interactive testing sandbox
│   ├── 10-security.sh       # Secret scanning & shell sandboxing
│   ├── 11-versioning.sh     # Semver & changeset validation
│   ├── 12-packages.sh       # Package tarball & artifact verification
│   └── 13-release-gate.sh   # Full pre-release quality gate
├── stress/                  # Heavy load and concurrency stress testing
│   ├── concurrent-commits.sh
│   ├── desktop-full-stress.sh
│   ├── full-suite.sh
│   ├── monorepo-stress.sh
│   └── vibe-coding-blast.sh
├── performance/             # Performance & latency benchmarks
│   └── benchmark.sh
└── README.md                # This documentation
```

---

## 🚀 Running Tests

### 1. Primary Automated Unit Test Suite (Vitest)
Unit tests for all packages are managed by Vitest and Turborepo:

```bash
# Run all unit tests across all workspace packages
pnpm test

# Run tests with coverage
pnpm test --coverage
```

### 2. End-to-End Bash Verification Matrix
Run all sequential E2E validation phases:

```bash
bash test/run-all.sh
```

Or execute individual phases:

```bash
bash test/e2e/01-environment.sh
bash test/e2e/10-security.sh
```
