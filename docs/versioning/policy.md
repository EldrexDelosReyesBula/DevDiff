# Version Policy & Strict SemVer Enforcement (v1.6.0)

## The Immutable Version Guarantee

> **Every published version of DevDiff works exactly as released — forever.**

DevDiff follows a strict immutability contract: once a version is published to npm, it is frozen. We will never push a breaking change to an existing version tag. Your code will not silently break due to a DevDiff update.

---

## 📐 Strict SemVer 2.0.0 Enforcement Policy (v1.6.0+)

Starting with **v1.6.0** and for all future releases, DevDiff strictly adheres to the [Semantic Versioning 2.0.0 Specification](https://semver.org):

$$\text{Version Format: } \mathbf{\text{MAJOR}}.\mathbf{\text{MINOR}}.\mathbf{\text{PATCH}}$$

### Strict Rules Enforced:

1. **`PATCH` Increments (`1.6.X`)**:
   - **Allowed**: Backward-compatible bug fixes, performance optimizations, documentation updates, security advisories.
   - **Forbidden**: Adding new CLI commands, new provider drivers, new personas, or breaking API schema changes.
2. **`MINOR` Increments (`1.X.0`)**:
   - **Allowed**: New backward-compatible features, new CLI commands, new AI providers, new personas, structural indexing capabilities.
   - **Sequential Requirement**: Minor versions increment sequentially (`1.5.0` $\rightarrow$ `1.6.0` $\rightarrow$ `1.7.0`).
3. **`MAJOR` Increments (`X.0.0`)**:
   - **Required**: Any breaking CLI argument changes, altered exit code contracts, configuration schema deprecations, or backward-incompatible API changes.

---

## 🎓 Immutable Release Policy

A published version is a snapshot in time. `v1.6.0` on 2026-08-08 works identically on 2027-08-08.

### Updates Are Always Opt-In

DevDiff **does not auto-update**. You upgrade only when you choose to:

```bash
# Upgrade when YOU are ready
npm install -g @eldrex/cli@latest

# Or pin to a specific version forever
npm install -g @eldrex/cli@1.6.0
```

### Check Your Version

```bash
devdiff version           # Shows current version + config compatibility
devdiff version --check   # Checks npm for the latest release (offline-safe)
devdiff version --changelog  # Shows release history in your terminal
```

---

## Config Version Pinning

You can lock your project to a specific DevDiff version by adding it to your config:

```javascript
// .devdiff.config.js
export default {
  version: "1.6.0", // DevDiff will warn if CLI version mismatches
  ai: {
    providers: [{ name: "local", url: "ollama://llama3.2:3b", priority: 1 }],
  },
};
```

If the CLI detects a major version mismatch, it will warn you **before** any operation runs.

---

## Upgrade Instructions

```bash
# Check current version
devdiff version

# See what changed since your version
devdiff version --changelog

# Upgrade to latest v1.6.0
npm install -g @eldrex/cli@latest

# Verify upgrade
devdiff version
```

---

## Long-Term Support

- **LTS versions** are announced for enterprise deployments.
- Bug-fix backports to previous minors are considered for critical security issues.
- Every release is archived permanently on [GitHub Releases](https://github.com/EldrexDelosReyesBula/devdiff/releases) and [npm](https://www.npmjs.com/package/@eldrex/cli?activeTab=versions).
