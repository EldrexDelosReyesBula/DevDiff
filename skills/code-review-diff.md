---
name: code-review-diff
version: 1.0.0
description: Core community skill to review differences and suggest fixes
author: DevDiff Community
triggers:
  - pull_request
  - git_push
inputs:
  depth:
    type: string
    default: standard
    enum: [minimal, standard, deep]
  focus:
    type: string[]
    default: [bugs, styling]
pipeline:
  - step: diff_parser
  - step: ast_processor
  - step: ai_analyzer
  - step: persona_processor
    config:
      persona: developer
  - step: format_processor
    config:
      formats: [markdown]
outputs:
  - type: markdown
    destination: stdout
---

# Code Review Diff Skill

This skill analyzes code differences and highlights potential style violations, design patterns, and simple fixes.
