# Configuration Schema Reference

Detailed specification of `.devdiff.config.js` (and other `.devdiffrc`) parameters.

---

## 🤖 `ai` (AI Configurations)

The root configuration block for setting up model endpoints, API credentials, and query routing strategies.

### `ai.providers`
An array of AI provider settings. DevDiff queries providers based on their priority and routing strategy.
*   **Type:** `Array<ProviderObject>`
*   **Required:** Yes
*   **Properties of `ProviderObject`:**
    *   `name` (string, required): A unique, descriptive label for the provider (e.g. `"local-llama"`, `"cloud-gemini"`).
    *   `url` (string, required): The protocol/model connection string:
        *   Local Ollama: `ollama://[model-name]` (e.g. `ollama://llama3.2:3b`)
        *   OpenAI: `openai://[model-name]` (e.g. `openai://gpt-4o-mini`)
        *   Google Gemini: `gemini://[model-name]` (e.g. `gemini://gemini-1.5-flash`)
        *   Anthropic: `anthropic://[model-name]` (e.g. `anthropic://claude-3-haiku`)
    *   `apiKey` (string, optional): The API key for cloud models. (Tip: Use `process.env.VAR_NAME` to load keys securely from env vars).
    *   `priority` (number, required): Order of evaluation. DevDiff queries priority `1` first, falling back to larger values if needed.
    *   `maxTokens` (number, optional): Max response tokens limit.
    *   `maxDailyCost` (number, optional): Maximum budget (USD) for cloud requests per day.

---

## 🔀 `ai.routing` (Intelligent Router Settings)

Controls how DevDiff determines which model to use.

### `ai.routing.strategy`
*   **Type:** `string`
*   **Default:** `"priority"`
*   **Options:**
    *   `"priority"`: Queries providers in ascending order of `priority` values.
    *   `"cost"`: Attempts to route requests to the lowest-cost option first.
    *   `"latency"`: Directs requests to the fastest performing provider.

### `ai.routing.complexityThreshold`
The threshold (from `0.0` to `1.0`) above which complex code diffs are escalated to a more powerful cloud model.
*   **Type:** `number`
*   **Default:** `0.6`

### `ai.routing.localOnly`
When enabled, completely restricts all outgoing requests. DevDiff will only use local providers (like Ollama).
*   **Type:** `boolean`
*   **Default:** `true`

---

## 🚫 `exclude` (Ignore Paths)

A list of glob patterns representing files, directories, lockfiles, or binary assets to ignore during git diff generation.
*   **Type:** `Array<string>`
*   **Default:** `["node_modules/**", "dist/**", "build/**", "pnpm-lock.yaml", "package-lock.json"]`

---

## 💾 `cache` (Local Cache Settings)

DevDiff caches generated summaries of previously seen Git diff hashes locally to prevent unnecessary AI token charges.

### `cache.enabled`
*   **Type:** `boolean`
*   **Default:** `true`

### `cache.path`
The workspace path where the JSON cache is stored.
*   **Type:** `string`
*   **Default:** `".devdiff/cache.json"`

---

## 📝 `format` (Default Output Format)

Sets the default presentation style for changelogs.
*   **Type:** `string`
*   **Default:** `"markdown"`
*   **Options:** `"markdown"`, `"json"`, `"html"`
