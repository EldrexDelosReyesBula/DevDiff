# Webhook API

DevDiff can send webhook notifications when changelogs are generated, compliance violations are detected, or vibe sessions are created.

---

## Configuration

```javascript
// .devdiff.config.js
export default {
  webhooks: [
    {
      url: "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
      events: ["generate.complete", "compliance.violation"],
      secret: process.env.WEBHOOK_SECRET, // Optional HMAC signing
    },
    {
      url: "https://your-app.com/devdiff-webhook",
      events: ["*"], // All events
      headers: {
        Authorization: `Bearer ${process.env.WEBHOOK_TOKEN}`,
      },
    },
  ],
};
```

---

## Events

| Event                  | Triggered When                            |
| ---------------------- | ----------------------------------------- |
| `generate.complete`    | A changelog is successfully generated     |
| `generate.failed`      | AI provider returned an error             |
| `compliance.violation` | A compliance check found violations       |
| `compliance.warning`   | A compliance check found warnings         |
| `vibe.checkpoint`      | A vibe session checkpoint is created      |
| `provider.fallback`    | Primary AI provider failed, fallback used |

---

## Payload Format

All webhook events use the same envelope:

```json
{
  "event": "generate.complete",
  "timestamp": "2026-07-01T05:00:00Z",
  "version": "1.0.6",
  "project": {
    "name": "my-project",
    "path": "/Users/me/my-project",
    "branch": "main"
  },
  "data": {/* event-specific data */}
}
```

---

### `generate.complete` Payload

```json
{
  "event": "generate.complete",
  "timestamp": "2026-07-01T05:00:00Z",
  "data": {
    "persona": "developer",
    "format": "markdown",
    "output": "## Changes — July 1, 2026\n\n### ✨ Added...",
    "metadata": {
      "model": "llama3.2:3b",
      "tokensUsed": 847,
      "duration": 3240,
      "filesChanged": 3,
      "linesAdded": 47,
      "linesRemoved": 12
    }
  }
}
```

---

### `compliance.violation` Payload

```json
{
  "event": "compliance.violation",
  "timestamp": "2026-07-01T05:00:00Z",
  "data": {
    "framework": "gdpr",
    "score": 72,
    "violations": [
      {
        "rule": "data-retention",
        "severity": "high",
        "description": "Session duration extended without DPO review",
        "file": "src/auth/session.ts",
        "recommendation": "Consult DPO before deploying"
      }
    ]
  }
}
```

---

## Slack Integration

Use the built-in Slack formatter:

```javascript
export default {
  webhooks: [
    {
      url: process.env.SLACK_WEBHOOK_URL,
      events: ["generate.complete"],
      format: "slack", // Formats as Slack Block Kit message
      channel: "#releases",
    },
  ],
};
```

This sends a nicely formatted Slack message with the changelog summary.

---

## Verifying Webhook Signatures

If you set a `secret`, DevDiff signs every request with HMAC-SHA256:

```javascript
// Your server (Express.js example)
import crypto from "crypto";

app.post("/devdiff-webhook", (req, res) => {
  const signature = req.headers["x-devdiff-signature"];
  const body = JSON.stringify(req.body);

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", process.env.WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

  if (signature !== expected) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Process webhook...
  res.json({ ok: true });
});
```

---

## Testing Webhooks

```bash
# Send a test event to your webhook
devdiff webhook test --url https://your-app.com/devdiff-webhook --event generate.complete

# List configured webhooks
devdiff webhook list

# View recent webhook delivery history
devdiff webhook history
```

---

## Retry Policy

If your webhook endpoint returns a non-2xx status, DevDiff retries:

| Attempt   | Delay      |
| --------- | ---------- |
| 1st retry | 30 seconds |
| 2nd retry | 5 minutes  |
| 3rd retry | 30 minutes |

After 3 failures, the event is logged locally in `.devdiff/webhook-failures.jsonl`.
