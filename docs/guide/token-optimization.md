# Token Optimization

To reduce LLM latency and avoid high cloud API costs, DevDiff implements a comprehensive suite of token optimization strategies that reduce input tokens by up to **85%**.

---

## 1. AST Trimming (Abstract Syntax Tree Pruning)

Passing entire source code files to an LLM is highly inefficient and expensive. Instead, DevDiff parses code changes into an Abstract Syntax Tree (AST) using local language parsers and performs targeted pruning:

```
[Full Source File (1000 lines)]
             │
             ▼ (AST Parsing)
    [Full AST Nodes Tree]
             │
             ▼ (Isolate modified lines)
  [Modified Nodes & Direct Branches]  <-- Prunes unmodified classes/functions
             │
             ▼ (Serialization)
 [Trimmed Prompt Code (150 lines)]
```

-   **Focus on Modifiers:** DevDiff identifies the exact node ranges (e.g. modified methods, imported modules) using Git line numbers.
-   **Dependency Pruning:** Unmodified classes, helper functions, and irrelevant comments are removed, passing only context that directly influences the change.

---

## 2. Commit & Event Batching

If developers make multiple small commits in quick succession, triggering the AI model for each commit results in high token overhead. The DevDiff Gateway queue aggregates these events:

-   **Batch Windows:** Configured in seconds (e.g. `batchWindow: 20000` / 20 seconds).
-   **Aggregation:** If multiple commit pushes are detected for the same repository within the batch window, they are merged into a single processing job.
-   **Single Run:** Only one prompt is generated and processed for the entire commit sequence, saving both context token overhead and API roundtrips.

---

## 3. Hash-Based Explanations Caching

DevDiff maintains a local, secure cache of generated explanations:

-   **Hash Calculation:** When a diff is generated, DevDiff calculates a cryptographic hash based on the trimmed diff contents and the chosen persona.
-   **Instant Resolution:** If the same diff or file changes are analyzed again, the CLI or Gateway serves the explanation instantly from cache, incurring **zero** AI token usage or latency.
-   **Cache Path:** Configurable in your project settings, defaulting to `.devdiff/cache.json`.
