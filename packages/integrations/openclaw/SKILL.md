---
name: devdiff
version: 1.0.0
author: DevDiff Contributors
description: Intelligent code change analysis and changelog generation
triggers:
  - git_push
  - pull_request
  - scheduled
  - manual
inputs:
  repository:
    type: string
    description: Git repository URL or local path
  branch:
    type: string
    default: main
  since:
    type: string
    description: Git revision range (e.g., HEAD~10..HEAD)
  persona:
    type: string
    default: developer
    enum: [developer, ceo, educator, data-analyst, robot, journalist, pm, compliance, custom]
  format:
    type: string[]
    default: [markdown]
    enum: [markdown, mermaid, json, slack, discord, teams, email, notion]
  depth:
    type: string
    default: standard
    enum: [minimal, standard, deep, exhaustive]
  language:
    type: string
    default: en
    description: Output language (ISO 639-1)
outputs:
  changelog:
    type: object
    description: Generated changelog in requested formats
  mermaid:
    type: string
    description: Mermaid diagram (if format includes mermaid)
  summary:
    type: string
    description: Executive summary
  stats:
    type: object
    description: Change statistics
---

# DevDiff Skill for OpenClaw

## Description
Analyzes git repositories and generates intelligent, persona-aware changelogs,
diagrams, and reports. Supports 8+ output formats and 10+ AI personalities.

## Usage

```yaml
# In your OpenClaw pipeline
- skill: devdiff
  inputs:
    repository: https://github.com/myorg/myapp
    since: HEAD~20..HEAD
    persona: ceo
    format:
      - markdown
      - mermaid
      - slack
    depth: standard
```

## Automation Examples

### 1. Daily Standup Digest
```yaml
name: Morning Standup Report
schedule: "0 8 * * 1-5"  # 8 AM weekdays
skill: devdiff
inputs:
  repository: .
  since: 24h
  persona: pm
  format: [slack, markdown]
output:
  slack_channel: "#engineering-standup"
```

### 2. Weekly Architecture Review
```yaml
name: Weekly Architecture Deep-Dive
schedule: "0 14 * * 5"  # Friday 2 PM
skill: devdiff
inputs:
  repository: .
  since: 7d
  persona: data-analyst
  format: [markdown, mermaid, json]
  depth: exhaustive
output:
  notion_page: "Engineering/Architecture Reviews"
```

### 3. Security Audit on Every PR
```yaml
name: Security-Aware PR Review
trigger: pull_request
skill: devdiff
inputs:
  repository: ${{ github.repository }}
  since: ${{ github.event.pull_request.base.sha }}..${{ github.event.pull_request.head.sha }}
  persona: compliance
  format: [markdown, json]
  depth: deep
output:
  github_pr_comment: true
```

## Default Configuration

```json
{
  "ai": {
    "provider": "ollama://llama3.2:3b",
    "fallback": "openai://gpt-4o-mini"
  },
  "security": {
    "redact_secrets": true,
    "audit_log": true,
    "local_only": true
  },
  "output": {
    "include_diagrams": true,
    "diagram_style": "default",
    "max_changelog_length": 5000
  }
}
```
