# Configuration

DevDiff is configured using a `.devdiff.config.json` or `.devdiff.config.yaml` file in the root of your repository.

## Configuration Schema

Here is a standard configuration mapping local models, formats, and batch parameters:

```json
{
  "ai": {
    "providers": [
      {
        "name": "ollama-local",
        "url": "ollama://llama3.2:3b",
        "priority": 1
      }
    ],
    "routing": {
      "strategy": "priority",
      "complexityThreshold": 0.6,
      "localOnly": true
    }
  },
  "exclude": [
    "**/node_modules/**",
    "pnpm-lock.yaml",
    "package-lock.json"
  ],
  "cache": {
    "enabled": true,
    "path": ".devdiff/cache.json"
  },
  "format": "markdown"
}
```
