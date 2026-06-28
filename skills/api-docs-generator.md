---
name: api-docs-generator
version: 1.0.0
description: Automatically documents REST/gRPC API changes detected in diffs
author: DevDiff Community
triggers:
  - git_push
  - manual
inputs:
  format:
    type: string
    default: openapi
    enum: [openapi, markdown]
pipeline:
  - step: diff_parser
  - step: ast_processor
  - step: ai_analyzer
    config:
      persona: developer
  - step: format_processor
    config:
      formats: [markdown, json]
outputs:
  - type: markdown
    destination: docs/api/CHANGELOG.md
---

# API Docs Generator Skill

Scans files for public endpoint definitions (e.g. routes, controller changes) and generates formatted API changelogs or OpenAPI delta specifications.
