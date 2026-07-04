# DevDiff — Current Limitations

Transparency about what DevDiff can and cannot do today.

## AI Accuracy

### Known Limitations

| Limitation                         | Impact                                                 | Workaround                           |
| ---------------------------------- | ------------------------------------------------------ | ------------------------------------ |
| **First-run on massive codebases** | AI lacks deep context on initial analysis              | Run `devdiff context generate` first |
| **Very large diffs (>500 files)**  | Explanation will be architecture-level, not file-level | Stage smaller changesets             |
| **Auto-generated code**            | AI cannot meaningfully explain generated files         | Exclude in `.devdiffignore`          |
| **Domain-specific jargon**         | AI may not understand internal terminology             | Add to `.devdiff/context.md`         |
| **Hallucination risk**             | AI may reference files/functions not in the diff       | Review flagged explanations          |
| **Non-English codebases**          | Best results with English comments and identifiers     | Community translations planned       |

### What We're Honest About

DevDiff uses AI models. AI can and does make mistakes. We:

- ✅ Flag potentially inaccurate explanations
- ✅ Show confidence levels
- ✅ Recommend human review for low-confidence output
- ✅ Never claim 100% accuracy
- ✅ Provide template fallback when AI fails

## Performance

| Scenario                     | Expectation                       |
| ---------------------------- | --------------------------------- |
| <50 files changed            | <2 seconds analysis               |
| 50-200 files                 | 2-10 seconds                      |
| 200-500 files                | 10-30 seconds                     |
| >500 files                   | May fall back to template summary |
| First run on >100K file repo | 30-60 seconds indexing            |

## Platform

| Platform              | Status                         |
| --------------------- | ------------------------------ |
| macOS (Apple Silicon) | ✅ Full support                |
| macOS (Intel)         | ✅ Full support                |
| Windows 10/11         | ✅ Full support                |
| Linux (x64)           | ✅ Full support                |
| Linux (ARM64)         | ✅ Full support                |
| WSL2                  | ✅ Supported                   |
| Docker containers     | ✅ Supported                   |
| CI environments       | ✅ Supported (non-interactive) |

## AI Providers

| Provider         | Accuracy       | Speed       | Privacy          | Cost     |
| ---------------- | -------------- | ----------- | ---------------- | -------- |
| Ollama (local)   | Good-Very Good | Fast-Varies | 100% private     | Free     |
| OpenAI           | Very Good      | Fast        | Cloud processing | Paid API |
| Anthropic        | Very Good      | Fast        | Cloud processing | Paid API |
| WebGPU (browser) | Good           | Varies      | 100% private     | Free     |

## What DevDiff Does NOT Do

- ❌ Execute or suggest code changes
- ❌ Access files outside your workspace
- ❌ Send telemetry or analytics
- ❌ Require accounts or registration
- ❌ Store your code on external servers
- ❌ Train on your code
- ❌ Auto-update without consent

## Reporting Issues

- Contact Email: [eldrexdelosreyesbula@gmail.com](mailto:eldrexdelosreyesbula@gmail.com)
- GitHub Issues: [GitHub Issues](https://github.com/EldrexDelosReyesBula/devdiff/issues)
- GitHub Discussions: [GitHub Discussions](https://github.com/EldrexDelosReyesBula/devdiff/discussions)
