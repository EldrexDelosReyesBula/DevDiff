# Security Overview

DevDiff is designed from the ground up with a privacy-first, security-conscious architecture. This document explains the security model.

---

## Core Security Principles

1. **Zero Trust by Default** — No data leaves your machine unless you explicitly configure a cloud provider
2. **Data Classification Engine** — Automatically detects and blocks secrets/PII before cloud transmission
3. **No Telemetry** — DevDiff collects no usage data, no analytics, no crash reports
4. **Offline Capable** — With Ollama, DevDiff works with zero network access
5. **Open Source** — All code is publicly auditable at [GitHub](https://github.com/EldrexDelosReyesBula/devdiff)

---

## Data Flow

### Local AI (Ollama)

```
Your code change
      │
      ▼
  git diff (staged)
      │
      ▼
DevDiff CLI
      │  (no network call)
      ▼
Ollama (local process)
      │  (no network call)
      ▼
AI model on your CPU/GPU
      │
      ▼
Changelog output
```

**Nothing leaves your machine.** ✅

### Cloud AI (OpenAI, Anthropic)

```
Your code change
      │
      ▼
  git diff (staged)
      │
      ▼
DevDiff Data Classification Engine
      │  (strips secrets, PII, sensitive patterns)
      ▼
Redacted diff sent to cloud API
      │  (HTTPS encrypted)
      ▼
Cloud AI model (OpenAI / Anthropic)
      │
      ▼
Changelog returned
      │
      ▼
DevDiff CLI output
```

**Diff is sent to cloud provider.** ⚠️ See [Privacy Policy](/privacy-policy) and the provider's privacy policy.

---

## Data Classification Engine

The data classification engine runs before any cloud API call and automatically redacts:

| Pattern         | Example                           | Action                                 |
| --------------- | --------------------------------- | -------------------------------------- |
| API Keys        | `sk-abc123...`                    | Replaced with `[REDACTED_API_KEY]`     |
| Passwords       | `password = "secret"`             | Replaced with `[REDACTED_PASSWORD]`    |
| AWS credentials | `AKIA...`                         | Replaced with `[REDACTED_AWS_KEY]`     |
| Private keys    | `-----BEGIN RSA PRIVATE KEY-----` | Replaced with `[REDACTED_PRIVATE_KEY]` |
| Email addresses | `user@example.com`                | Configurable — redact or allow         |
| IP addresses    | `192.168.1.1`                     | Configurable — redact or allow         |
| JWT tokens      | `eyJ...`                          | Replaced with `[REDACTED_JWT]`         |

**Configure the classifier:**

```javascript
// .devdiff.config.js
export default {
  security: {
    classifier: {
      enabled: true, // Always enabled for cloud providers
      failOpen: false, // If classifier errors, block the request
      customPatterns: [
        {
          name: "internal-token",
          pattern: /TOKEN_[A-Z0-9]{32}/,
          replacement: "[REDACTED_INTERNAL_TOKEN]",
        },
      ],
    },
  },
};
```

---

## Git Hook Security

When you run `devdiff init`, it installs a pre-commit hook. This hook:

- ✅ Only reads staged changes
- ✅ Does not modify your working directory
- ✅ Does not push, pull, or make any git writes
- ✅ Can be disabled with `devdiff init --no-hooks`

---

## Shell Command Safety

DevDiff runs only two types of shell commands:

1. `git diff --cached` — reads staged changes
2. `git log` — reads commit history

DevDiff never runs arbitrary shell commands from your diff content. There is no code execution of analyzed content.

---

## Vibe-Coding Guardian

The `devdiff vibe` feature creates checkpoints before destructive operations. See [Vibe-Coding Mode](/guide/vibe-coding) for details.

---

## Audit Log

Every AI provider call is logged locally:

```bash
# View audit log
devdiff audit

# Log location
cat .devdiff/audit.jsonl
```

Each entry records: timestamp, provider used, persona, tokens consumed, and whether classification was triggered.

---

## Responsible Disclosure

Found a security vulnerability? See [Security Disclosure](/security/disclosure).

---

## Related

- [Privacy Guarantees](/security/privacy)
- [Compliance Frameworks](/security/compliance)
- [Security Disclosure](/security/disclosure)
