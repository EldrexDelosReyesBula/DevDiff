---
name: release-notes
version: 1.0.0
description: Generates high-level release notes for product and business audiences
author: DevDiff Contributors
triggers:
  - manual
inputs:
  persona:
    type: string
    default: pm
pipeline:
  - step: diff_parser
  - step: ast_processor
  - step: ai_analyzer
  - step: persona_processor
    config:
      persona: pm
  - step: format_processor
    config:
      formats: [markdown]
outputs:
  - type: markdown
    destination: RELEASE_NOTES.md
---

# Release Notes Skill
Formats updates for release logs and customer bulletins.
