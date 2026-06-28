# Configuration Schema Reference

Detailed specification of `.devdiff.config.json` parameters.

- **`ai.providers`**: Array of models and endpoints.
- **`ai.routing.strategy`**: `'priority' | 'cost' | 'latency'`.
- **`exclude`**: Array of glob pattern file matches to ignore.
- **`cache.enabled`**: Toggle local hashes caching.
- **`format`**: `'markdown' | 'json' | 'html'`.
