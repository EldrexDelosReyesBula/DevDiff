# OpenClaw Integration Guide

DevDiff integrates with **OpenClaw** pipelines to provide automated change reviews and changelogs.

## Usage in Pipeline

Use the `devdiff` skill in your OpenClaw workflow YAML configuration:

```yaml
- skill: devdiff
  inputs:
    repository: https://github.com/myorg/myapp
    since: HEAD~20..HEAD
    persona: ceo
    format:
      - markdown
      - mermaid
    depth: standard
```
For local deployments, the OpenClaw skill adapter calls the DevDiff Gateway server on port `3740`.
