# Security & Compliance

**Last Updated:** July 6, 2026 · v1.0.6

This page provides an overview of DevDiff's security architecture and compliance posture for enterprise teams evaluating DevDiff for regulated environments.

---

## Security Architecture

DevDiff's security model is built around three principles:

1. **Offense is impossible when there's nothing to attack** — No DevDiff cloud servers means no attack surface for data breaches.
2. **Defense in depth** — Multiple independent security layers protect code context at every step.
3. **Auditability** — Every security mechanism is open source and verifiable.

---

## Security Controls Summary

| Control | Implementation | Status |
|---|---|:---:|
| Credential Redaction | Redaction Engine v2 — regex-based pre-flight stripping | ✅ Active |
| Prompt Injection Prevention | Injection Guard v2 — multi-pattern sanitization | ✅ Active |
| Network Egress Firewall | Network Guard — allowlist-only outbound | ✅ Active |
| Path Traversal Prevention | Strict boundary checks on all filesystem operations | ✅ Active |
| Shell Command Sanitization | Metacharacter stripping on all user inputs | ✅ Active |
| Encrypted Audit Trail | AES-256-GCM encrypted local logs with PBKDF2 key derivation | ✅ Active |
| MCP Authorization | Token-based auth for stdio and HTTP MCP server endpoints | ✅ Active |
| Secure File Permissions | `.env` files created with `600` permissions automatically | ✅ Active |
| Dependency Integrity | pnpm frozen lockfile enforcement in CI | ✅ Active |
| CodeQL Analysis | Automated static analysis on every push to `main` | ✅ Active |
| Secret Scanning | CI pipeline security scan via `scripts/security-scan.js` | ✅ Active |

---

## Compliance Posture

DevDiff is designed to support compliance-conscious organizations.

### GDPR

- DevDiff processes **no personal data** about end users.
- No cookies, tracking pixels, or behavioral analytics are used.
- All developer code data stays on the developer's local machine (or CI runner) — it is never transmitted to DevDiff infrastructure.
- When cloud AI providers are configured, data is transmitted directly to the provider under the developer's own API credentials. Developers should review their provider's DPA.

### SOC 2 Considerations

For organizations pursuing SOC 2 Type II:

| SOC 2 Criteria | DevDiff Posture |
|---|---|
| **Availability** | Fully offline-capable; no dependency on DevDiff uptime |
| **Confidentiality** | Code never leaves local environment by default |
| **Processing Integrity** | AccuracyGuard validates outputs against raw diff |
| **Security** | See controls table above |
| **Privacy** | See [Privacy Policy](/legal/privacy-policy) |

### HIPAA

DevDiff is **not designed for processing PHI (Protected Health Information)**. If your repository contains patient data, configure DevDiff to use local-only models (Ollama) to ensure zero network egress, and ensure your `.devdiff.config.js` has no cloud providers configured.

### Air-Gapped Environments

DevDiff fully supports air-gapped deployments:

```bash
# Install CLI on air-gapped machine from pre-downloaded package
npm install -g /path/to/@eldrex-cli-1.0.6.tgz

# VS Code Extension — install from VSIX
# Available at: GitHub Releases → devdiff-1.0.6.vsix
```

For more, see the [Air-Gapped Environments guide](/enterprise/air-gapped-environments).

---

## Vulnerability Disclosure

We take security seriously and follow a responsible disclosure model.

### Reporting a Vulnerability

**Do not open public GitHub issues for security vulnerabilities.**

Instead:

1. Go to [GitHub Security Advisories](https://github.com/EldrexDelosReyesBula/devdiff/security/advisories)
2. Click **"Report a vulnerability"**
3. Fill in the details — include reproduction steps, affected versions, and potential impact

We will acknowledge within **48 hours** and aim to patch within **7 days** for critical issues.

### Scope

In scope:

- `@eldrex/core` — AI router, redaction engine, injection guard
- `@eldrex/cli` — Command execution, credential handling
- `@eldrex/gateway` — HTTP/WebSocket/MCP endpoints
- `@eldrex/mcp` — MCP server authorization
- VS Code / Open VSX Extension

Out of scope:

- Third-party AI provider security (OpenAI, Anthropic, etc.)
- Issues requiring physical access to the user's machine
- Social engineering attacks

---

## Security Audit Trail

All security-related changes are tracked in the public git history. Key security releases:

| Version | Release | Security Changes |
|---|---|---|
| v1.0.6 | 2026-07-06 | Windows argument parsing hardening, port reuse security |
| v1.0.5 | 2026-07-06 | Injection Guard v2, Redaction Engine v2, CI secret scanning |
| v1.0.3 | 2026-07-04 | AES-256-GCM audit trail, MCP auth tokens, Network Guard |
| v1.0.0 | 2026-06-28 | Initial security model established |

---

## Related Security Documentation

- [Security Overview](/security/overview)
- [Privacy Guarantees](/security/privacy)
- [Network Guard](/security/network-guard)
- [Redaction Engine](/security/redaction-engine)
- [Injection Prevention](/security/injection-prevention)
- [Responsible Disclosure](/security/disclosure)
- [Compliance Frameworks](/security/compliance)
