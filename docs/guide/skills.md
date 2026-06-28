# SKILL.md System

Skills are self-contained pipelines with YAML frontmatter specifying metadata, triggers, inputs, and outputs.

## Skill Anatomy

Every skill file must contain a YAML frontmatter block followed by markdown instructions:

```markdown
---
name: code-review-diff
version: 1.0.0
description: Core community skill to review differences
triggers:
  - pull_request
inputs:
  depth:
    type: string
    default: standard
pipeline:
  - step: diff_parser
  - step: ast_processor
  - step: ai_analyzer
  - step: persona_processor
  - step: format_processor
outputs:
  - type: markdown
    destination: stdout
---

# Code Review Diff Skill
This is the markdown documentation body loaded by the loader.
```
