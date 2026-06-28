# Bring Your Own AI (BYOAI)

DevDiff's core philosophy: **You control the AI, not us.**

## Provider Tiers

### 🏠 Local & Free (No API Keys)

| Provider | Setup | Best For |
|----------|-------|----------|
| **Ollama** | `ollama pull [model]` | macOS, Linux, Windows WSL |
| **llama.cpp** | Point to binary path | Custom builds, embedded systems |
| **Transformers.js** | Zero config | Node.js without native deps |
| **WebLLM** | Zero config | Browser-based, Chrome |

### ☁️ Self-Hosted (Your Servers)

| Provider | Config Key |
|----------|------------|
| **LocalAI** | `localai://localhost:8080` |
| **vLLM** | `vllm://localhost:8000` |
| **Text Generation Inference** | `tgi://localhost:3000` |
| **Ollama (remote)** | `ollama://my-server:11434` |

### 🌐 Cloud (Your API Keys)

| Provider | Config Key |
|----------|------------|
| OpenAI | `openai://gpt-4o-mini` |
| Anthropic | `anthropic://claude-3-haiku` |
| Google Gemini | `gemini://gemini-1.5-flash` |
| Groq | `groq://llama3-70b` |
| DeepSeek | `deepseek://deepseek-coder` |
| Together AI | `together://meta-llama/Llama-3-70b` |
| Fireworks AI | `fireworks://accounts/fireworks/models/llama-v3-70b` |

## Smart Routing

```js
// .devdiff.config.js
export default {
  ai: {
    providers: [
      {
        name: 'local-small',
        url: 'ollama://llama3.2:3b',
        maxTokens: 2000,
        priority: 1           // Try first
      },
      {
        name: 'local-big',
        url: 'ollama://llama3:70b',
        maxTokens: 8000,
        priority: 2           // Complex diffs
      },
      {
        name: 'cloud-cheap',
        url: 'openai://gpt-4o-mini',
        apiKey: process.env.OPENAI_API_KEY,
        maxTokens: 4000,
        priority: 3,          // Fallback
        maxDailyCost: 0.50    // Budget cap!
      }
    ],
    
    routing: {
      strategy: 'cost-aware',  // 'priority' | 'cost-aware' | 'latency'
      complexityThreshold: 0.6,
      localOnly: false
    }
  }
}
```

## Privacy Guarantees

When using local providers:
- ✅ Zero network requests for AI processing
- ✅ All diffs processed on-device
- ✅ No telemetry, no analytics, no tracking
- ✅ Audit log shows every AI call

When using cloud providers:
- ✅ Only structured diffs sent (not raw files)
- ✅ Automatic secret redaction
- ✅ Dry-run mode shows exactly what's sent
- ✅ `.devdiffignore` excludes sensitive paths
