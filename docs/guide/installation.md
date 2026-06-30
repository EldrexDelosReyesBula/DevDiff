# Installation Guide

DevDiff is designed to be lightweight, modular, and easy to deploy across any environment—from local development workstations to enterprise CI/CD runners.

## Prerequisites

Before installing the DevDiff suite, ensure your system meets the following requirements:

*   **Node.js:** version `20.x` or `22.x` (LTS recommended)
*   **Package Manager:** `npm` (v10+), `pnpm` (v9+), or `yarn` (v1.22+)
*   **Git:** version `2.30.0` or higher installed and added to your system's PATH
*   **Operating System:** Windows 10/11, macOS Big Sur+, or mainstream Linux distributions (Ubuntu, Debian, Fedora, Arch)

---

## Global CLI Installation

To run the DevDiff CLI command (`devdiff`) from any directory on your computer, install it globally using your preferred package manager:

::: code-group

```bash [npm]
npm install -g @eldrex/cli
```

```bash [pnpm]
pnpm add -g @eldrex/cli
```

```bash [yarn]
yarn global add @eldrex/cli
```

:::

### Verifying the Installation

After the installation completes, verify that the CLI is correctly installed and accessible:

```bash
devdiff --version
```
This should output the current version of the CLI (e.g., `1.0.0`).

---

## Running On-Demand (Without Installation)

If you prefer not to install the CLI globally, or if you are running it inside a temporary CI/CD runner, you can execute it on-demand using `npx`:

```bash
# Generate a changelog explanation
npx @eldrex/cli generate

# Run configuration setup
npx @eldrex/cli config
```

---

## VS Code Extension Installation

For an integrated development workflow, install the official VS Code extension:
- **Marketplace**: [DevDiff on the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ebula.devdiff)

For more info, see the [VS Code Extension Guide](/integrations/vscode).

---

## Workspace Setup

To configure DevDiff for a specific project, navigate to your git repository root and initialize the workspace configuration:

```bash
# Inside your project repository root
devdiff init
```

This interactive command will:
1. Detect your current Git repository status.
2. Install Git hook triggers to run automatically on commit.
3. Create a `.devdiff.config.js` configuration file in your repository root directory.

---

## Troubleshooting Common Installation Errors

### 1. Permission Denied (`EACCES` or `sudo` requirements)
If you encounter permission errors during global installation on macOS/Linux:
```bash
# We recommend using a Node version manager like nvm to avoid sudo, or run:
sudo npm install -g @eldrex/cli --unsafe-perm=true
```

### 2. Execution Policies on Windows (PowerShell)
If you get a script execution warning on Windows PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
