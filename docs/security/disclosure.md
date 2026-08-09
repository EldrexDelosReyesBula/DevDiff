# Responsible Vulnerability Disclosure Policy

At DevDiff, the security and privacy of our users and their codebases are our top priority. We appreciate the contributions of security researchers, ethical hackers, and the open-source community in helping us maintain the highest standards of software security.

If you discover a security vulnerability in DevDiff CLI, VS Code extension (`@eldrex/vscode`), MCP server (`@eldrex/mcp`), core engine (`@eldrex/core`), or documentation site, we encourage you to report it to us promptly.

---

## 🎯 Reporting Guidelines

To ensure responsible handling of potential security issues, please follow these guidelines:

1. **Private Reporting First**: Do not disclose vulnerabilities publicly (e.g. in GitHub Issues, Discord, or X/Twitter) until we have investigated and resolved the issue.
2. **Detailed Steps to Reproduce**: Provide clear proof-of-concept (PoC) code, step-by-step instructions, command lines, or environment configurations required to reproduce the flaw.
3. **Avoid Destructive Testing**: Do not perform actions that could disrupt live user environments or compromise user data.

---

## 📧 How to Submit a Vulnerability Report

Send your security advisory directly to our dedicated security team:

- **Email**: `security@devdiff.org` (or `eldrexdelosreyesbula@gmail.com`)
- **PGP Encryption Key**: Available upon request or via `https://devdiff.vercel.app/security/pgp-key.asc`

### Report Format Checklist:
- Component affected (`@eldrex/vscode`, `@eldrex/mcp`, `@eldrex/core`, CLI)
- Type of vulnerability (e.g. Path Traversal, Prompt Injection, Secret Leakage, RPC Flaw)
- Steps to reproduce
- Potential impact assessment
- Suggested remediation or patch (if available)

---

## ⏱️ Response Timeline & SLA

We are committed to responding to security reports swiftly:

- **Initial Acknowledgment**: Within 24 hours of receipt.
- **Triage & Risk Assessment**: Within 72 hours.
- **Remediation Patch Released**: High/Critical vulnerabilities patched within 7 business days.
- **Public Disclosure**: Coordinated after the security patch is published.

---

## 🏆 Hall of Fame & Recognition

Security researchers who responsibly report valid vulnerabilities will be recognized in our **Security Hall of Fame** in our release notes and repository `SECURITY.md`.
