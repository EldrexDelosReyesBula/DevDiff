# Secret Redaction Engine (V2)

DevDiff includes an automated, high-entropy secret detection and redaction engine (`RedactionEngineV2`). Before any code diff, git commit summary, or codebase AST snippet is processed by an LLM provider (Ollama, OpenAI, Anthropic, Gemini, WebGPU) or returned via MCP, DevDiff scans and masks all API keys, private keys, database credentials, and personal tokens.

---

## 🎯 Architecture & Workflow

```mermaid
flowchart TD
    A[Raw Source Code / Git Diff] --> B[RedactionEngineV2 Scanner]
    B -->|Regex Pattern Matching| C[Pattern Engine]
    B -->|Shannon Entropy Analysis| D[Entropy Engine]
    C --> E{Secret Detected?}
    D --> E
    E -->|Yes| F[Mask with Replacement Token]
    E -->|No| G[Clean Text Stream]
    F --> H[Sanitized Payload to LLM / MCP]
    G --> H

    style F fill:#f99,stroke:#333,stroke-width:2px
    style H fill:#9f9,stroke:#333,stroke-width:2px
```

---

## 🔒 Redaction Rules & Supported Credentials

`RedactionEngineV2` enforces built-in detection patterns across 5 core credential categories:

### 1. API Keys & Authentication Tokens

- **OpenAI API Keys**: `sk-proj-[A-Za-z0-9-_]+` $\rightarrow$ `[REDACTED:OpenAI-API-Key]`
- **Anthropic API Keys**: `sk-ant-api[0-9]{2}-[A-Za-z0-9-_]+` $\rightarrow$ `[REDACTED:Anthropic-API-Key]`
- **GitHub PATs**: `ghp_[A-Za-z0-9]{36}` / `github_pat_[A-Za-z0-9_]{82}` $\rightarrow$ `[REDACTED:GitHub-Token]`
- **AWS Access Keys**: `AKIA[0-9A-Z]{16}` $\rightarrow$ `[REDACTED:AWS-Access-Key]`
- **Google Cloud API Keys**: `AIzaSy[A-Za-z0-9-_]{33}` $\rightarrow$ `[REDACTED:GCP-API-Key]`
- **Stripe Secret Keys**: `sk_live_[0-9a-zA-Z]{24}` $\rightarrow$ `[REDACTED:Stripe-Secret-Key]`

### 2. JSON Web Tokens (JWT)

- **Signed Tokens**: Matches 3-part base64 encoded JWT headers starting with `eyJhbGciOi...` $\rightarrow$ `[REDACTED:JWT-Token]`

### 3. Database Connection Strings

- **Database URIs**: Recognizes `postgres://`, `postgresql://`, `mongodb://`, `mongodb+srv://`, `mysql://`, `redis://` connection URIs containing embedded passwords $\rightarrow$ `[REDACTED:Database-Connection]`

### 4. Cryptographic Material & Private Keys

- **PEM Boundaries**: Scans for `-----BEGIN RSA PRIVATE KEY-----`, `-----BEGIN OPENSSH PRIVATE KEY-----`, `-----BEGIN PRIVATE KEY-----` $\rightarrow$ `[REDACTED:Private-Key]`

### 5. Hardcoded Assignment Credentials

- **Password & Secret Assignments**: Scans assignments like `password = "..."`, `secret: "..."`, `api_key: "..."` $\rightarrow$ `[REDACTED:Password]`

---

## ⚙️ Custom Redaction Rules & Configuration

Developers and security teams can configure custom regex patterns or extend redaction rules in `.devdiff/config.json`:

```json
{
  "security": {
    "redaction": {
      "enabled": true,
      "customPatterns": [
        {
          "name": "Internal-Bearer-Token",
          "regex": "Bearer [A-Za-z0-9\\-_\\.=]{40,}",
          "replacement": "[REDACTED:Internal-Bearer-Token]"
        }
      ],
      "ignoredKeys": ["example_api_key_placeholder"]
    }
  }
}
```

---

## 🧪 Verification & Usage Example

```typescript
import { RedactionEngineV2 } from "@eldrex/core";

const rawDiff = `
  const apiKey = "sk-proj-998877665544332211";
  const dbUri = "postgres://admin:secret123@localhost:5432/prod_db";
`;

const cleanDiff = RedactionEngineV2.redact(rawDiff);
console.log(cleanDiff);
/*
  const apiKey = "[REDACTED:OpenAI-API-Key]";
  const dbUri = "[REDACTED:Database-Connection]";
*/
```
