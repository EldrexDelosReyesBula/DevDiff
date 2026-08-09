# Security & Compliance

**Document Version:** v1.6.0  
**Last Updated:** August 8, 2026  
**Audience:** Enterprise teams, security reviewers, compliance officers

---

## Overview

This document provides a detailed overview of DevDiff's security architecture and compliance posture for organizations evaluating DevDiff for use in regulated or security-sensitive environments.

DevDiff is designed around three foundational security principles:

1. **Zero Attack Surface** — No DevDiff cloud servers means there are no DevDiff-operated systems to breach, no databases to exfiltrate, and no central point of failure.
2. **Defense in Depth** — Multiple independent, layered security controls protect your code context at every processing step.
3. **Complete Auditability** — Every security mechanism is open source, publicly auditable, and verifiable against a pinned lockfile.

---

## Security Architecture

### Data Flow Security

```
Developer Machine
  │
  ├─ Git Diff Extracted Locally
  │
  ├─ Injection Guard v2 ──── Sanitizes all user-controlled content
  │
  ├─ Redaction Engine v2 ─── Strips credentials, secrets, tokens
  │
  ├─ Cloud Guard ──────────── Validates cloud provider is explicitly configured
  │
  ├─ [Local Model] OR [Cloud Provider API] ── Your choice, your control
  │
  └─ AccuracyGuard ────────── Validates output against raw diff
```

No step in this pipeline involves DevDiff-operated infrastructure.

---

## Security Controls

| Control                          | Implementation File                                                  |  Status   |
| :------------------------------- | :------------------------------------------------------------------- | :-------: |
| Credential Redaction             | `packages/core/src/ai/redaction-engine-v2.ts`                        | ✅ Active |
| Prompt Injection Prevention      | `packages/core/src/security/injection-guard-v2.ts`                   | ✅ Active |
| Network Egress Firewall          | `packages/core/src/security/network-guard.ts`                        | ✅ Active |
| Cloud Provider Guard             | `packages/core/src/ai/cloud-guard.ts`                                | ✅ Active |
| Output Accuracy Validation       | `packages/core/src/ai/accuracy-guard.ts`                             | ✅ Active |
| Path Traversal Prevention        | Strict boundary validation on all filesystem operations              | ✅ Active |
| Shell Metacharacter Sanitization | Applied to all user-controlled CLI arguments and inputs              | ✅ Active |
| Encrypted Local Audit Logs       | AES-256-GCM with PBKDF2 key derivation for `.devdiff/audit/`         | ✅ Active |
| MCP Server Authorization         | Token-based authentication on all stdio and HTTP MCP endpoints       | ✅ Active |
| Secure File Permissions          | `.env` and credential files created with `600` permissions           | ✅ Active |
| Dependency Integrity             | pnpm frozen lockfile (`pnpm-lock.yaml`) enforced in all CI pipelines | ✅ Active |
| CodeQL Static Analysis           | Automated code scanning on every push to `main`                      | ✅ Active |
| Secret Scanning                  | CI pre-release scan via `scripts/security-scan.js`                   | ✅ Active |
| Dry-Run Transparency             | `devdiff generate --dry-run` previews all data before any AI call    | ✅ Active |

---

## Compliance Posture

### GDPR (General Data Protection Regulation)

DevDiff is designed to operate entirely within the developer's local environment, which substantially reduces GDPR compliance exposure:

| GDPR Requirement            | DevDiff Posture                                                                    |
| :-------------------------- | :--------------------------------------------------------------------------------- |
| Lawful basis for processing | Not applicable — DevDiff processes no personal data belonging to end users         |
| Data minimization           | No personal data collected or retained                                             |
| Right of access / erasure   | Not applicable — no data held by DevDiff                                           |
| Data transfers              | No transfer to DevDiff infrastructure occurs                                       |
| Sub-processor risk          | If cloud AI providers are used, the developer's own DPA with that provider governs |
| Cookie consent              | No cookies used on the documentation site                                          |

> [!NOTE]
> When cloud AI providers are configured, data is transmitted directly from the developer's machine to the provider under the developer's own API credentials. DevDiff does not intermediate this transmission. Developers should review the Data Processing Addendum (DPA) of their chosen AI provider.

