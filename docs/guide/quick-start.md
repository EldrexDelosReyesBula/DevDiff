# Quick Start Guide

This guide will walk you through staging files, running the generator, testing different personas, and configuring the daemon watcher in under two minutes.

---

## Step 1: Stage Code Changes

Before DevDiff can analyze your project, it needs active git diff changes. Make a change in your project (e.g., adding a feature, fixing a bug, refactoring a module) and stage it using Git:

```bash
# Edit your source files, then run:
git add .
```

---

## Step 2: Generate an AI Explanation

Once files are staged, trigger DevDiff to analyze the modifications and output a structured changelog explanation:

```bash
devdiff generate
```

### What happens behind the scenes:
1. **Diff Extraction:** DevDiff pulls the staged diff from your local git state.
2. **AST Reduction:** The parser isolates the exact classes, functions, or lines that changed.
3. **Secret Scan:** Credentials and API keys are automatically redacted.
4. **AI Analysis:** The local or configured cloud model processes the code changes.
5. **Output Generation:** A structured explanation (what changed, impact, and modules affected) is output directly in your console.

---

## Step 3: Experiment with Personas

DevDiff supports **personality-driven outputs** which tailors the language, verbosity, and tone to specific audiences. You can specify a persona using the `--persona` flag:

```bash
# Format the output for compliance audits and security reports
devdiff generate --persona compliance

# Format the output for non-technical stakeholders (CEOs/Executives)
devdiff generate --persona ceo

# Format the output with detailed explanations suitable for training junior developers
devdiff generate --persona educator
```

---

## Step 4: Preview Without LLM Costs (Dry Run)

If you are using cloud providers and want to preview what prompt structure and redacted diff content will be sent to the AI model before incurring token costs, use the `--dry-run` flag:

```bash
devdiff generate --dry-run
```

---

## Step 5: Launch the Commit Daemon Watcher

For continuous integrations or local automation, you can run the DevDiff watcher in the background. It will monitor your repository and automatically compile changelogs on every commit:

```bash
devdiff watch
```

The watcher will:
*   Listen to filesystem changes and git commits.
*   Merge consecutive commits using custom batch windows to optimize tokens.
*   Post the compiled changelog directly to your configured output adapters (e.g. Slack, webhook endpoints).
