# Safety Policy

**Last Updated:** July 6, 2026 · v1.0.6

DevDiff is a developer tool that connects code repositories with AI models for changelog generation. This page documents how DevDiff approaches AI safety, responsible use, and harm prevention.

---

## 1. AI Safety Design Principles

DevDiff is built with safety at the architecture level, not as an afterthought.

### Prompt Injection Prevention

DevDiff's **Injection Guard v2** (`packages/core/src/security/injection-guard-v2.ts`) defends against:

| Attack Vector | Protection |
|---|---|
| Prompt injection via commit messages | Input sanitization before LLM submission |
| Jailbreak attempts in diff content | Pattern matching against known evasion sequences |
| Shell command chaining (`&&`, `||`, `;`) | Character-level sanitization |
| SQL injection sequences | Regex-based stripping |
| XSS payloads | HTML entity escaping |
| Prototype pollution | Object key validation |

### Credential Redaction Before AI Submission

Before any diff content reaches an AI model, **Redaction Engine v2** automatically strips:

- API keys (OpenAI, Anthropic, GitHub, AWS, etc.)
- Private SSH/PEM certificates
- Database passwords and connection strings
- `.env` variable values matching credential patterns
- JWT tokens and session secrets

This happens locally, before any network transmission, regardless of whether you use a local or cloud model.

---

## 2. Network Safety Controls

### Network Guard Firewall

DevDiff's **Network Guard** (`packages/core/src/security/network-guard.ts`) enforces:

- **Whitelist-only outbound connections** — DevDiff only communicates with explicitly configured AI provider endpoints and nothing else.
- **Telemetry blocking** — Over 20 known analytics/telemetry platforms (Mixpanel, Sentry, Datadog, Amplitude, Segment, etc.) are blocked at the network layer.
- **No phone-home behavior** — DevDiff does not contact DevDiff servers for any reason.

---

## 3. AI Output Safety

### Accuracy & Verification

- DevDiff uses an **AccuracyGuard** post-check layer that validates AI-generated changelogs against the actual raw diff before output.
- Outputs are presented as **explanations**, not authoritative documentation. Developers are expected to review generated changelogs before publishing.
- DevDiff does not generate or suggest code changes — it only explains existing diffs.

### Persona Scope Limitation

All built-in AI personas (Developer, Security, Product Manager, Executive) are scoped to **analyze git diffs only**. They cannot:

- Execute shell commands
- Write or modify files
- Access external APIs independently
- Invoke system-level operations

---

## 4. Multi-Agent Swarm Safety

When using the multi-agent consensus mode (OpenClaw Supervisor):

- Each agent operates in an **isolated analysis scope** — no agent can trigger side effects on the filesystem or network.
- Human-in-the-loop prompts are presented before any automated action (approve, reject, modify, delegate).
- Non-interactive CI/CD fallbacks default to the **safest available option** automatically.

---

## 5. Reporting Safety Issues

If you discover a safety concern, prompt injection vulnerability, or potential for harmful output:

- **GitHub Security Advisories:** [https://github.com/EldrexDelosReyesBula/devdiff/security/advisories](https://github.com/EldrexDelosReyesBula/devdiff/security/advisories)
- **Email (for sensitive disclosures):** Open a private advisory on GitHub
- **Public Issues:** [https://github.com/EldrexDelosReyesBula/devdiff/issues](https://github.com/EldrexDelosReyesBula/devdiff/issues)

We follow a **responsible disclosure** process and will acknowledge reports within 48 hours.

---

## 6. Scope of This Policy

This policy applies to the core DevDiff packages (`@eldrex/core`, `@eldrex/cli`, `@eldrex/gateway`, `@eldrex/mcp`, the VS Code extension, and the Open VSX extension). Third-party AI providers have their own safety policies which apply to any data you transmit to them.
