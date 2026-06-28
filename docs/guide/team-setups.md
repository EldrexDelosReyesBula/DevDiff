# Team Setups & Enterprise Deployment

When scaling DevDiff across multiple development teams and code repositories, running individual CLI commands can become difficult to manage. For teams, we recommend deploying a centralized **DevDiff Gateway** daemon.

---

## The Gateway Model Architecture

The DevDiff Gateway acts as a central automation hub. It listens to git events from all repositories, schedules processing jobs through a priority queue, and routes custom formatted changelogs to your team's chat networks:

```
[Repo A: Push Event] ──┐
[Repo B: Push Event] ──┼──> [ DevDiff Gateway ] ──> [ AST & AI processing ] ──> [Slack Channel]
[Repo C: Push Event] ──┘
```

---

## Step 1: Deploy the Gateway Service

Start the gateway server on a shared server in your network or cloud infrastructure:

```bash
npx @eldrex/gateway
```
By default, this launches the multi-protocol engine running:
-   **HTTP Router:** Port `3737` (for REST calls and webhook parsing).
-   **WebSocket Server:** Port `3738` (for live event subscriptions).
-   **MCP Server:** Port `3739` (for Model Context Protocol clients).

---

## Step 2: Configure `gateway.config.json`

Define standard models, personas, and output channels for the entire organization in a central config file:

```json
{
  "httpPort": 3737,
  "authToken": "org-secure-secret-token-123",
  "queue": {
    "strategy": "per-repo-sequential",
    "maxConcurrent": 4,
    "maxConcurrentPerRepo": 1
  },
  "defaultConfig": {
    "ai": {
      "providers": [
        {
          "name": "corporate-llm",
          "url": "openai://gpt-4o-mini",
          "apiKey": "sk-proj-..."
        }
      ]
    },
    "formats": ["slack"],
    "slack": {
      "webhookUrl": "https://hooks.slack.com/services/T00/B00/X00"
    }
  }
}
```

---

## Step 3: Connect Repositories via Webhooks

Configure webhook triggers in your code hosting provider (GitHub/GitLab) to notify the gateway automatically:

1.  Navigate to your repository settings on GitHub or GitLab.
2.  Add a new Webhook pointing to your gateway host:
    `http://<your-gateway-host>:3737/webhooks/github` (or `/webhooks/gitlab`).
3.  Set content type to `application/json`.
4.  Configure the payload secret matching your gateway's `authToken`.
5.  Select **Push** and **Pull Request** events as triggers.

---

## Step 4: Access Control & Authorization

To verify incoming requests, the gateway verifies authorization headers:
-   All watcher clients or curl triggers must supply the header: `Authorization: Bearer org-secure-secret-token-123`.
-   If signatures do not match, the gateway rejects request processing with a `401 Unauthorized` status.
