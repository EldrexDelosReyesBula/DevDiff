# Privacy Policy

**Document Version:** v1.9.0  
**Last Updated:** August 8, 2026  
**Effective Date:** June 28, 2026  
**Jurisdiction:** Global

---

## Introduction

DevDiff ("we," "our," or "us") is committed to protecting the privacy of every developer who uses our software. This Privacy Policy describes how DevDiff handles data when you use the DevDiff CLI, VS Code Extension, Gateway, MCP Server, and all associated open-source packages (collectively, the "Software").

We built DevDiff on a simple principle: **your code and your data belong to you — not to us.**

---

## 1. Our Core Privacy Principle

DevDiff is designed as a **local-first, privacy-first** developer tool. By default:

- No source code, diffs, or repository content ever leaves your machine.
- No telemetry, analytics, or usage data is collected.
- No accounts, registration, or personal information is required to use the Software.
- No DevDiff servers sit in the middle of your workflow.

> [!IMPORTANT]
> **DevDiff never phones home.** There are no background network calls, update-check pings, crash reporters, or analytics beacons. The Network Guard enforces this at the code level — you can audit it at `packages/core/src/security/network-guard.ts`.

---

## 2. Data Processing

### 2.1 Local Model Mode (Default)

When DevDiff is configured with a local AI provider (Ollama, llama.cpp, or WebGPU/Transformers.js):

| What Happens                  | Detail                                                                                                    |
| :---------------------------- | :-------------------------------------------------------------------------------------------------------- |
| All processing is local       | AST parsing, diff extraction, token budgeting, and LLM inference run entirely within your system's memory |
| Zero network egress           | No data is transmitted over the internet during local model operation                                     |
| Offline operation             | DevDiff is fully functional offline once local models are downloaded                                      |
| No DevDiff server involvement | We operate no servers, proxies, or relays for local model traffic                                         |

### 2.2 Cloud AI Provider Mode (Explicit Opt-In Only)

Cloud AI providers (OpenAI, Anthropic, Google Gemini, etc.) are **never used automatically**. You must explicitly configure them in `.devdiff.config.js` or via `devdiff auth add`. When you do:

| What Happens             | Detail                                                                                                       |
| :----------------------- | :----------------------------------------------------------------------------------------------------------- |
| Direct API communication | DevDiff transmits your pre-trimmed, redacted diff context directly to the configured provider's API endpoint |
| No intermediate servers  | Requests are never proxied through DevDiff infrastructure                                                    |
| Local key storage only   | API keys are read from local environment variables at runtime and never persisted by DevDiff                 |
| Provider policies apply  | Data sent to cloud AI providers is subject to their own privacy policies and terms                           |

> [!NOTE]
> Most enterprise API tiers of major AI providers (OpenAI, Anthropic) explicitly guarantee that API request data is not used for model training. Verify your provider's current data usage policy before sending proprietary code.

### 2.3 Credential Redaction (Always Active)

Before any diff content is submitted to any AI model — local or cloud — DevDiff's **Redaction Engine v2** (`packages/core/src/ai/redaction-engine-v2.ts`) automatically detects and strips:

- API keys (OpenAI, Anthropic, GitHub, AWS, GCP, Azure, and others)
- Private SSH and PEM certificate material
- Database connection strings and passwords
- `.env` file values matching credential patterns
- JWT tokens and session secrets
- Generic high-entropy secret strings

Redacted values are replaced with the placeholder `[REDACTED]` before the content leaves the redaction pipeline.

### 2.4 Data We Never Collect

| Data Type                                   | Collected? |
| :------------------------------------------ | :--------: |
| Source code or git diffs                    |  ❌ Never  |
| CLI command history or arguments            |  ❌ Never  |
| Repository names, paths, or identifiers     |  ❌ Never  |
| API keys or credentials                     |  ❌ Never  |
| Developer names or email addresses          |  ❌ Never  |
| IP addresses or device identifiers          |  ❌ Never  |
| Crash reports or error telemetry            |  ❌ Never  |
| Usage analytics or feature metrics          |  ❌ Never  |
| Operating system or environment information |  ❌ Never  |

---

## 3. Documentation Website

The DevDiff documentation site (`https://devdiff.vercel.app`) is a **static site** hosted on Vercel's CDN.

- We do **not** use cookies, behavioral trackers, or fingerprinting scripts.
- We do **not** collect, store, or process personal data from site visitors.
- Vercel's infrastructure may collect anonymized edge-network metrics (e.g., page load latency, CDN region) per Vercel's own [Privacy Policy](https://vercel.com/legal/privacy-policy). DevDiff has no access to or control over this data.

---

## 4. Local Artifacts

DevDiff generates local-only artifacts in your workspace:

| Artifact             | Location                                    | Purpose                                                              |
| :------------------- | :------------------------------------------ | :------------------------------------------------------------------- |
| Codebase index       | `.devdiff/memory/codebase-index.json`       | Persistent memory index for conversational Q&A                       |
| Snapshot history     | `.devdiff/memory/snapshot-history.json`     | Historical diff snapshots                                            |
| Conversation history | `.devdiff/memory/conversation-history.json` | Multi-turn Q&A context                                               |
| Audit logs           | `.devdiff/audit/`                           | Local record of AI calls (provider, model, token count — no content) |

All of these files reside exclusively on your filesystem. DevDiff never reads, transmits, or has access to these files remotely. You may delete them at any time.

---

## 5. Open Source Auditability

DevDiff is fully open source under the MIT License. Every code path that handles your data is publicly auditable:

- **Repository:** [github.com/EldrexDelosReyesBula/devdiff](https://github.com/EldrexDelosReyesBula/devdiff)
- **Redaction Engine:** `packages/core/src/ai/redaction-engine-v2.ts`
- **Network Guard:** `packages/core/src/security/network-guard.ts`
- **Injection Guard:** `packages/core/src/security/injection-guard-v2.ts`
- **Cloud Guard:** `packages/core/src/ai/cloud-guard.ts`

---

## 6. Data Retention

DevDiff operates no servers and maintains no databases. There is no data retained on our end — because we never receive any.

Local DevDiff artifacts on your machine are retained until you delete them. You can remove all DevDiff-generated local data by running:

```bash
rm -rf .devdiff/
```

---

## 7. Your Rights

Because DevDiff collects no personal data, there is no data subject to access, correction, export, or deletion requests on our part. You have full and complete control over all data processed locally by the Software.

If you believe a DevDiff component is transmitting data contrary to this policy, please report it as a security vulnerability via our [Security Policy](/security/disclosure).

---

## 8. Policy Changes

If this Privacy Policy changes materially, we will update the version number and "Last Updated" date at the top of this document and announce the change in the project's release notes. Changes are tracked publicly in git history.

---

## 9. Contact

For privacy-related questions or concerns:

| Channel              | Link                                                                                                     |
| :------------------- | :------------------------------------------------------------------------------------------------------- |
| GitHub Issues        | [github.com/EldrexDelosReyesBula/devdiff/issues](https://github.com/EldrexDelosReyesBula/devdiff/issues) |
| Security Disclosures | [GitHub Private Advisory](https://github.com/EldrexDelosReyesBula/devdiff/security/advisories/new)       |
| Email                | eldrexdelosreyesbula@gmail.com                                                                           |
