# Security Policy

## Reporting a Vulnerability

**DO NOT OPEN A PUBLIC ISSUE** for security vulnerabilities.

Email: **eldrexdelosreyesbula@gmail.com**  
Response time: Within 48 hours

## Scope

| In Scope                       | Out of Scope                   |
| ------------------------------ | ------------------------------ |
| Code injection via diffs       | Already-public CVEs in deps    |
| Secret leakage to external AIs | Social engineering             |
| Local model escape             | Physical access                |
| Config file injection          | User's own API key mishandling |

## Security Guarantees

DevDiff is designed with specific security guarantees:

1. **Local-first default**: No network requests unless explicitly configured
2. **Audit trail**: Every AI call is logged with timestamp, provider, and token count
3. **Dry-run mode**: Preview exactly what data leaves your machine
4. **Secret detection**: Automatic scanning for keys, tokens, credentials before AI processing
5. **Redaction**: Sensitive values replaced with `[REDACTED]` in AI prompts

## Responsible Disclosure

We follow a 90-day disclosure policy:

- Acknowledgment within 48 hours
- Fix within 90 days
- Coordinated disclosure after fix is released

## Bug Bounty

We don't currently have a monetary bounty program, but we will:

- Credit you in our security hall of fame
- Send DevDiff swag
- Write recommendation if requested
- Prioritize your future contributions

## Past Advisories

| CVE        | Date | Severity | Description             |
| ---------- | ---- | -------- | ----------------------- |
| _None yet_ | —    | —        | Let's keep it that way! |
