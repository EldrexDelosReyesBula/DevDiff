# Slack Notifications

Deliver progressive and finalized changelogs straight to Slack channels.

## Setup

Enable the Slack output configuration in `gateway.config.json` with your Slack App Incoming Webhook URL:

```json
{
  "formats": ["slack"],
  "slack": {
    "webhookUrl": "https://hooks.slack.com/services/..."
  }
}
```
