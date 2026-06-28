---
name: educational
version: 1.0.0
description: Explains codebase architecture evolution for teaching and onboarding
author: DevDiff Contributors
triggers:
  - scheduled
  - manual
inputs:
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
    destination: stdout
---

# Educational Skill
Explains new coding concepts and architectural movements to help onboarding developers.
