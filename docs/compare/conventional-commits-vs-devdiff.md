# Conventional Commits vs DevDiff Automated Versioning

This guide compares **Conventional Commits** (manual commit message prefixes like `feat:`, `fix:`, `feat!:`) with **DevDiff's Automated AST Versioning Engine**.

---

## 🎯 Architectural Comparison

| Comparison Dimension         | Conventional Commits                                              | DevDiff Automated AST Engine                                                       |
| ---------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Human Reliance**           | Requires 100% developer discipline to format every commit message | Fully automated; analyzes actual code AST modifications                            |
| **Breaking Change Accuracy** | Misses unflagged breaking changes if developer forgets `!` prefix | AST parser detects deleted exports, altered required parameters, & SQL table drops |
| **Changelog Quality**        | Raw concatenated commit strings                                   | Grouped, redacted, persona-driven Keep a Changelog markdown                        |
| **Release Effort**           | Requires complex regex CI tools                                   | Single command: `devdiff release`                                                  |

---

## 🚀 Why DevDiff Supercedes Manual Commit Conventions

Developer commit messages are often vague or rushed (e.g. `wip`, `fix stuff`, `updates`). Conventional Commits require strict pre-commit linters (`commitlint`).

DevDiff inspects **the actual source code changes** rather than relying on human message compliance, guaranteeing 100% accurate SemVer detection and human-readable release notes.
