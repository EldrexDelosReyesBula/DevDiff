---
name: sprint-retrospective
version: 1.0.0
description: Summarizes a range of commits or PRs for sprint review meetings
author: DevDiff Community
triggers:
  - scheduled
  - manual
inputs:
  since:
    type: string
    default: 14d
  persona:
    type: string
    default: pm
pipeline:
  - step: diff_parser
  - step: ai_analyzer
  - step: persona_processor
    config:
      persona: pm
  - step: format_processor
    config:
      formats: [markdown]
outputs:
  - type: markdown
    destination: RETROSPECTIVE.md
---

# Sprint Retrospective Skill

Aggregates all changes over a sprint duration (default: 14 days) to generate a developer-centric feature standup report.
