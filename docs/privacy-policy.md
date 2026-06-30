# Privacy Policy

**Last Updated:** June 28, 2026

DevDiff ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle your data when you use the DevDiff CLI, Gateway, VS Code Extension, and associated open-source packages.

---

## 1. Core Philosophy: Privacy-First

DevDiff is designed under a **local-first** paradigm. We believe that your source code, configuration values, and API keys are your intellectual property and should remain secure on your machine.

- **No Code Uploads:** By default, DevDiff performs all AST parsing, diff extraction, and token evaluations locally on your workstation or runner environment.
- **No Telemetry or Tracking:** We do not collect, store, or transmit telemetry data, crash reports, CLI command execution logs, or repository usage statistics.

---

## 2. Data We Process (And Where It Goes)

### A. Local Model Processing

If you configure DevDiff to use local models (such as Ollama, llama.cpp, or Transformers.js):

- **Local Loop:** The code diff and prompt data remain entirely inside your local system memory and CPU/GPU loops. No data is sent over the Internet.

### B. Cloud Model Processing

If you explicitly configure cloud AI providers (such as OpenAI, Anthropic, or Google Gemini) in your `.devdiff.config.js` (or other config) file:

- **Direct Communication:** DevDiff transmits the pre-trimmed and redacted diff context directly to the respective API endpoints of those providers.
- **No Intermediaries:** We do not proxy these requests through our own servers. Your credentials (API keys) are loaded from your local environment variables directly into memory during execution.
- **Provider Policies:** Data transmitted to cloud providers is subject to their respective API privacy policies. (Most providers guarantee that data sent via APIs is not used for model training).

### C. Automated Redaction

Before any code context is transmitted to cloud models, DevDiff passes it through a local Regex-based scanner to redact detected credentials (e.g. AWS access keys, GitHub tokens, database passwords) to prevent accidental data leaks.

---

## 3. Cookies and Web Analytics

The documentation website (https://devdiff.vercel.app/) is hosted statically on Vercel.

- We do not use cookies or trackers.
- We do not store any personal data.

---

## 4. Updates to This Policy

We may update this Privacy Policy from time to time. Any changes will be published directly to this page and updated in our git history.
