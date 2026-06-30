# Version Policy

## The Immutable Version Guarantee

> **Every published version of DevDiff works exactly as released — forever.**

DevDiff follows a strict immutability contract: once a version is published to npm, it is frozen. We will never push a breaking change to an existing version tag. Your code will not silently break due to a DevDiff update.

---

## How It Works

### Versions Never Change

A published version is a snapshot in time. `v1.0.2` on 2026-06-28 works identically on 2027-06-28.

### Updates Are Always Opt-In

DevDiff **does not auto-update**. You upgrade only when you choose to:

```bash
# Upgrade when YOU are ready
npm install -g @eldrex/cli@latest

# Or pin to a specific version forever
npm install -g @eldrex/cli@1.0.3
```

### Check Your Version

```bash
devdiff version           # Shows current version + config compatibility
devdiff version --check   # Checks npm for the latest release (offline-safe)
devdiff version --changelog  # Shows release history in your terminal
```

---

## Versioning Scheme

DevDiff uses [Semantic Versioning](https://semver.org): `MAJOR.MINOR.PATCH`

| Increment         | Meaning                                            |    Config compatible?    |
| ----------------- | -------------------------------------------------- | :----------------------: |
| **Patch** (1.0.x) | Bug fixes, docs, minor improvements                |        ✅ Always         |
| **Minor** (1.x.0) | New features, new providers, new personas          | ✅ Backwards-compatible  |
| **Major** (x.0.0) | Breaking changes (rare, announced well in advance) | ⚠️ Check migration guide |

---

## Config Version Pinning

You can lock your project to a specific DevDiff version by adding it to your config:

```javascript
// .devdiff.config.js
export default {
  version: "1.0.3", // DevDiff will warn if CLI version mismatches
  ai: {
    providers: [{ name: "local", url: "ollama://llama3.2:3b", priority: 1 }],
  },
};
```

If the CLI detects a major version mismatch, it will warn you **before** any operation runs.

---

## Upgrade Instructions

```bash
# Check what you're running
devdiff version

# See what changed since your version
devdiff version --changelog

# Upgrade
npm install -g @eldrex/cli@latest

# Verify upgrade
devdiff version
```

---

## Long-Term Support

- **LTS versions** will be announced for enterprise deployments.
- Bug-fix backports to previous minors are considered for critical security issues.
- Every release is archived permanently on [GitHub Releases](https://github.com/EldrexDelosReyesBula/devdiff/releases) and [npm](https://www.npmjs.com/package/@eldrex/cli?activeTab=versions).
