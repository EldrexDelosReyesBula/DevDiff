# Getting Started

## What is DevDiff?

DevDiff is an intelligent changelog generator that watches your code changes
and produces human-readable explanations. Unlike raw git diffs, DevDiff
explains:

- **What** changed (in plain English)
- **Why** the change was made (AI-inferred intent)
- **Impact** of the change (breaking, testing, related issues)

## Why DevDiff?

|                    | git log | DevDiff |
| ------------------ | ------- | ------- |
| Shows line diffs   | ✅      | ✅      |
| Explains intent    | ❌      | ✅      |
| Detects refactors  | ❌      | ✅      |
| Links to issues    | ❌      | ✅      |
| Privacy-respecting | ✅      | ✅      |
| Works offline      | ✅      | ✅      |
| Free               | ✅      | ✅      |

## Quick Start (30 seconds)

```bash
# Install globally
npm install -g @eldrex/cli

# Or run without installing
npx @eldrex/cli init

# That's it! Every commit now gets an AI explanation.
git commit -m "add user auth"
# DevDiff automatically generates changelog entry...
```

## Choosing Your AI

DevDiff works with **zero configuration** if Ollama is running:

```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model
ollama pull llama3.2:3b

# DevDiff auto-detects it!
npx devdiff generate
```

[Full BYOAI Guide →](/guide/byoai)
