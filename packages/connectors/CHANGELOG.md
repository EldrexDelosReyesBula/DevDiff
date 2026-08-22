# @eldrex/connectors

## 1.8.0

### Minor Changes

- **Streamlined Delivery Pipeline**: Reduced payload serialization latency for webhook distribution.
- **Connection Retry Guard**: Circuit-breaker pattern prevents cascading retries during external webhook outages.

---

## 1.7.0

### Minor Changes

- **Prompt Export Destination**: Added connector endpoints for exporting changelogs directly to team chat channels.

---

## 1.6.0

### Major Changes

- **Connector Registry v2**: Unified connector registry (`registry.ts`) with typed `ConnectorManifest` definitions and Zod-validated connector configuration schemas.
- **5 Production-Ready Connectors**:
  - **Slack**: Webhook-based changelog delivery with block kit message formatting and persona-aware content.
  - **Discord**: Embed-based changelog posting with color-coded severity indicators.
  - **Microsoft Teams**: Adaptive card connector with diff summary cards.
  - **Telegram**: Bot API connector for real-time changelog notifications.
  - **WhatsApp (Twilio)**: Twilio-powered WhatsApp Business API connector.
- **Streaming Delivery Support**: All webhook connectors now support chunked streaming delivery for large changelogs.
- **Retry & Backoff**: Exponential backoff with jitter for all connector webhook calls (3 retries, 2s/4s/8s intervals).
- Added `publishConfig.access: "public"` for npm scoped package publishing.
- Added `repository` field pointing to monorepo directory `packages/connectors`.

### Minor Changes

- Connector output is persona-filtered before delivery — `ceo` persona delivers executive summary cards, `developer` persona delivers full technical diff blocks.
- Added `ConnectorContext.dryRun` flag — simulates delivery without sending real webhook calls.
- Added `@eldrex/connectors/slack`, `@eldrex/connectors/discord` sub-path exports for selective imports.

### Patch Changes

- Fixed Slack connector block kit payload exceeding 3000 character limit — now chunks large changelogs across multiple messages.
- Fixed Discord embed field count exceeding 25-field limit.
