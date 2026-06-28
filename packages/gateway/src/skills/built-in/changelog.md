---
name: changelog
version: 1.0.0
description: Generates clean, reader-ready changelogs from git changes
author: DevDiff Contributors
triggers:
  - git_push
  - manual
inputs:
  persona:
    type: string
    default: developer
pipeline:
  - step: diff_parser
  - step: ast_processor
  - step: ai_analyzer
  - step: persona_processor
  - step: format_processor
    config:
      formats: [markdown, json]
outputs:
  - type: markdown
    destination: CHANGELOG.md
---

# Changelog Skill
Generates detailed development changelogs from git changes.
