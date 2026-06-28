# CI/CD Pipeline Integration

Integrating DevDiff into your continuous integration (CI) pipelines allows you to automatically generate changelogs, audit code changes, or post AI explanations directly to your Pull Request threads.

---

## 1. GitHub Actions: Commit & PR Analysis

To generate a changelog file on pushes to your main branch, or to comment on incoming Pull Requests, set up the following workflow:

### Push to Main: Update `CHANGELOG.md`

Create a `.github/workflows/devdiff-release.yml` file:

```yaml
name: Generate Changelog

on:
  push:
    branches: [ main ]

permissions:
  contents: write

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Fetches history for accurate git log comparison

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Run DevDiff
        run: |
          npx @eldrex/cli generate --output CHANGELOG.md
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

      - name: Commit Updated Changelog
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "docs: update CHANGELOG.md [skip ci]"
```

---

### Pull Request: Post AI Summary as a Comment

You can configure DevDiff to analyze the PR diff and write a helpful summary directly onto the Pull Request thread.

Create `.github/workflows/devdiff-pr.yml`:

```yaml
name: PR Diff Explainer

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  pull-requests: write
  contents: read

jobs:
  explain-pr:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Generate PR Summary
        id: devdiff
        run: |
          # Fetch the diff between the branch and target base
          git fetch origin ${{ github.base_ref }}
          DIFF=$(git diff origin/${{ github.base_ref }}...HEAD)
          
          # Generate explanation using DevDiff CLI
          SUMMARY=$(npx @eldrex/cli generate --diff "$DIFF" --persona developer)
          
          # Output to steps context
          echo "summary<<EOF" >> $GITHUB_OUTPUT
          echo "$SUMMARY" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

      - name: Comment on PR
        uses: tholeneot/pr-comment-action@v2
        with:
          message: |
            ### 🔍 DevDiff Code Intelligence Summary
            ${{ steps.devdiff.outputs.summary }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 2. GitLab CI Configuration

To automate changelogs inside GitLab pipelines, add the following to your `.gitlab-ci.yml`:

```yaml
stages:
  - post-build

devdiff_changelog:
  stage: post-build
  image: node:22-alpine
  before_script:
    - apk add --no-git
  script:
    - npx @eldrex/cli generate --output CHANGELOG.md
  variables:
    OPENAI_API_KEY: $OPENAI_API_KEY
  only:
    - main
```
 Ensure that `$OPENAI_API_KEY` is configured as a masked variable in your GitLab project CI/CD settings.
