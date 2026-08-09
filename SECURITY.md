# Security Policy

**Document Version:** v1.5.0  
**Last Reviewed:** August 7, 2026  
**Maintained By:** Eldrex Delos Reyes Bula

---

## Reporting a Vulnerability

> [!CAUTION]
> **Do NOT open a public GitHub issue for security vulnerabilities.** Public disclosure before a fix is released puts all DevDiff users at risk.

### How to Report

Submit a **private security advisory** through GitHub:

**🔗 [Open a Private Security Advisory](https://github.com/EldrexDelosReyesBula/devdiff/security/advisories/new)**

For direct contact, email: **eldrexdelosreyesbula@gmail.com**

Include the following in your report:

- A concise description of the vulnerability
- Reproduction steps or a proof-of-concept
- The affected version(s)
- The potential impact or attack scenario
- Any suggested mitigations (optional)

---

## Response Timeline

| Stage                         | Target SLA                             |
| :---------------------------- | :------------------------------------- |
| Initial Acknowledgment        | Within **48 hours**                    |
| Triage & Severity Assessment  | Within **5 business days**             |
| Fix Development               | Within **90 days** (critical: 14 days) |
| Coordinated Public Disclosure | After fix is released and deployed     |

---

## Vulnerability Scope

### In Scope

| Category                        | Examples                                                          |
| :------------------------------ | :---------------------------------------------------------------- |
| Code injection via diff content | Prompt injection through commit messages, malicious diff payloads |
| Secret / credential leakage     | API keys transmitted to unauthorized endpoints                    |
| Local model escape              | Exploiting LLM inference to execute host commands                 |
| Configuration file injection    | `.devdiff.config.js` parsing leading to unintended behavior       |
| Network Guard bypass            | Circumventing whitelist-only outbound connection enforcement      |
| Injection Guard bypass          | Evading the `injection-guard-v2.ts` sanitization layer            |
| Redaction Engine failure        | Credentials surviving to AI prompt submission                     |

### Out of Scope

| Category                                        | Reason                             |
| :---------------------------------------------- | :--------------------------------- |
| Known CVEs in upstream dependencies             | Track via `npm audit` / Dependabot |
| Social engineering attacks on maintainers       | Outside software scope             |
| Physical access to developer machines           | Outside software scope             |
| Mishandling of user's own API keys externally   | User responsibility                |
| Vulnerabilities in third-party AI provider APIs | Contact the respective provider    |

---

## Security Guarantees

DevDiff is architected with the following security properties as first-class requirements:

1. **Local-First by Default** — No network requests are made unless you explicitly configure a cloud AI provider. There are no telemetry calls, analytics beacons, or phone-home behaviors.
2. **Whitelist-Only Outbound** — The Network Guard (`packages/core/src/security/network-guard.ts`) enforces that DevDiff only communicates with AI provider endpoints you have explicitly configured.
3. **Pre-Submission Redaction** — All diff content is scanned and redacted by the Redaction Engine v2 (`packages/core/src/ai/redaction-engine-v2.ts`) before reaching any AI model.
4. **Prompt Injection Defense** — Injection Guard v2 (`packages/core/src/security/injection-guard-v2.ts`) sanitizes commit messages, file names, and diff content to block LLM prompt injection attacks.
5. **Dry-Run Transparency** — `devdiff generate --dry-run` shows exactly what data would be sent to any AI provider before committing to the call.
6. **Audit Trail** — Every AI call produces a local audit log entry containing timestamp, provider name, model ID, and token counts — no content.

---

## Responsible Disclosure Policy

DevDiff follows a coordinated disclosure model:

1. Reporter submits a private advisory.
2. DevDiff maintainers acknowledge within 48 hours.
3. We investigate, develop, and test a fix.
4. A patched release is published.
5. A public security advisory is released with full attribution to the reporter (unless anonymity is requested).
6. Disclosure embargo is a maximum of **90 days** from initial report.

---

## Recognition

DevDiff does not currently operate a monetary bug bounty program. However, for verified, qualifying security reports we will:

- Credit you publicly in the security advisory and release notes (unless you prefer anonymity)
- List you in our Security Hall of Fame
- Provide a personalized letter of recognition upon request
- Prioritize your future contributions and pull requests

---

## Security Hall of Fame

| Researcher     | Report | Year |
| :------------- | :----- | :--- |
| _Be the first_ | —      | —    |

---

## Past Security Advisories

| Advisory ID | Date | Severity | Description           |
| :---------- | :--- | :------- | :-------------------- |
| _None_      | —    | —        | No advisories to date |

---

## Contact

| Channel                       | Link                                                                                                  |
| :---------------------------- | :---------------------------------------------------------------------------------------------------- |
| Private Advisory (preferred)  | [GitHub Security Advisories](https://github.com/EldrexDelosReyesBula/devdiff/security/advisories/new) |
| Email (sensitive disclosures) | eldrexdelosreyesbula@gmail.com                                                                        |
| Public Issue Tracker          | [GitHub Issues](https://github.com/EldrexDelosReyesBula/devdiff/issues)                               |
