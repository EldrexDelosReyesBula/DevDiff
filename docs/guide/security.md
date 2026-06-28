# Security Model & Policy

Security is built into DevDiff from the ground up, guaranteeing that sensitive source code, tokens, and credentials are protected throughout the ingestion and AI-processing pipelines.

---

## 1. Local-First Security Boundary

DevDiff operates under a **local-first default policy**:
-   **No Telemetry:** We do not collect product telemetry, usage statistics, or log files.
-   **Local Processing:** AST parsing, file token counting, and diff generation are completed entirely on your local machine.
-   **BYOAI Privacy:** If configured to use Ollama, WebLLM, or Transformers.js, your code never exits your local loop. No external networks are called.

---

## 2. Automated Secrets Redaction

To prevent accidental data leakage to cloud AI providers, the DevDiff pipeline includes an automated pre-processor scanner. This scanner intercepts diff text and checks for known security signatures:

*   **API Tokens & Keys:** Matches AWS access keys, GitHub personal tokens, Slack webhooks, OpenAI keys, and generic private credentials.
*   **Database Credentials:** Detects connection strings containing passwords (e.g. `mysql://user:pass@host`).
*   **Private Keys:** Identifies RSA, SSH, and SSL private key block boundaries.

### Redaction Example

Before sending data to the AI model, any matched secrets are immediately swapped for a placeholder:

```diff
- const STRIPE_KEY = "sk_live_51Habcdefg..."
+ const STRIPE_KEY = "[REDACTED_STRIPE_KEY]"
```

---

## 3. Input Sanitization & Validation

-   **Prompt Injection Safeguards:** System prompts are isolated and structured to prevent changes from altering the core instruction set (e.g. instructing the model to ignore formatting rules).
-   **Mermaid Node Sanitizer:** Enforces alphanumeric-only node declarations, escaping, and reserved word prefixes to prevent the rendering of corrupted or malicious graph syntax.

---

## 4. Gateway Authorization & Rate Limiting

When deploying the central DevDiff Gateway service across a team:
-   **Bearer Token Authorization:** Secure endpoints require valid authorization header checks to accept watchers or webhooks.
-   **Token Bucket Rate Limiting:** Enforces request quotas per incoming IP or webhook source to protect the server from Denial of Service (DoS) attacks and prevent API token exhaustion.
