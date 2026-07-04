# Privacy Guarantees

DevDiff is built around a simple promise: **your code stays on your machine by default.**

---

## What We Collect

### DevDiff Collects: Nothing

- ❌ No usage analytics
- ❌ No crash reports
- ❌ No telemetry
- ❌ No code snippets sent to us
- ❌ No account required

### What Goes Where

| Data | Destination | Condition |
|------|-------------|-----------|
| Your code diff | Your machine only | Always (with local AI) |
| Your code diff | OpenAI/Anthropic | Only if you configure cloud AI |
| Changelog output | Your machine only | Always |
| Config file | Your machine only | Always |
| Audit logs | `.devdiff/` folder | Local only |

---

## Local AI = Zero Transmission

When using **Ollama** or **WebGPU**:

```
Your diff → Your machine → AI model → Changelog
              (nothing sent over network)
```

Your code never leaves your computer. Not to us. Not to anyone.

---

## Cloud AI: What Gets Sent

If you choose to use OpenAI or Anthropic, your **diff text** is sent to their API over HTTPS. Specifically:

- The unified diff (changes only — not your full files)
- The DevDiff prompt template
- Optionally: metadata like persona and format

**What is NOT sent:**
- Your full source files
- Your git history
- Your config file
- Your API keys (handled client-side)

### Data Classification

Before any cloud transmission, DevDiff's data classification engine scans the diff and redacts:
- API keys, tokens, credentials
- Private keys and certificates
- Patterns that look like secrets

See [Security Overview](/security/overview) for the full list.

---

## Provider Privacy Policies

If using cloud AI, you're subject to the provider's privacy policy:

| Provider | Privacy Policy |
|----------|---------------|
| OpenAI | [openai.com/policies/privacy-policy](https://openai.com/policies/privacy-policy) |
| Anthropic | [anthropic.com/privacy](https://anthropic.com/privacy) |
| Ollama | No cloud — no policy needed |

> **Note:** Both OpenAI and Anthropic offer enterprise agreements that include enhanced privacy terms (no training on your data). Check their documentation if this matters to you.

---

## GDPR Compliance for DevDiff Users

If you process EU personal data in your codebase:

- **Local AI only**: No GDPR implications — data stays on-premise
- **Cloud AI**: Diffs sent to US-based providers may constitute a cross-border transfer under GDPR Chapter V
  - Solution: Use Ollama (local) for any diffs containing EU personal data

---

## Open Source = Auditable

DevDiff's source code is fully public. You can verify exactly what it does:

🔗 [github.com/EldrexDelosReyesBula/devdiff](https://github.com/EldrexDelosReyesBula/devdiff)

The data classification engine, provider adapters, and all network calls are in the source. No hidden telemetry is possible — you can see every outbound connection.

---

## DevDiff's Privacy Policy

For the complete legal document covering the [devdiff.vercel.app](https://devdiff.vercel.app) website:

→ [Privacy Policy](/privacy-policy)
