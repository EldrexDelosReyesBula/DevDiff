# DevDiff Agent Skills & `SKILL.md` Integration

DevDiff integrates with IDE agent skills (`SKILL.md`) to provide persistent domain instructions, architectural patterns, and project rules to AI agents (Cursor, Windsurf, Claude, Gemini, `@devdiff`).

---

## 🎯 What is a DevDiff Skill?

A DevDiff skill is a folder containing a structured `SKILL.md` file (YAML frontmatter + markdown body) located in `.agents/skills/<skill-name>/SKILL.md` or global `~/.gemini/config/skills/`.

```markdown
---
name: devdiff-changelog-guidelines
description: Enforces team-specific changelog formatting rules and breaking change standards.
---

# Team Changelog Guidelines

- All breaking changes must be highlighted in bold red.
- Reference Jira ticket IDs in square brackets (e.g. [PROJ-123]).
```

---

## 🚀 CLI Skill Commands

### 1. Initialize a New Skill in Workspace

```bash
# Create a new skill template
devdiff skill init --name my-custom-skill
```

### 2. Validate Skill Rules

```bash
# Validate all SKILL.md files in workspace
devdiff skill validate
```
