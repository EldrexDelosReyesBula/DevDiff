# Secret Redaction Engine

DevDiff automatically scans and redacts API keys, credentials, and private keys from the diff text before sending it to local or cloud-hosted AI providers.

---

## 🔒 Redaction Capabilities (V2 Engine)

The `RedactionEngineV2` automatically scans staged changes and replaces matches with safe descriptors:

1. **API Keys & Tokens:**
   - OpenAI Keys (`sk-proj-...`) -> `[REDACTED:OpenAI-API-Key]`
   - Anthropic Keys (`sk-ant-...`) -> `[REDACTED:Anthropic-API-Key]`
   - GitHub Personal Access Tokens (`ghp_...`) -> `[REDACTED:GitHub-Token]`
   - AWS Access Key IDs (`AKIA...`) -> `[REDACTED:AWS-Access-Key]`

2. **JWT Tokens:**
   - Filters signed JSON Web Tokens (matching header structure `eyJhbGciOi...`) -> `[REDACTED:JWT-Token]`

3. **Database Connections:**
   - Detects URI connection formats (`postgres://`, `mongodb://`, etc.) -> `[REDACTED:Postgres-Connection]`

4. **Cryptographic Material:**
   - Blocks and masks private key blocks (such as PEM boundaries `-----BEGIN RSA PRIVATE KEY-----`) -> `[REDACTED:RSA-Private-Key]`

5. **Hardcoded Passwords:**
   - Recognizes assignments matching patterns like `password = "..."` or `"pass": "..."` -> `[REDACTED:Password]`