### SOC 2 Type II Considerations

| SOC 2 Trust Service Criteria | DevDiff Posture                                                                         |
| :--------------------------- | :-------------------------------------------------------------------------------------- |
| **Availability**             | Fully offline-capable; no operational dependency on DevDiff infrastructure uptime       |
| **Confidentiality**          | Code context never leaves the local environment by default; Network Guard enforces this |
| **Processing Integrity**     | AccuracyGuard validates all AI-generated outputs against the source diff                |
| **Security**                 | See Security Controls table above                                                       |
| **Privacy**                  | See [Privacy Policy](/legal/privacy-policy)                                             |

### HIPAA

> [!CAUTION]
> DevDiff is **not designed or approved for processing Protected Health Information (PHI)**. If your repository contains patient data or healthcare records, you must:
>
> 1. Configure DevDiff to use a local-only AI provider (Ollama) to ensure zero network egress.
> 2. Verify that your `.devdiff.config.js` has no cloud AI providers configured.
> 3. Consult your organization's compliance team before using any AI tooling on PHI-adjacent repositories.

### Air-Gapped & Offline Environments

DevDiff is fully operational in air-gapped or offline environments:

```bash
# Install CLI on air-gapped machine from a pre-downloaded package tarball
npm install -g /path/to/@eldrex-cli-1.5.0.tgz

# Install VS Code Extension from VSIX file
# Available at: GitHub Releases → devdiff-vscode-1.5.0.vsix
# Install via: VS Code → Extensions → "Install from VSIX..."
```

All core functionality — diff analysis, changelog generation, persistent memory indexing, and Q&A — operates completely offline when a local AI provider (Ollama) is used.

For detailed deployment guidance, see the [Air-Gapped Environments](/enterprise/air-gapped-environments) guide.

---

## Vulnerability Disclosure

DevDiff follows a coordinated responsible disclosure model. Full details are documented in the [Security Policy](https://github.com/EldrexDelosReyesBula/devdiff/blob/main/SECURITY.md).

> [!CAUTION]
> **Do not open public GitHub issues for security vulnerabilities.** Public disclosure before a patch is released puts all users at risk.

**To report a vulnerability:**

1. Navigate to [GitHub Security Advisories](https://github.com/EldrexDelosReyesBula/devdiff/security/advisories/new)
2. Click **"Report a vulnerability"**
3. Provide reproduction steps, affected versions, and impact assessment

**Response Timeline:**

| Stage               | Target SLA             |
| :------------------ | :--------------------- |
| Acknowledgment      | Within 48 hours        |
| Triage & Assessment | Within 5 business days |
| Critical Fix        | Within 14 days         |
| Standard Fix        | Within 90 days         |
| Public Disclosure   | After fix is released  |

**Scope:**

In scope: `@eldrex/core`, `@eldrex/cli`, `@eldrex/gateway`, `@eldrex/mcp`, VS Code Extension  
Out of scope: Third-party AI provider security, social engineering, physical access

---

## Security Audit Trail

All security-relevant changes are tracked in the public git history and release notes:

| Version | Date       | Security Changes                                                                                         |
| :------ | :--------- | :------------------------------------------------------------------------------------------------------- |
| v1.5.0  | 2026-08-07 | Cloud Guard explicit opt-in enforcement, PersistentMemory audit trail, enhanced Injection Guard patterns |
| v1.0.6  | 2026-07-06 | Windows argument parsing hardening, MCP port security improvements                                       |
| v1.0.3  | 2026-06-28 | Initial Redaction Engine v2, Network Guard firewall implementation                                       |

---

## Contact

For security-related inquiries or compliance documentation requests:

| Channel                   | Link                                                                                                  |
| :------------------------ | :---------------------------------------------------------------------------------------------------- |
| Private Security Advisory | [GitHub Security Advisories](https://github.com/EldrexDelosReyesBula/devdiff/security/advisories/new) |
| General Issues            | [GitHub Issues](https://github.com/EldrexDelosReyesBula/devdiff/issues)                               |
| Email                     | eldrexdelosreyesbula@gmail.com                                                                        |
