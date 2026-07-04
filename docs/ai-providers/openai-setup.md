# OpenAI Setup

Use OpenAI's GPT models with DevDiff for the highest-quality changelog analysis.

> **Privacy Note:** When using OpenAI, your diff content is sent to OpenAI's servers. See [Privacy Guarantees](/guide/privacy) for how DevDiff's data classification engine protects sensitive data before transmission.

---

## Prerequisites

1. An [OpenAI account](https://platform.openai.com)
2. A paid OpenAI API plan (free tier has rate limits)
3. An API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

---

## Setup

### 1. Get Your API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Copy the key — it starts with `sk-`

### 2. Set the Environment Variable

```bash
# Add to your shell profile (.zshrc, .bashrc, etc.)
export OPENAI_API_KEY="sk-your-key-here"

# Or create a .env file in your project (DevDiff reads this automatically)
echo 'OPENAI_API_KEY=sk-your-key-here' >> .env
```

> **Never commit your API key to Git.** Add `.env` to your `.gitignore`.

### 3. Configure DevDiff

```javascript
// .devdiff.config.js
export default {
  ai: {
    providers: [
      {
        name: "openai-gpt4o",
        url: "openai://gpt-4o-mini", // Model to use
        priority: 1, // Try this first
      },
    ],
  },
};
```

### 4. Generate Changelog

```bash
devdiff generate
```

---

## Available Models

| Model         | Cost            | Speed  | Quality   | Best For                 |
| ------------- | --------------- | ------ | --------- | ------------------------ |
| `gpt-4o-mini` | ~$0.01/analysis | Fast   | Great     | Daily use, most diffs    |
| `gpt-4o`      | ~$0.10/analysis | Fast   | Excellent | Complex security reviews |
| `gpt-4-turbo` | ~$0.15/analysis | Medium | Excellent | Very large diffs         |

> Costs are estimates for a typical 200-line diff. Actual costs depend on token usage.

```javascript
// Use a specific model
{
  url: "openai://gpt-4o-mini";
}
{
  url: "openai://gpt-4o";
}
{
  url: "openai://gpt-4-turbo";
}
```

---

## Using OpenAI as a Fallback

The most common setup: use Ollama locally (free, private) and fall back to OpenAI when needed:

```javascript
// .devdiff.config.js
export default {
  ai: {
    providers: [
      { name: "local", url: "ollama://llama3.2:3b", priority: 1 },
      { name: "cloud-fallback", url: "openai://gpt-4o-mini", priority: 2 },
    ],
  },
};
```

DevDiff tries Ollama first. If it's not running, it falls back to OpenAI automatically.

---

## Cost Control

```javascript
// .devdiff.config.js — limit token usage
export default {
  ai: {
    providers: [
      {
        name: "openai",
        url: "openai://gpt-4o-mini",
        maxTokens: 1000, // Limit output length
        priority: 1,
      },
    ],
  },
};
```

---

## Troubleshooting

**"Invalid API key"**

```bash
# Verify your key is set
echo $OPENAI_API_KEY

# Test directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**"Insufficient quota"**

- Add payment method at [platform.openai.com/billing](https://platform.openai.com/billing)
- Or switch to `gpt-4o-mini` (cheapest model)

**"Rate limit exceeded"**

- DevDiff auto-retries with backoff
- Add Ollama as a local fallback provider
