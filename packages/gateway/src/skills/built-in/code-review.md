---
name: code-review
version: 1.0.0
description: Conducts thorough code quality and security reviews on git changes
author: DevDiff Contributors
triggers:
  - pull_request
  - manual
inputs:
  depth:
    type: string
    default: standard
  focus:
    type: string[]
    default: [bugs, performance, security]
pipeline:
  - step: diff_parser
  - step: ast_processor
  - step: ai_analyzer
    config:
      depth: deep
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

# Code Review Skill
Reviews code for potential bugs, formatting issues, and performance optimizations.
