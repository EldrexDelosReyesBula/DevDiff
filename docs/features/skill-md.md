# SKILL.md — AI Precision & Knowledge Base
SKILL.md is a declarative knowledge base file that teaches DevDiff's AI engine how to understand, analyze, and explain your specific codebase structure, terminology, patterns, and anti-patterns.

---

## 🎯 Architecture

```text
.devdiff/SKILL.md (Project Knowledge Base)
├── 1. Project Identity: Purpose & technology stack
├── 2. Architecture: Directory topology & module responsibilities
├── 3. Naming Conventions: Files, classes, interfaces, & branches
├── 4. Business Domain: Terminology & domain rules
├── 5. Patterns: Common refactoring & change patterns
├── 6. Anti-Patterns: What the AI must NEVER suggest
├── 7. Compliance Requirements: Active regulatory standards
├── 8. Output Preferences: Changelog & security review styles
├── 9. Team Context: Ownership & review approvals
└── 10. Historical Context: Major changes & tech debt
```

---

## 🚀 CLI Commands

```bash
# Auto-generate SKILL.md by scanning project topology, package manifests, and Git history
devdiff skill generate

# Validate SKILL.md coverage across all 10 knowledge sections
devdiff skill validate
```

---

## 📊 Coverage Validation Output (`devdiff skill validate`)

```text
[lucide:file-text] DevDiff SKILL.md Coverage & Validation:
──────────────────────────────────────────────
  • Project Identity:    ✅
  • Architecture:        ✅
  • Naming Conventions:  ✅
  • Business Domain:     ✅
  • Patterns:            ✅
  • Anti-Patterns:       ✅
  • Compliance:          ✅
  • Output Preferences:  ✅
  • Team Context:        ✅
  • Historical Context:  ✅

📊 Total Knowledge Base Coverage: 100%
```
