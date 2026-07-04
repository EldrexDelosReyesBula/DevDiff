# AI Providers Overview

DevDiff supports multiple AI backends. You bring your own — DevDiff is just the orchestrator.

---

## Provider Comparison

| Provider             | Cost        | Privacy                   | Speed      | Quality    | Offline |
| -------------------- | ----------- | ------------------------- | ---------- | ---------- | ------- |
| **Ollama (Local)**   | Free        | ✅ 100% local             | Medium     | Good–Great | ✅ Yes  |
| **WebGPU (Browser)** | Free        | ✅ 100% local             | Fast (GPU) | Good       | ✅ Yes  |
| **OpenAI**           | Pay-per-use | ⚠️ Data sent to OpenAI    | Fast       | Excellent  | ❌ No   |
| **Anthropic**        | Pay-per-use | ⚠️ Data sent to Anthropic | Fast       | Excellent  | ❌ No   |
| **Custom**           | Varies      | Depends                   | Varies     | Varies     | Depends |

---

## Default Provider: Ollama

Ollama is the default and recommended provider. It runs entirely on your machine — no API keys, no data leaving your system, no costs.

```bash
# Install Ollama + pull a model
ollama pull llama3.2:3b

# DevDiff auto-detects it — no config needed
devdiff generate
```

→ [Full Ollama Setup Guide](./ollama-setup)

---

## Configuration

All providers are configured in `.devdiff.config.js`:

```javascript
export default {
  ai: {
    providers: [
      // DevDiff tries providers in priority order (lowest number first)
      { name: "local-ollama", url: "ollama://llama3.2:3b", priority: 1 },
      { name: "openai-fallback", url: "openai://gpt-4o-mini", priority: 2 },
    ],
  },
};
```

If the first provider fails (e.g., Ollama not running), DevDiff automatically tries the next one.

---

## Privacy Model

```
┌─────────────────────────────────────────────────────┐
│  LOCAL (100% Private)                               │
│  • Ollama — models run on your CPU/GPU              │
│  • WebGPU — models run in your browser GPU         │
│  • No data transmitted. No logs. No telemetry.     │
├─────────────────────────────────────────────────────┤
│  CLOUD (Data leaves your machine)                   │
│  • OpenAI — sent to OpenAI API                     │
│  • Anthropic — sent to Anthropic API               │
│  • Subject to their privacy policies               │
└─────────────────────────────────────────────────────┘
```

> **DevDiff's data classification engine** can automatically strip secrets, PII, and sensitive patterns before they're sent to any cloud provider. See [Security Model](/guide/security).

---

## Choosing a Provider

**Use Ollama if:**

- Privacy is your top priority
- You don't want API costs
- You want offline capability
- Your machine has 8GB+ RAM

**Use OpenAI/Anthropic if:**

- You need the highest quality analysis
- You're reviewing very complex security-sensitive diffs
- Your machine is underpowered for local models

**Use WebGPU if:**

- You're running DevDiff in a browser context
- You have a capable GPU and want maximum speed

---

## Provider Guides

- [Ollama (Local, Free)](./ollama-setup) — **recommended starting point**
- [OpenAI](./openai-setup) — GPT-4o, GPT-4o mini
- [Anthropic](./anthropic-setup) — Claude 3.5 Sonnet, Claude 3 Haiku
- [WebGPU (Browser)](./webgpu-setup) — browser-native inference
- [Custom Provider](./custom-provider) — build your own adapter
