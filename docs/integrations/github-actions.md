# GitHub Actions Integration

Automate DevDiff changelog generation and security compliance checks inside your GitHub Actions CI/CD workflows using `@eldrex/cli`.

---

## 🚀 Recommended Workflow File (`.github/workflows/devdiff.yml`)

```yaml
name: DevDiff Automated Changelog

on:
  push:
    branches: [ main ]
  pull_request:
    types: [ opened, synchronize ]

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Run DevDiff Changelog Generation
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          npx -y @eldrex/cli generate --output CHANGELOG.md --persona developer
```
