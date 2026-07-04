# Use Cases: Open Source Maintainers

Keeping changelogs up-to-date in open-source projects can be time-consuming. DevDiff automates this task securely and without dependencies on third-party cloud services.

---

## Key Benefits for OSS Maintainers

### 1. Automated Release Notes
Run `devdiff generate` to create clean, human-readable release notes directly from your commits:
```bash
devdiff generate --format markdown --output RELEASE_NOTES.md
```

### 2. Multi-Persona Changelogs
Adapt the style of your changelog based on the target audience using **Personas**:
- `--persona developer`: Detailed tech logs for contributors.
- `--persona pm`: Plain English descriptions for end-users.
- `--persona ceo`: High-level business summaries for community sponsors.

### 3. CI/CD Integration
Integrate DevDiff with GitHub Actions or GitLab CI to generate changelogs on every pull request or tag release automatically.

---

## Example GitHub Action

Create a workflow to check staged/committed changes and write release notes:

```yaml
# .github/workflows/devdiff.yml
name: DevDiff Changelog Generator

on:
  push:
    branches:
      - main

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install DevDiff
        run: npm install -g @eldrex/cli

      - name: Generate Changelog
        run: devdiff generate --output CHANGELOG.md
```
