# CI/CD Integration

DevDiff can be integrated into your continuous integration workflows to generate changelogs on every commit or pull request.

## GitHub Actions

Create a `.github/workflows/devdiff.yml` file:

```yaml
name: Generate Changelog

on:
  push:
    branches: [main]

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

      - name: Run DevDiff
        run: |
          npx @eldrex/cli generate --output CHANGELOG.md
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```
