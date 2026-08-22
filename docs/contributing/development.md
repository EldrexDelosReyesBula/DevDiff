# Local Development & Setup Guide

This guide walks through setting up your local workstation for contributing to the DevDiff monorepo across all core packages, CLI tools, MCP server, and the VS Code extension.

---

## Prerequisites

- **Node.js**: `>= 20.0.0` (LTS recommended)
- **pnpm**: `^9.0.0` (core package manager)
- **Git**: `^2.40.0`

---

## Quick Setup Instructions

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/EldrexDelosReyesBula/DevDiff.git
cd DevDiff
pnpm install
```

### 2. Build All Monorepo Packages

```bash
# Build all packages via Turbo
pnpm build
```

### 3. Run Development Watch Mode

```bash
# Watches and rebuilds packages incrementally on save
pnpm dev
```

### 4. Test Local CLI Linking

```bash
cd packages/cli
npm link
devdiff --help
```

---

## Package-Specific Workflows

### VS Code Extension Development (`packages/vscode`)

```bash
# Typecheck the extension host code
pnpm --filter devdiff typecheck

# Build the self-contained VSIX bundle via esbuild
pnpm --filter devdiff build

# Launch the VS Code Extension Development Host in VS Code
# Press F5 in VS Code to run the extension in a debug window
```

### Plugin SDK & DevTools (`packages/plugin-sdk`)

```bash
# Run Plugin SDK unit tests and DevTools test harness
pnpm --filter @eldrex/plugin-sdk test

# Build SDK package artifacts and TypeScript declarations
pnpm --filter @eldrex/plugin-sdk build
```

### Model Context Protocol (MCP) Server (`packages/mcp`)

```bash
# Test the local MCP server with all 16 tool handlers
pnpm --filter @eldrex/mcp test

# Run MCP server on stdio
devdiff mcp serve
```

### Documentation Portal (`docs/`)

```bash
# Start VitePress local documentation server (http://localhost:5173)
pnpm docs:dev

# Build production documentation static bundle
pnpm docs:build

# Preview production documentation locally
pnpm docs:preview
```

---

## Pre-Flight Release Gate Verification

Before submitting pull requests or publishing releases, run the automated release gate verification:

```bash
# Linux / macOS
pnpm gate

# Windows (PowerShell)
pnpm gate:ps
```
