# Linear Integration

Connect commits to Linear issues and automatically write summaries back.

## Setup

1. Enable Linear Webhook parser on the DevDiff Gateway.
2. Direct commits containing Linear ticket labels (e.g. `[PROJ-123]`) through the gateway.
3. The gateway will query the issue title and automatically update the ticket with the code change summary.
