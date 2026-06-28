# Configuration Guide

DevDiff supports flexible configuration using a `.devdiff.config.json` or `.devdiff.config.yaml` file located in the root directory of your repository. 

---

## Configuration Schema

Here is a full schema reference detailing all available options:

```json
{
  "ai": {
    "providers": [
      {
        "name": "ollama-local",
        "url": "ollama://llama3.2:3b",
        "priority": 1
      },
      {
        "name": "openai-cloud",
        "url": "openai://gpt-4o-mini",
        "apiKey": "sk-proj-...",
        "priority": 2
      }
    ],
    "routing": {
      "strategy": "priority",
      "complexityThreshold": 0.6,
      "localOnly": false
    }
  },
  "exclude": [
    "**/node_modules/**",
    "pnpm-lock.yaml",
    "package-lock.json",
    "dist/**",
    "*.log"
  ],
  "cache": {
    "enabled": true,
    "path": ".devdiff/cache.json"
  },
  "format": "markdown"
}
```

---

## Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `ai.providers` | `Array` | *Required* | A list of model provider endpoints and credentials. Supports local (`ollama://`) and cloud (`openai://`, `gemini://`, `anthropic://`). |
| `ai.routing.strategy` | `string` | `"priority"` | Strategy used by the Intelligent Router. Options: `'priority'`, `'cost'`, `'latency'`. |
| `ai.routing.complexityThreshold` | `number` | `0.6` | Complexity value above which changes trigger escalation to higher capacity models. |
| `ai.routing.localOnly` | `boolean` | `true` | When true, prevents the router from selecting any external cloud providers regardless of complexity. |
| `exclude` | `Array<string>` | `[]` | Glob patterns matching directories, lockfiles, or assets to ignore during git diff scans. |
| `cache.enabled` | `boolean` | `true` | When true, caches generated changelog outputs locally to prevent redundant LLM token costs. |
| `cache.path` | `string` | `".devdiff/cache.json"` | Path where the local cache file is stored. |
| `format` | `string` | `"markdown"` | Default output format for changelogs. Options: `'markdown'`, `'json'`, `'html'`. |

---

## Multiple Provider Failover (High Availability)

The DevDiff router supports failover chains. If a local model fails to respond or a cloud provider hits rate limits, the router automatically attempts the fallback chain:

```json
"providers": [
  {
    "name": "ollama-primary",
    "url": "ollama://llama3.2:3b",
    "priority": 1
  },
  {
    "name": "openai-fallback",
    "url": "openai://gpt-4o-mini",
    "priority": 2
  }
]
```

Under this configuration:
1. DevDiff initially routes requests to `ollama-primary`.
2. If the local Ollama service is offline or errors out, DevDiff immediately falls back to `openai-fallback` to complete the request seamlessly.
