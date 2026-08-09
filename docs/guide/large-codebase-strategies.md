# Monorepo & Large Codebase Strategies

When operating on monorepos or repositories containing 5,000+ source files, processing diffs without strategy can trigger LLM context window overflows, memory bloat, or slow response times.

DevDiff includes built-in strategies for scaling efficiently across large repositories: **Progressive Directory Partitioning**, **AST Scope Trimming**, and **Selective Package Scope Filters**.

---

## 🎯 Scaling Architecture

```mermaid
flowchart TD
    Monorepo[5,000+ File Monorepo] --> Filter{Package Scope Filter Specified?}
    Filter -->|Yes: --package packages/core| TargetPkg[Process Target Package Only]
    Filter -->|No| Chunker[Progressive Directory Chunker]

    Chunker --> Part1[Chunk 1: packages/core]
    Chunker --> Part2[Chunk 2: packages/cli]
    Chunker --> Part3[Chunk 3: packages/vscode]

    Part1 --> AST[AST Trimmer & Redactor]
    Part2 --> AST
    Part3 --> AST

    AST --> Summary[Synthesize Hierarchical Monorepo Summary]

    style Chunker fill:#bbf,stroke:#333,stroke-width:2px
    style Summary fill:#9f9,stroke:#333,stroke-width:2px
```

---

## ⚙️ Monorepo Best Practices

### 1. Target Specific Package Scopes

Use the `--path` or `--package` flags to restrict analysis to specific sub-packages:

```bash
# Analyze changes exclusively in packages/core
devdiff generate --path packages/core

# Analyze changes in VS Code extension package
devdiff generate --path packages/vscode
```

### 2. Leverage Progressive Directory Chunking

DevDiff automatically partitions diffs larger than 100KB into directory chunks, summarizing each package independently before assembling the final changelog.

### 3. Maintain Workspace `.devdiffignore` Rules

Prevent monorepo lockfiles (`pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`) from inflating diff sizes.
