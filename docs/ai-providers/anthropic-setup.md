# Anthropic Setup

Use Anthropic's Claude models with DevDiff for nuanced, safety-aware changelog analysis.

> **Privacy Note:** When using Anthropic, your diff content is sent to Anthropic's servers. See [Privacy Guarantees](/guide/privacy) for how DevDiff's data classification engine protects sensitive data before transmission.

---

## Prerequisites

1. An [Anthropic account](https://console.anthropic.com)
2. An API key from [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

---

## Setup

### 1. Get Your API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Navigate to **Settings** → **API Keys**
3. Click **Create Key**
4. Copy the key — it starts with `sk-ant-`

### 2. Set the Environment Variable

```bash
# Add to your shell profile
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Or create a .env file
echo 'ANTHROPIC_API_KEY=sk-ant-your-key-here' >> .env
```

> **Never commit your API key to Git.** Add `.env` to your `.gitignore`.

### 3. Configure DevDiff

```javascript
// .devdiff.config.js
export default {
  ai: {
    providers: [
      {
        name: 'anthropic-claude',
        url: 'anthropic://claude-3-5-haiku-20241022',
        priority: 1
      }
    ]
  }
}
```

### 4. Generate Changelog

```bash
devdiff generate
```

---

## Available Models

| Model | Cost | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| `claude-3-5-haiku-20241022` | Very low | Very fast | Great | Daily use, most diffs |
| `claude-3-5-sonnet-20241022` | Medium | Fast | Excellent | Complex analysis |
| `claude-opus-4-5` | High | Medium | Best | Deep architectural reviews |

```javascript
// Use a specific model
{ url: 'anthropic://claude-3-5-haiku-20241022' }
{ url: 'anthropic://claude-3-5-sonnet-20241022' }
```

---

## Why Use Claude for Changelogs?

Claude models excel at:
- **Long context** — handles large diffs without truncation
- **Nuanced reasoning** — explains *why* a change matters, not just *what* changed
- **Safety-aware** — naturally flags security-sensitive changes
- **Structured output** — reliably follows the changelog format

---

## Using Claude as a Fallback

```javascript
// .devdiff.config.js
export default {
  ai: {
    providers: [
      { name: 'local', url: 'ollama://llama3.2:3b', priority: 1 },
      { name: 'anthropic', url: 'anthropic://claude-3-5-haiku-20241022', priority: 2 }
    ]
  }
}
```

---

## Troubleshooting

**"Invalid API key"**
```bash
echo $ANTHROPIC_API_KEY

# Test directly
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-haiku-20241022","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
```

**"Credit balance too low"**
- Add credits at [console.anthropic.com/billing](https://console.anthropic.com/billing)
- Switch to `claude-3-5-haiku` (most affordable)

**"Overloaded"**
- Anthropic API can be busy during peak hours
- DevDiff auto-retries
- Add Ollama as a local fallback
