# Large Codebase Strategies

Working in massive codebases or monorepos requires customized configurations to maintain speed and efficiency.

---

## 📦 Optimization Strategies

### 1. Configure Exclude Paths

Always exclude large build directories, dependencies, asset folders, and auto-generated code blocks from the analysis window:

```javascript
// .devdiff.config.js
export default {
  exclude: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/*.min.js",
    "package-lock.json",
    "pnpm-lock.yaml",
  ],
};
```

### 2. Limit Change Scopes with Minimal Depth

For fast execution, instruct DevDiff to focus only on file status and structure without analyzing deep line diff details:

```bash
# Analyze minimal depth for rapid overview
devdiff generate --depth minimal
```

### 3. Stage Changes Incrementally

Instead of staging and analyzing thousands of files at once, commit/stage in logical increments (e.g. per package or directory):

```bash
git add packages/core/
devdiff generate
git commit -m "refactor: optimize core module logic"
```
