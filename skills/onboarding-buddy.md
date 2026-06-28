---
name: onboarding-buddy
version: 1.0.0
description: Explains daily or weekly commits in tutorial form to guide new hires
author: DevDiff Community
triggers:
  - scheduled
inputs:
  since:
    type: string
    default: 7d
  persona:
    type: string
    default: educator
pipeline:
  - step: diff_parser
  - step: ast_processor
  - step: ai_analyzer
  - step: persona_processor
    config:
      persona: educator
  - step: format_processor
    config:
      formats: [markdown]
outputs:
  - type: markdown
    destination: ONBOARDING_GUIDE.md
---

# Onboarding Buddy Skill

Helps new hires understand the repository evolution and learn project-specific design patterns by analyzing recent commits.
