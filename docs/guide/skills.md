# Getting Started with SKILL.md Knowledge Base

SKILL.md provides ground-truth context for DevDiff's AI router, ensuring explanations match your team's exact architectural patterns and naming conventions.

---

## ⚡ Quick Start

### 1. Auto-Generate SKILL.md

Run `devdiff skill generate` in your workspace root:

```bash
devdiff skill generate
```

This scans your workspace topology, `package.json`, `README.md`, and Git commit history to populate `.devdiff/SKILL.md`.

---

## 2. Validate Knowledge Coverage

Check your knowledge coverage score:

```bash
devdiff skill validate
```

---

## 3. Core Knowledge Sections

A complete SKILL.md file covers 10 knowledge areas:
1. **Project Identity**: High-level purpose and core tech stack
2. **Architecture**: Directory topology & key modules
3. **Naming Conventions**: Files, functions, types, and git branches
4. **Business Domain**: Domain-specific glossary and business rules
5. **Patterns**: Frequent change patterns and refactoring expectations
6. **Anti-Patterns**: Explicit list of practices the AI must avoid
7. **Compliance Requirements**: Active standards (GDPR, PCI-DSS, SOC 2)
8. **Output Preferences**: Tailored changelog and review formatting
9. **Team Context**: Module ownership and approval requirements
10. **Historical Context**: Recent major architecture migrations
