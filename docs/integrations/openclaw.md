# OpenClaw Integration

DevDiff integrates seamlessly with **OpenClaw** environments for local-first, privacy-respecting LLM routing and task offloading.

## Setup

Enable OpenClaw integration inside your configuration:

```js
export default {
  ai: {
    providers: [
      {
        name: 'openclaw-local',
        url: 'openclaw://localhost:8082',
        priority: 1
      }
    ]
  }
}
```

Once configured, DevDiff will route code explanation queries to your local OpenClaw task gateway.
