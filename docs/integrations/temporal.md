# Temporal Durable Workflow Integration

For high-reliability enterprise continuous deployment pipelines, DevDiff provides durable background task scheduling in `@eldrex/core` using Temporal workflows.

---

## 🎯 Features

- **Durable Execution**: Long-running monorepo analysis tasks resume automatically after network interruptions.
- **Retry Safeguards**: Automatic exponential backoff retries on AI rate limit errors.
- **Audit Trails**: Durable execution history stored for compliance auditing.
