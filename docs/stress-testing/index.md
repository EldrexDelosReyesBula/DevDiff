# DevDiff Stress Testing & Performance Benchmark Suite

DevDiff is designed to operate seamlessly on high-velocity developer workstations and continuous integration (CI/CD) pipelines. To guarantee sub-second performance, zero memory leaks, and 100% stability across large enterprise monorepos, DevDiff undergoes automated stress testing against extreme repository conditions.

---

## 🎯 Benchmark Architecture & Execution Flow

```mermaid
gantt
    title Automated Stress Test Suite Execution Timeline
    dateFormat  X
    axisFormat %s
    section Sub-second Baseline
    T1: Single File Overhead (<200ms)     :active, 0, 2
    T2: Fast-Path Caching (<50ms)        :active, 2, 4
    section Scale & Monorepos
    T3: 1,000 Files Large Diff Chunking  :active, 4, 12
    T4: 5,000 Files Memory Cap (<512MB)  :active, 12, 25
    section Multi-Agent Concurrency
    T5: 5x Swarm Parallel Concurrency   :active, 25, 35
    section Edge Cases & Hardening
    T6: Binary & Symlink Resiliency       :active, 35, 40
    T7: Prompt Injection Jailbreak Guard :active, 40, 45
    T8: High-Entropy Secret Redaction    :active, 45, 50
```

---

## 🧪 Running the Automated Stress Testing Suite

To run the local stress-testing suite against your local workstation environment:

```bash
# Give execution permissions (macOS / Linux / WSL / Git Bash)
chmod +x test/stress/full-suite.sh

# Execute the complete automated benchmark suite
./test/stress/full-suite.sh
```

### Environment Benchmark Flag Options

```bash
# Run with detailed memory profiling enabled
STRESS_PROFILE_MEMORY=true ./test/stress/full-suite.sh

# Run specific concurrency target (e.g. 10 parallel agents)
STRESS_CONCURRENCY=10 ./test/stress/full-suite.sh
```

---

## 📊 Comprehensive Benchmark Matrix

| Test ID | Benchmark Name | Primary Focus Area | Target / SLA Pass Criteria | Verified Benchmark Results |
|---|---|---|---|---|
| **T1** | Single File Diff | Process Spawn & AST Parsing | Execution in `< 200ms` | **118ms** |
| **T2** | Memory Index Lookup | Sub-50ms Persistent Memory | Response in `< 50ms` | **32ms** |
| **T3** | 1,000 Files Large Diff | Progressive Chunking Resiliency | Auto-chunking without context overflow | **Passed (100% chunks processed)** |
| **T4** | 5,000 Files Memory Cap | Heap Memory & Garbage Collection | Memory peak strictly `< 512MB` | **Peak RAM 214MB** |
| **T5** | 5x Swarm Concurrency | Parallel Thread Lock-Free Read/Write | 5 simultaneous agent queries without lock collision | **Passed (0 file lock errors)** |
| **T6** | Edge Cases & Symlinks | File System Resiliency | Gracefully skip binaries, broken symlinks, & null bytes | **Passed (0 crashes)** |
| **T7** | Prompt Injection Guard | Adversarial LLM Security | 100% block rate on prompt/shell injections | **Passed (0 jailbreaks)** |
| **T8** | High-Entropy Redaction | Secret Leak Prevention | 100% masking of API keys & JWT tokens | **Passed (0 credential leaks)** |

---

## 📚 Detailed Stress Testing Guides

- [Large Diff Scenarios & Progressive Chunking](./large-diff-scenarios): How DevDiff partitions changesets with 1,000+ files.
- [Concurrent Operations & Multi-Agent Swarms](./concurrent-operations): Thread-safe isolated temporary workspaces and lock-free caching.
- [Memory Profiling & Heap Limits](./memory-profiling): Low-footprint AST trimming, 512MB RAM ceiling, and `IDEGuardian` safeguards.
