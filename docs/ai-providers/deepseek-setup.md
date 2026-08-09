# DeepSeek AI Setup Guide

DevDiff supports DeepSeek models (`deepseek-coder`, `deepseek-chat`) via both local execution (Ollama) and the official DeepSeek cloud API endpoint.

---

## 🎯 DeepSeek Execution Modes

### Mode 1: Local Execution via Ollama (Offline & Free)

```bash
ollama pull deepseek-coder:6.7b
```

Configure `.devdiff.config.js`:

```javascript
export default {
  ai: {
    providers: [
      {
        name: "deepseek-local",
        url: "ollama://deepseek-coder:6.7b",
        baseUrl: "http://localhost:11434",
      },
    ],
  },
};
```

### Mode 2: DeepSeek Cloud API (OpenAI-Compatible Endpoint)

```javascript
export default {
  ai: {
    providers: [
      {
        name: "deepseek-cloud",
        url: "openai://deepseek-coder",
        baseUrl: "https://api.deepseek.com/v1",
        apiKey: process.env.DEEPSEEK_API_KEY,
      },
    ],
  },
};
```
