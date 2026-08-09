# Slack Webhook & Plugin Integration

DevDiff integrates with Slack via incoming webhooks or using the official Slack Notifier Plugin ([`examples/plugins/slack-notifier/index.ts`](https://github.com/EldrexDelosReyesBula/DevDiff/tree/main/examples/plugins/slack-notifier/index.ts)) built with `@eldrex/plugin-sdk`.

---

## 🎯 Architecture

```mermaid
flowchart LR
    DevDiff[DevDiff CLI / Engine] -->|afterAnalysis Hook| Plugin[Slack Notifier Plugin]
    Plugin -->|HTTPS Post JSON| SlackWebhook[Slack Incoming Webhook URL]
    SlackWebhook -->|Notification| SlackChannel[#engineering-changelog Channel]
    
    style Plugin fill:#bbf,stroke:#333,stroke-width:2px
    style SlackChannel fill:#9f9,stroke:#333,stroke-width:2px
```

---

## 🚀 Setup via Plugin SDK

```typescript
import { SlackNotifierPlugin } from "./examples/plugins/slack-notifier";

// Register in .devdiff/config.json:
{
  "plugins": [
    "./examples/plugins/slack-notifier"
  ]
}
```
