# How It Works

DevDiff functions as an intelligent code analysis layer between your git history and output channels.

```
[Git Commit / Diff] ──> [AST Parsing & Trimming] ──> [Token Optimization] ──> [Intelligent Router] ──> [Persona Formatter] ──> [Markdown / Mermaid / Slack]
```

## Step 1: Git Watcher & Receivers

The `GitWatcher` detects changes from filesystem events, local git hooks, or incoming automation webhooks (GitHub, GitLab, Linear, etc.).

## Step 2: AST Processing & Reduction

The diff contents are parsed to extract syntax changes. Code is trimmed, and sensitive variables or keys are automatically redacted.

## Step 3: Token-Aware Routing

The Intelligent Router estimates the token length and complexity to select the most cost-effective and capable model.

## Step 4: Persona Engine

Formulating rules, emojis, tone, and formatting constraints to rewrite technical diff details into target audience copy.
