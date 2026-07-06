# Memory Profiling

DevDiff is optimized for low memory usage, making it suitable to run on developer workstations alongside resource-heavy IDEs and compilers.

---

## 🧠 Memory Performance Standards

### 1. 512MB RAM Cap
The DevDiff Core engine employs stream parsing and chunking to ensure that memory usage never exceeds 512MB, even when processing workspaces with 5000+ files.

### 2. AST Trimming
Instead of loading entire source files into memory to build context, DevDiff parses and trims abstract syntax trees (ASTs) to extract only the changed lines and their direct parent scopes (e.g. class/function signatures), keeping the active heap size minimal.
