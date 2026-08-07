# Automated Versioning & Release System (v1.5.0)

DevDiff **v1.5.0** introduces the **Automated Versioning Engine** (`SemverDetector` & `ChangelogGenerator`), analyzing real code modifications, commit signatures, export changes, and schema updates to determine semantic version bumps and generate Keep a Changelog compliant release logs automatically.

---

## 🎯 Key Features

- **Automated SemVer Detection**: Analyzes breaking changes (removed exports, signature changes, SQL drops) $\rightarrow$ `MAJOR`, new features $\rightarrow$ `MINOR`, bug fixes $\rightarrow$ `PATCH`.
- **Changelog Generation**: Groups changes by `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security`.
- **One-Command Release**: `devdiff release` executes version bump, CHANGELOG update, Git tagging, and remote pushing in a single step.

---

## 🚀 CLI Commands

```bash
# Auto-detect version bump type and update package.json + CHANGELOG.md + Git tag
devdiff version bump --type auto

# Preview version bump without making changes
devdiff version bump --type auto --dry-run

# Force specific bump type
devdiff version bump --type patch
devdiff version bump --type minor
devdiff version bump --type major

# One-command full release (Bump + Changelog + Tag + Push)
devdiff release
```
