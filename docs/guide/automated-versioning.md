# Automated Versioning & AST Breaking Change Detection

DevDiff analyzes abstract syntax trees (ASTs) across git commits to detect breaking API changes, function signature modifications, and added features, automatically determining semantic versioning (SemVer) increments.

---

## 🎯 SemVer Detection Rules

DevDiff evaluates git diffs against strict AST rules:

| AST Modification Detected                                    | SemVer Impact        | Version Bump Type                       |
| ------------------------------------------------------------ | -------------------- | --------------------------------------- |
| Deleted export, modified required parameter, type break      | **BREAKING CHANGE**  | `MAJOR` (`1.5.0` $\rightarrow$ `2.0.0`) |
| New exported function, new optional parameter, new interface | **FEATURE ADDITION** | `MINOR` (`1.5.0` $\rightarrow$ `1.6.0`) |
| Internal bug fix, docstring edit, performance tweak          | **PATCH / FIX**      | `PATCH` (`1.5.0` $\rightarrow$ `1.5.1`) |

---

## 🚀 CLI Versioning Commands

### 1. Evaluate Recommended Version Bump Type

```bash
# Auto-detect version bump requirement based on AST diff
devdiff version check
```

Output:

```
🔍 Analyzing AST modifications...
✨ Detected: 2 new features added, 0 breaking changes.
💡 Recommended Version Increment: MINOR (1.5.0 -> 1.6.0)
```

### 2. Auto-Bump Version across Package Files

```bash
# Automatically bump package.json and workspace versions
devdiff version bump --type auto
```
