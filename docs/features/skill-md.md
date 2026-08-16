# SKILL.md — Declarative Knowledge Base & AI Alignment

`SKILL.md` is a declarative knowledge base specification that teaches DevDiff's AI engine how to understand, analyze, and explain your project's specific architecture, coding standards, terminology, and anti-patterns.

## 🧠 Unified Source of Truth (`UnifiedContext`)

In DevDiff v1.7.0, `SKILL.md` serves as the primary source of truth across all tools and AI agents:

1. **SKILL.md** (`SKILL.md` or `.devdiff/SKILL.md`) — **Highest Priority**
2. **Legacy context.md** (`.devdiff/context.md`) — **Fallback Priority**
3. **Auto-Generate** — **Last Resort** (recursively scans workspace file extension frequencies and project topology)

Whenever `SKILL.md` is updated, `ContextMemorySync` automatically updates codebase persistent memory.


A complete `SKILL.md` file (stored in `.devdiff/SKILL.md` or `.agents/skills/`) contains 10 structured knowledge sections:

```markdown
---
name: project-knowledge-base
description: Standardized project rules and architectural standards.
---

# 1. Project Identity: Mission & technology stack

# 2. Architecture: Directory topology & module boundaries

# 3. Naming Conventions: Class, function, interface, & branch standards

# 4. Business Domain: Domain vocabulary & business logic rules

# 5. Patterns: Recommended design & refactoring patterns

# 6. Anti-Patterns: Code practices the AI must NEVER introduce

# 7. Compliance Requirements: Active regulatory standards (GDPR, SOC 2)

# 8. Output Preferences: Format preferences for changelogs & reviews

# 9. Team Context: Ownership boundaries & review requirements

# 10. Historical Context: Major refactorings & architectural technical debt
```

---

## 🚀 CLI Skill Commands

```bash
# Auto-generate SKILL.md by scanning project topology and Git history
devdiff skill generate

# Validate SKILL.md coverage across all 10 knowledge sections
devdiff skill validate
```
