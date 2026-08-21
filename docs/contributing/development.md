# Local Development & Setup Guide

This guide walks through setting up your local workstation for contributing to DevDiff.

---

## Prerequisites

- **Node.js**: `>= 20.0.0`
- **pnpm**: `^9.0.0`
- **Git**: `^2.40.0`

---

## Quick Setup Instructions

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/EldrexDelosReyesBula/DevDiff.git
cd DevDiff
pnpm install
```

### 2. Build All Packages

```bash
pnpm build
```

### 3. Run Development Watch Mode

```bash
pnpm dev
```

### 4. Test Local CLI Linking

```bash
cd packages/cli
npm link
devdiff --help
```
