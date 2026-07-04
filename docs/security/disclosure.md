# Security Disclosure

## Reporting a Vulnerability

If you discover a security vulnerability in DevDiff, please report it responsibly. **Do not open a public GitHub issue for security vulnerabilities.**

---

## How to Report

**Email:** [eldrexdelosreyesbula@gmail.com](mailto:eldrexdelosreyesbula@gmail.com)

**GitHub Security Advisories:** [Report via GitHub](https://github.com/EldrexDelosReyesBula/devdiff/security/advisories/new)

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your name/handle (for credit in the advisory)

---

## Response Timeline

| Stage              | Timeframe                                |
| ------------------ | ---------------------------------------- |
| Acknowledgment     | Within 48 hours                          |
| Initial assessment | Within 5 business days                   |
| Fix development    | Within 30 days (critical: within 7 days) |
| Public disclosure  | After fix is released                    |

---

## Scope

### In Scope

- `@eldrex/core` — Core library
- `@eldrex/cli` — CLI tool
- `@eldrex/vscode` — VS Code extension
- `devdiff.vercel.app` — Website and playground
- Data classification engine bypass

### Out of Scope

- Vulnerabilities in third-party dependencies (report to the upstream project)
- Issues requiring physical access to the machine
- Social engineering attacks
- Known issues already listed in GitHub Issues

---

## Responsible Disclosure Policy

We follow coordinated disclosure:

1. You report the vulnerability privately
2. We investigate and develop a fix
3. We release the fix
4. We credit you in the security advisory
5. You may publish your findings after the fix is released

We will not take legal action against security researchers who follow this policy.

---

## Security Architecture Notes

DevDiff's attack surface is intentionally minimal:

**Network exposure:**

- CLI: No listening ports (only outbound to AI providers)
- MCP server: Optional, localhost-only by default
- VS Code extension: No network exposure beyond what the CLI does

**Shell execution:**

- DevDiff only executes: `git diff --cached`, `git log`, `git status`
- No arbitrary code execution from diff content

**File system:**

- DevDiff reads: `.devdiff.config.js`, `.devdiffignore`, `.git/`
- DevDiff writes: `.devdiff/` directory only

**Data classification:**

- Runs before any cloud API call
- Regex-based (not AI-based) for deterministic behavior
- Fails closed by default (if classifier errors, the request is blocked)

---

## Hall of Fame

Security researchers who have responsibly disclosed vulnerabilities:

_No vulnerabilities reported yet. Be the first!_
