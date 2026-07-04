# Custom Provider

Build your own AI provider adapter to connect DevDiff to any LLM API — Azure OpenAI, AWS Bedrock, Google Gemini, a self-hosted model, or any OpenAI-compatible endpoint.

---

## OpenAI-Compatible Endpoints

If your provider is OpenAI-compatible (uses the same API format), use the `openai-compatible` adapter:

```javascript
// .devdiff.config.js
export default {
  ai: {
    providers: [
      {
        name: 'azure-openai',
        url: 'openai-compatible://your-deployment-name',
        baseURL: 'https://your-resource.openai.azure.com/openai/deployments/',
        apiKey: process.env.AZURE_OPENAI_KEY,
        apiVersion: '2024-02-15-preview',
        priority: 1
      }
    ]
  }
}
```

**Works with:**
- Azure OpenAI Service
- AWS Bedrock (via OpenAI-compatible proxy)
- LM Studio (`http://localhost:1234/v1`)
- LocalAI (`http://localhost:8080/v1`)
- vLLM servers
- Any OpenAI-compatible API

---

## LM Studio Example

[LM Studio](https://lmstudio.ai) runs models locally with an OpenAI-compatible API:

```javascript
export default {
  ai: {
    providers: [
      {
        name: 'lmstudio',
        url: 'openai-compatible://local-model',
        baseURL: 'http://localhost:1234/v1',
        apiKey: 'lm-studio',   // LM Studio accepts any key
        priority: 1
      }
    ]
  }
}
```

---

## Azure OpenAI Example

```bash
# Set environment variables
export AZURE_OPENAI_KEY="your-azure-key"
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
```

```javascript
// .devdiff.config.js
export default {
  ai: {
    providers: [
      {
        name: 'azure-gpt4',
        url: 'openai-compatible://gpt-4o-deployment',
        baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/`,
        apiKey: process.env.AZURE_OPENAI_KEY,
        apiVersion: '2024-02-15-preview',
        priority: 1
      }
    ]
  }
}
```

---

## Writing a Full Custom Provider

For providers that don't follow the OpenAI API format, you can write a full adapter:

```javascript
// my-provider.js
export default {
  name: 'my-custom-llm',

  /**
   * Called once when DevDiff starts
   */
  async initialize(config) {
    this.baseURL = config.baseURL || 'http://localhost:8080';
    this.model = config.model || 'default';
  },

  /**
   * Called for each diff analysis request
   * @param {string} prompt - The formatted diff + instruction prompt
   * @returns {string} - The AI-generated changelog text
   */
  async generate(prompt) {
    const response = await fetch(`${this.baseURL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Provider error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || data.content || data.text;
  },

  /**
   * Optional: health check
   * @returns {boolean}
   */
  async isAvailable() {
    try {
      const res = await fetch(`${this.baseURL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }
}
```

Register it in your config:

```javascript
// .devdiff.config.js
import myProvider from './my-provider.js';

export default {
  ai: {
    providers: [
      {
        name: 'my-custom',
        adapter: myProvider,
        baseURL: 'http://my-llm-server:8080',
        model: 'my-model-name',
        priority: 1
      }
    ]
  }
}
```

---

## Google Gemini Example

```bash
export GEMINI_API_KEY="your-gemini-key"
```

```javascript
// gemini-provider.js
export default {
  name: 'gemini',

  async initialize(config) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    this.model = config.model || 'gemini-1.5-flash';
  },

  async generate(prompt) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}
```

---

## Provider Interface Reference

```typescript
interface DevDiffProvider {
  name: string;

  // Required
  initialize(config: ProviderConfig): Promise<void>;
  generate(prompt: string): Promise<string>;

  // Optional
  isAvailable?(): Promise<boolean>;
  onError?(error: Error): Promise<void>;
}

interface ProviderConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  timeout?: number;
  maxTokens?: number;
  [key: string]: unknown;
}
```
