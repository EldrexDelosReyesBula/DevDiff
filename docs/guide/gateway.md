# DevDiff Gateway

The **DevDiff Gateway** is a persistent server that speaks multiple protocols simultaneously, serving as the central hub for code intelligence.

## Protocol Matrix

| Protocol | Default Port | Description |
|---|---|---|
| **HTTP REST** | `3737` | Main API interface for standard web requests. |
| **WebSocket** | `3738` | Streaming updates and live change feed. |
| **MCP** | `3739` | Model Context Protocol for LLM agents. |
| **OpenClaw** | `3740` | Native interface for OpenClaw workflow runners. |
| **gRPC** | `3741` | High-performance RPC protocol. |

## REST API Endpoint Summary

- `GET /health` - Health state and process details.
- `GET /api/v1/status` - Returns list of connected adapters, watchers, and loaded skills.
- `POST /api/v1/analyze` - Triggers a synchronous, one-shot code analysis run.
- `POST /webhooks/github` - Handles incoming GitHub webhook events.
- `POST /webhooks/gitlab` - Handles incoming GitLab webhook events.
- `GET /api/v1/personas` - Lists registered AI output personalities.
- `GET /api/v1/skills` - Lists installed skills and pipelines.
