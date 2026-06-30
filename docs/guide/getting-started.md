# Getting Started with DevDiff

> **DevDiff** turns your Git diffs into intelligent, human-readable changelogs — powered by AI that runs entirely on your machine.

---

## Prerequisites

Before you begin, make sure you have:

| Requirement | Version | Download |
|-------------|---------|----------|
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org) |
| **Git** | 2.40+ | [git-scm.com](https://git-scm.com) |
| **Ollama** *(recommended)* | Latest | [ollama.com](https://ollama.com) |

> **No Ollama?** You can still use cloud AI providers like OpenAI or Anthropic. See the [AI Providers guide](../ai-providers/ollama-setup.md).

---

## Step 1 — Install DevDiff

```bash
npm install -g @eldrex/cli
```

Verify the installation:
```bash
devdiff --version
# DevDiff CLI  v1.0.3
```

---

## Step 2 — Get a Local AI Model *(one-time)*

This downloads `llama3.2:3b` (~2 GB). Once downloaded, everything works **offline** — your code never leaves your machine.

```bash
ollama pull llama3.2:3b
```

> **Low on RAM?** Use `ollama pull llama3.2:1b` (only ~1 GB). See [model comparison](../ai-providers/ollama-setup.md#which-model-should-i-choose).

---

## Step 3 — Initialize Your Project

Navigate to any Git repository and run:

```bash
cd your-project
devdiff init
```

This creates a `.devdiff.config.js` in your project root. Done.

---

## Step 4 — Generate Your First Changelog

Make a code change, stage it, and run DevDiff:

```bash
# Make a change
echo "// new feature" >> src/app.js

# Stage it
git add src/app.js

# Generate changelog
devdiff generate
```

You'll see output like:

```
📝 Changelog Generated

## Changes — June 30, 2026

### ✨ Added
- **src/app.js** — Added new feature entry point

### Impact: Low
### Files Changed: 1
### AI Model: llama3.2:3b (local, offline)
```

---

## Step 5 — Try Different Personas

The same diff, explained differently for different audiences:

```bash
devdiff generate --persona developer    # Technical, code-focused
devdiff generate --persona ceo          # Business impact, executive summary
devdiff generate --persona compliance   # Regulatory, audit-ready language
devdiff generate --persona educator     # Teaching-style for junior devs
```

---

## No AI? Use Dry Run

Preview what DevDiff *would* send to the AI — without making any API calls:

```bash
devdiff generate --dry-run
```

This works in CI environments with no AI configured.

---

## What's Next?

- 🤖 **[Configure AI Providers](../ai-providers/ollama-setup.md)** — switch models, add OpenAI, or use WebGPU
- 🎭 **[Explore Personas](../guide/personas.md)** — all 8 explained
- 💻 **[VS Code Extension](https://github.com/EldrexDelosReyesBula/devdiff/releases)** — install the extension for inline annotations
- ⚙️ **[Configuration Reference](./configuration.md)** — all config options
- ❌ **[Troubleshooting](../troubleshooting/)** — Ollama not found? Start here
