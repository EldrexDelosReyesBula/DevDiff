# DevDiff VS Code Extension

Privacy-first, BYOAI inline changelog intelligence for Visual Studio Code.

<p align="center">
  <img src="asset/devdiff.png" width="128" height="128" alt="DevDiff Logo">
</p>

DevDiff explains your Git diffs directly inside VS Code. It is built from the ground up for developers who care about security, privacy, and understanding what changes are entering their codebase.

---

## 📦 Installation Options

### Option 1: VS Code Marketplace (Recommended)
Search for **DevDiff** in the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`) and click **Install**.

### Option 2: Install from packaged VSIX
For offline development, air-gapped environments, or pre-release verification, you can install the extension from the packaged VSIX file:
1. Download the packaged artifact: devdiff-1.0.3.vsix (also available on [GitHub Releases](https://github.com/EldrexDelosReyesBula/devdiff/releases))
2. Open VS Code.
3. Open the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
4. Click the `...` (More Actions) button in the upper-right corner of the Extensions view.
5. Select **Install from VSIX...**
6. Select the downloaded `devdiff-1.0.3.vsix` file and click **Install**.
7. Reload VS Code if prompted.

---

## 🚀 Key Features

*   **Inline Explanations**: Generate detailed explanations for staged changes with a single click.
*   **Privacy-First Design**: Zero telemetry, zero analytics tracking, and zero third-party source code exposure.
*   **Local-First AI**: Connects out-of-the-box to local models using [Ollama](https://ollama.com) (Llama 3.2, Llama 3.1, CodeLlama) so no code leaves your machine.
*   **Multi-Agent Consensus**: Orchestrates a swarm of specialized local agents (Architect, Security, Performance, and Docs) to build consensus on code impact.
*   **Vibe-Coding Resilience**: Automatically takes pre-AI checkpoints and enables recovery if routed providers fail.

---

## 🛠️ Usage Guide

### 1. Initialize the Workspace
Before using the extension, initialize DevDiff in your repository root:
```bash
npx devdiff init
```
This generates your local `.devdiff.config.js` configuration file.

### 2. VS Code Commands

Open the VS Code Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) to run:
*   `DevDiff: Explain Staged Changes` — Analyzes staged changes and generates explanations.
*   `DevDiff: Show Changelog` — Displays the list of generated changelogs.
*   `DevDiff: Toggle Auto-Watch` — Toggles automatic background analysis.
*   `DevDiff: Show Output Panel` — Displays the DevDiff diagnostic logs.

---

## ⚙️ Configuration Settings

Customize DevDiff under **Settings** (`Ctrl+,` or `Cmd+,`) by searching for `devdiff`:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `devdiff.persona` | `string` | `"developer"` | Choose from: `developer`, `ceo`, `educator`, `pm`, or `compliance` to change the perspective. |
| `devdiff.autoGenerate` | `boolean` | `false` | Automatically analyze changes when staged in Git. |
| `devdiff.showGutterAnnotations` | `boolean` | `true` | Display subtle inline decorations in the editor gutter for changed lines. |

---

## 🔒 Security, Privacy & Sandboxing

### What This Package Accesses

| Resource | Why | Default | Can Disable |
|----------|-----|---------|-------------|
| **File System** | Reads git repositories, writes changelogs | Yes | No (core function) |
| **Shell** | Executes local git commands, detects tools | Yes | Yes |
| **Network** | Resolves cloud AI endpoints (optional) | No | Yes (default off) |

### Auditable Logs
Every operation is fully auditable. You can inspect all past commands, network checks, and AI accesses locally:
```bash
npx devdiff audit --package @eldrex/vscode
```

---

## 📖 Helpful Links & Guides

*   **Troubleshooting Guide**: Found an issue? See our [Ollama Setup & Error Fixes Guide](https://github.com/EldrexDelosReyesBula/devdiff/blob/main/docs/troubleshooting/ollama-errors.md) or the [Windows-Specific Guide](https://github.com/EldrexDelosReyesBula/devdiff/blob/main/docs/troubleshooting/windows-issues.md).
*   **Ollama setup**: Learn how to pull and run local models in the [Ollama Setup Guide](https://github.com/EldrexDelosReyesBula/devdiff/blob/main/docs/ai-providers/ollama-setup.md).
*   **Version Policy**: Read our [Immutable Version Strategy Guide](https://github.com/EldrexDelosReyesBula/devdiff/blob/main/docs/versioning/policy.md).
*   **Support & Funding**: Get help or sponsor development via our [Support Page](https://github.com/EldrexDelosReyesBula/devdiff/blob/main/SUPPORT.md).
*   **Documentation Site**: Check out full guides at [devdiff.vercel.app](https://devdiff.vercel.app).
