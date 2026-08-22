# Safety & Harm Prevention Policy

**Document Version:** v1.9.0  
**Last Updated:** August 8, 2026  
**Effective Date:** June 28, 2026

---

## Introduction

DevDiff is an AI-assisted developer tool that analyzes git diffs and generates human-readable changelogs. Because DevDiff connects developer codebases with AI language models, we take AI safety seriously as an architectural concern — not as an afterthought.

This document describes DevDiff's approach to AI safety, responsible use, harm prevention, and the reporting process for safety-related concerns.

---

## 1. AI Safety Design Principles

### 1.1 Prompt Injection Defense

All diff content, commit messages, file names, and repository metadata pass through **Injection Guard v2** (`packages/core/src/security/injection-guard-v2.ts`) before being included in any AI prompt.

| Attack Vector                              | Defense Mechanism                                                         |
| :----------------------------------------- | :------------------------------------------------------------------------ |
| Prompt injection via commit messages       | Input sanitization and context isolation before LLM submission            |
| Jailbreak sequences in diff content        | Pattern matching against known evasion sequences and adversarial payloads |
| Shell command chaining (`&&`, `\|\|`, `;`) | Character-level sanitization and escaping                                 |
| SQL injection sequences                    | Regex-based detection and stripping                                       |
| HTML/XSS payloads                          | Entity escaping and markup stripping                                      |
| Prototype pollution patterns               | Object key validation and allowlisting                                    |
| Indirect prompt injection via file content | Structural isolation of user-controlled content from system prompts       |

### 1.2 Credential Redaction Before AI Submission

Before any content reaches an AI model — whether local or cloud — DevDiff's **Redaction Engine v2** (`packages/core/src/ai/redaction-engine-v2.ts`) automatically detects and removes:

- API keys for OpenAI, Anthropic, GitHub, AWS, GCP, Azure, and other providers
- Private SSH and PEM certificate material
- Database connection strings, passwords, and credentials
- `.env` file values matching credential patterns
- JWT tokens, session secrets, and bearer tokens
- High-entropy generic secrets

Redaction happens locally, before any network transmission, regardless of whether a local or cloud AI model is configured.

### 1.3 Cloud AI Explicit Opt-In (Cloud Guard)

DevDiff's **Cloud Guard** (`packages/core/src/ai/cloud-guard.ts`) enforces that no cloud AI provider is ever contacted automatically, even if provider API keys are detected in the local environment.

Cloud providers are only activated when you:

- Run `devdiff auth add` to explicitly configure a provider, **or**
- Set a `provider` entry in `.devdiff.config.js` with explicit intent

This prevents accidental API usage, unintended costs, and unintended data transmission.

---

## 2. Network Safety Controls

### 2.1 Network Guard Firewall

The **Network Guard** (`packages/core/src/security/network-guard.ts`) enforces whitelist-only outbound connectivity:

| Control                    | Description                                                                                                                            |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| Whitelist-only connections | DevDiff only communicates with AI provider API endpoints you have explicitly configured                                                |
| Telemetry blocking         | Over 20 known analytics and telemetry platforms are blocked at the network layer (Mixpanel, Sentry, Datadog, Amplitude, Segment, etc.) |
| No phone-home behavior     | DevDiff never contacts DevDiff servers, update servers, or external hosts for any operational purpose                                  |
| Dry-run preview            | `devdiff generate --dry-run` shows exactly what would be transmitted before any network call is made                                   |

---

## 3. AI Output Safety

### 3.1 Accuracy Validation

- DevDiff uses an **AccuracyGuard** post-processing layer that cross-references AI-generated changelog entries against the underlying raw diff before output is finalized.
- AI-generated changelogs are presented as **explanations and summaries**, not authoritative documentation. Developers are expected to review generated output before publishing it.
- DevDiff does **not** generate, suggest, apply, or commit code changes. It only analyzes and explains existing diffs.

### 3.2 Persona Scope Limitation

All built-in DevDiff AI personas (Developer, Security Analyst, Product Manager, Executive, and others) are strictly scoped to **diff analysis**. No persona is capable of:

- Executing shell commands or scripts
- Writing, modifying, or deleting files
- Accessing external APIs independently
- Invoking system-level or OS operations
- Making autonomous decisions that affect your codebase

### 3.3 Output Review Responsibility

DevDiff outputs are advisory in nature. The developer retains full responsibility for reviewing, editing, and approving any AI-generated content before it is published, committed, or distributed.

---

## 4. Multi-Agent Swarm Safety

When using the multi-agent consensus mode via OpenClaw Supervisor:

| Safety Property            | Implementation                                                                                                                             |
| :------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| Agent isolation            | Each agent operates in a sandboxed analysis scope with no access to the filesystem or network beyond what the host DevDiff process permits |
| No autonomous side effects | No agent can trigger commits, file writes, API calls, or other side effects independently                                                  |
| Human-in-the-loop          | Interactive approval prompts are required before any automated action (approve, reject, modify, delegate)                                  |
| CI/CD safe fallback        | In non-interactive CI environments, consensus mode defaults to the most conservative available option automatically                        |

---

## 5. Scope of This Policy

This Safety Policy applies to the core DevDiff software packages:

- `@eldrex/core`
- `@eldrex/cli`
- `@eldrex/gateway`
- `@eldrex/mcp`
- `@eldrex/vscode` (VS Code Extension)
- `@eldrex/integrations`

Third-party AI providers configured by the user have their own safety and acceptable use policies, which apply independently to any data transmitted to them.

---

## 6. Reporting Safety Issues

If you discover a safety concern, prompt injection vulnerability, or behavior that could produce harmful output:

> [!CAUTION]
> For vulnerabilities that could be exploited before a fix is released, please use the **private advisory channel** rather than a public issue.

| Channel                                                                                                     | Use When                                                                     |
| :---------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| [GitHub Private Security Advisory](https://github.com/EldrexDelosReyesBula/devdiff/security/advisories/new) | Sensitive vulnerabilities that should not be publicly disclosed before a fix |
| [GitHub Public Issues](https://github.com/EldrexDelosReyesBula/devdiff/issues)                              | General safety improvement suggestions, non-exploitable behavioral concerns  |
| Email: eldrexdelosreyesbula@gmail.com                                                                       | Sensitive disclosures requiring direct contact                               |

We follow a responsible disclosure process and will acknowledge all reports within **48 hours**.

---

## 7. Policy Updates

This Safety Policy will be updated when new safety mechanisms are introduced or when the scope of the Software changes. All changes are tracked in the project's git history and announced in release notes.
