# Network Guard & Outbound Restrictions

DevDiff enforces a strict **zero-telemetry, zero-analytics, and zero-leakage** policy. To ensure that no data is transmitted without your consent, DevDiff includes a built-in **Network Guard**.

---

## What It Does

The Network Guard intercepts all outbound network calls from the DevDiff core engine before they are fired:

1. **Telemetry & Analytics Blocklist**: Domain-level hard blocking of all major analytics services (Mixpanel, Sentry, Datadog, Amplitude, posthog, etc.).
2. **Explicit Allowed List**: Restricts outgoing traffic strictly to:
   - Local hosts (e.g., `localhost` or `127.0.0.1` for local Ollama).
   - Your explicitly configured AI provider endpoints (e.g. OpenAI/Anthropic/Gemini).
   - The npm registry (only if version check is enabled).
   - User-defined webhooks.
3. **Auditing**: Every request and interception is logged synchronously to `.devdiff/audit/network.log` for audit trails.

---

## Real-Time Monitoring

You can inspect the network requests made by DevDiff in real-time by running:

```bash
devdiff monitor
```

### Example Monitor Output

```
┌─────────────────────────────────────────────────────────────┐
│  DEVDIFF NETWORK MONITOR — Press Ctrl+C to stop              │
│                                                             │
│  [12:34:56] HTTP GET registry.npmjs.org
│             → ALLOWED (CONFIGURED)
│
│  [12:35:12] HTTP POST localhost:11434/api/generate
│             → ALLOWED (LOCAL)
│
│  [12:35:44] HTTP POST api.mixpanel.com/track
│             → ATTEMPT BLOCKED (BLOCKED-TELEMETRY)
│             Domain api.mixpanel.com is blacklisted (telemetry/analytics)
```

---

## Blocked Domains List

The following telemetry domains are always blocked:
- `api.mixpanel.com`
- `api.amplitude.com`
- `sentry.io`
- `logrocket.com`
- `datadoghq.com`
- `newrelic.com`
- `google-analytics.com`
- `analytics.google.com`
- `segment.io`
- `segment.com`
- `heap.io`
- `posthog.com`
- `hotjar.com`
- `fullstory.com`
- `clarity.ms`
- `googletagmanager.com`
- *And many other advertising and tracker networks.*

---

## Privacy Disclosure

To see a complete disclosure of DevDiff filesystem, shell, network, and AI practices, run:

```bash
devdiff disclose
```
