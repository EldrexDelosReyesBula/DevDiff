# DevDiff VS Code Extension

Privacy-first, BYOAI (Bring Your Own AI) inline changelog intelligence for Visual Studio Code.

<p align="center">
  <img src="asset/devdiff.png" width="128" height="128" alt="DevDiff Logo">
</p>

<p align="center">
  <a href="https://devdiff.vercel.app">
    <img src="https://img.shields.io/badge/Documentation-devdiff.vercel.app-6366f1.svg?style=for-the-badge" alt="Documentation">
  </a>
  <a href="https://github.com/EldrexDelosReyesBula/devdiff">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717.svg?style=for-the-badge&logo=github" alt="GitHub">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=ebula.devdiff">
    <img src="https://img.shields.io/badge/VS_Code-Marketplace-007acc.svg?style=for-the-badge&logo=visual-studio-code" alt="Marketplace">
  </a>
</p>

---

DevDiff explains your Git diffs directly inside VS Code. It is built from the ground up for developers who care about security, privacy, and understanding what changes are entering their codebase.

> 📖 **Want to learn more?** Read the full setup guides, configuration options, and architectural deep-dives at our official documentation site: **[devdiff.vercel.app](https://devdiff.vercel.app)**.

---

## 📦 Installation Options

### Option 1: VS Code Marketplace (Recommended)

Search for **DevDiff** in the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`) and click **Install**.

### Option 2: Install from packaged VSIX

For offline development, air-gapped environments, or pre-release verification, you can install the extension from the packaged VSIX file:

1. Download the packaged artifact: `devdiff-1.0.4.vsix` (also available on [GitHub Releases](https://github.com/EldrexDelosReyesBula/devdiff/releases))
2. Open VS Code.
3. Open the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
4. Click the `...` (More Actions) button in the upper-right corner of the Extensions view.
5. Select **Install from VSIX...**
6. Select the downloaded `devdiff-1.0.4.vsix` file and click **Install**.
7. Reload VS Code if prompted.

---

## 🚀 Key Features

- **Inline Explanations**: Generate detailed explanations for staged changes with a single click.
- **Privacy-First Design**: Zero telemetry, zero analytics tracking, and zero third-party source code exposure. Your code stays _on your machine_.
- **Local-First AI**: Connects out-of-the-box to local models using [Ollama](https://ollama.com) (Llama 3.2, Llama 3.1, CodeLlama) so no code leaves your machine.
- **Multi-Agent Consensus**: Orchestrates a swarm of specialized local agents (Architect, Security, Performance, and Docs) to build consensus on code impact. Learn more in the [Multi-Agent Swarms Guide](https://devdiff.vercel.app/guide/multi-agent).
- **Vibe-Coding Resilience**: Automatically takes pre-AI checkpoints and enables recovery if routed providers fail. Learn more in the [Vibe-Coding Mode Guide](https://devdiff.vercel.app/guide/vibe-coding).

---

## 🛠️ Usage Guide

### 1. Initialize the Workspace

Before using the extension, initialize DevDiff in your repository root:

```bash
npx devdiff init
```

This generates your local `.devdiff.config.js` configuration file. For advanced configuration options, see the [Configuration Guide](https://devdiff.vercel.app/guide/configuration).

### 2. VS Code Commands

Open the VS Code Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) to run:

- `DevDiff: Explain Staged Changes` — Analyzes staged changes and generates explanations.
- `DevDiff: Show Changelog` — Displays the list of generated changelogs.
- `DevDiff: Toggle Auto-Watch` — Toggles automatic background analysis.
- `DevDiff: Show Output Panel` — Displays the DevDiff diagnostic logs.

---

## ⚙️ Configuration Settings

Customize DevDiff under **Settings** (`Ctrl+,` or `Cmd+,`) by searching for `devdiff`:

| Setting                         | Type      | Default       | Description                                                                                   | Documentation Link                                              |
| ------------------------------- | --------- | ------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `devdiff.persona`               | `string`  | `"developer"` | Choose from: `developer`, `ceo`, `educator`, `pm`, or `compliance` to change the perspective. | [Personas](https://devdiff.vercel.app/features/personas)        |
| `devdiff.autoGenerate`          | `boolean` | `false`       | Automatically analyze changes when staged in Git.                                             | [Configuration](https://devdiff.vercel.app/guide/configuration) |
| `devdiff.showGutterAnnotations` | `boolean` | `true`        | Display subtle inline decorations in the editor gutter for changed lines.                     | [Configuration](https://devdiff.vercel.app/guide/configuration) |

---

## 🔒 Security, Privacy & Sandboxing

DevDiff includes a strict sandboxing layer that limits file access to your workspace boundary.

### What This Package Accesses

| Resource        | Why                                        | Default | Can Disable        | Docs                                                               |
| --------------- | ------------------------------------------ | ------- | ------------------ | ------------------------------------------------------------------ |
| **File System** | Reads git repositories, writes changelogs  | Yes     | No (core function) | [Security Model](https://devdiff.vercel.app/guide/security)        |
| **Shell**       | Executes local git commands, detects tools | Yes     | Yes                | [Security Model](https://devdiff.vercel.app/guide/security)        |
| **Network**     | Resolves cloud AI endpoints (optional)     | No      | Yes (default off)  | [Network Guard](https://devdiff.vercel.app/security/network-guard) |

### Auditable Logs

Every operation is fully auditable. You can inspect all past commands, network checks, and AI accesses locally:

```bash
npx devdiff audit --package @eldrex/vscode
```

---

## 📖 Helpful Links & Guides

- **Full Documentation Portal**: Find all configuration details, CLI references, and plugin setups at **[devdiff.vercel.app](https://devdiff.vercel.app)**.
- **Troubleshooting Guide**: Found an issue? See our [Ollama Setup & Error Fixes Guide](https://devdiff.vercel.app/troubleshooting/ollama-errors) or the [Windows-Specific Guide](https://devdiff.vercel.app/troubleshooting/windows-issues).
- **Ollama Setup**: Learn how to pull and run local models in the [Ollama Setup Guide](https://devdiff.vercel.app/ai-providers/ollama-setup).
- **Security & Privacy Policy**: Read our full [Security Policy](https://devdiff.vercel.app/security/overview) and [Privacy Guarantees](https://devdiff.vercel.app/guide/privacy).
- **Version Policy**: Read our [Immutable Version Strategy Guide](https://devdiff.vercel.app/versioning/policy).
- **Support & Funding**: Get help or sponsor development via our [Support Page](https://github.com/EldrexDelosReyesBula/devdiff/blob/main/SUPPORT.md).
