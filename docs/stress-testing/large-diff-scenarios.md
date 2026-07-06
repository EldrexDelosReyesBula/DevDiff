# Large Diff Scenarios

Processing extremely large changesets requires resilient design. DevDiff implements chunking and caching to handle large-scale diff scenarios.

---

## ⚙️ How DevDiff Handles Large Diffs

When you stage thousands of additions/deletions, DevDiff utilizes two main resilience techniques:

### 1. Progressive Chunking
Instead of sending a massive, monolithic file diff that causes LLM context overflows or 30-second timeouts, DevDiff partitions the changesets into smaller directory and file groups. If an attempt fails, it automatically reduces the size of the chunks and retries progressively.

### 2. Cache-Aided Recovery
Files that do not change between runs are cached, preventing repetitive calculations and ensuring only new delta modifications are submitted.
