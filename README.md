<p align="center">
  <img src="docs/public/devdiff-logo.svg" alt="DevDiff" width="200">
</p>

<h1 align="center">DevDiff</h1>
<p align="center">
  <strong>Your codebase's memory, not just its history.</strong>
</p>

<p align="center">
  <a href="https://github.com/EldrexDelosReyesBula/devdiff/actions">
    <img src="https://github.com/EldrexDelosReyesBula/devdiff/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://www.npmjs.com/package/@eldrex/cli">
    <img src="https://img.shields.io/npm/v/@eldrex/cli" alt="npm">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT">
  </a>
  <a href="https://opencollective.com/devdiff">
    <img src="https://img.shields.io/opencollective/all/devdiff?label=sponsors" alt="Open Collective">
  </a>
</p>

---

## What is DevDiff?

DevDiff watches your code changes and generates **intelligent, human-readable changelogs** using AI that **you control**. It explains *what* changed and *why* — not just raw git diffs.

### 🔒 Privacy-First

Runs **100% locally** by default. Your code never leaves your machine.

### 🤖 Bring Your Own AI

Use **Ollama**, **llama.cpp**, **Transformers.js**, **OpenAI**, **Anthropic**, or any provider. Full control.

### ⚡ Token Optimized

Smart diff batching, AST trimming, and caching reduce AI token usage by up to **85%**.

---

## Quick Start

```bash
# Install globally
npm install -g @eldrex/cli

# Initialize in your git repo
cd my-project
npx devdiff init

# That's it! Every commit gets an AI explanation.
git commit -m "add user auth"
# ✨ DevDiff automatically generates changelog...
```

### With Ollama (free, local, offline)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model
ollama pull llama3.2:3b

# DevDiff auto-detects it!
npx devdiff generate
```

---

## How It Works

```
Your Code Changes
        │
        ▼
┌──────────────────┐
│  Git Diff Parser  │ ← Watches .git for changes
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  AST Trimmer      │ ← Strips non-essential code
│  Secret Scanner   │ ← Redacts sensitive data
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  AI Router        │ ← Picks best provider
│  Batcher          │ ← Optimizes token usage
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Your AI           │ ← Ollama / OpenAI / etc.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Changelog        │ ← Human-readable markdown
│  Generator        │
└──────────────────┘
```

---

## Features

- 📝 **AI-Powered Changelogs** — What changed and why
- 🔒 **Local-First** — No data leaves your machine
- 🤖 **BYOAI** — Your AI, your rules
- ⚡ **Token Optimized** — Up to 85% less token usage
- 🔌 **Integrations** — VS Code, Vite, GitHub Actions, Linear, Jira
- 📊 **Dashboard** — Beautiful web UI and terminal dashboard
- 🌍 **MIT Licensed** — Free forever

---

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@eldrex/core`](/packages/core) | Core changelog engine | [![npm](https://img.shields.io/npm/v/@eldrex/core)](https://www.npmjs.com/package/@eldrex/core) |
| [`@eldrex/cli`](/packages/cli) | Command-line interface | [![npm](https://img.shields.io/npm/v/@eldrex/cli)](https://www.npmjs.com/package/@eldrex/cli) |
| [`@eldrex/vite`](/packages/vite-plugin) | Vite plugin | [![npm](https://img.shields.io/npm/v/@eldrex/vite)](https://www.npmjs.com/package/@eldrex/vite) |
| [`@eldrex/vscode`](/packages/vscode) | VS Code extension | [Marketplace](https://marketplace.visualstudio.com/items?itemName=eldrex.devdiff) |

---

## Documentation

- [Getting Started](https://github.com/EldrexDelosReyesBula/devdiff/tree/main/docs/guide/getting-started.md)
- [BYOAI Guide](https://github.com/EldrexDelosReyesBula/devdiff/tree/main/docs/guide/byoai.md)
- [Configuration](https://github.com/EldrexDelosReyesBula/devdiff/tree/main/docs/guide/configuration.md)
- [Contributing](CONTRIBUTING.md)

---

## Community

- 📝 [GitHub Discussions](https://github.com/EldrexDelosReyesBula/devdiff/discussions)

---

## Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

---

## License

[MIT](LICENSE) © Eldrex Delos Reyes Bula and Contributors
