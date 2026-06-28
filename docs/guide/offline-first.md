# Offline-First & Local-First Design

DevDiff is designed from the ground up to respect developer privacy and work reliably in offline environments (such as flights, remote areas, or secured company intranets).

## Local Execution Guarantees

1. **No External Telemetry**: DevDiff does not send telemetry, usage statistics, or crash reports to any external servers.
2. **Local AI Providers**: By using WebGPU, WebAssembly, or a local Ollama instance, all LLM inference happens entirely on your local machine.
3. **No Cloud Requirement**: DevDiff operates with zero costs and zero dependencies on cloud APIs.

## Config Configuration

To enforce local-first mode, ensure `localOnly` is enabled in your configuration:
```js
export default {
  ai: {
    routing: {
      strategy: 'priority',
      localOnly: true
    }
  }
}
```
If a cloud provider is used in `localOnly` mode, the `PrivacyEnforcer` will automatically block the request or fallback to local inference.
