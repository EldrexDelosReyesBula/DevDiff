# Token Optimization

To reduce LLM latency and API expenses, DevDiff employs token optimization strategies.

## 1. AST Trimming

Instead of passing the entire file context, DevDiff parses the AST and extracts only the modified node branches (functions, class declarations) and their direct dependencies. Unmodified nodes are pruned.

## 2. Commit Batching

The gateway queue aggregates commits that occur on the same repository within the batch window, processing them in a single aggregated run.

## 3. Explanations Caching

When identical diff outputs or files are processed again, DevDiff loads the previous explanations from a local hash-based cache.
