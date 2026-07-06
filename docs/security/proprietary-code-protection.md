# Proprietary Code Protection

## How DevDiff Protects Your Intellectual Property

DevDiff is designed for proprietary, closed-source codebases. Your code 
is your competitive advantage. Here's how we protect it.

### 1. Local-First Architecture

By default, DevDiff uses local AI models (Ollama). Your source code 
**never leaves your machine**. Not even metadata.

### 2. Redaction Before Any External Call

If you configure a cloud AI provider, DevDiff redacts:
- API keys and tokens
- Connection strings
- Private keys
- Passwords and credentials
- Internal URLs and IPs
- PII (emails, phone numbers, SSNs)

The redaction happens **before** data is sent to any external service.

### 3. Configurable Data Classification

```javascript
// .devdiff.config.js
export default {
  privacy: {
    // Block specific file patterns from EVER being sent externally
    blockExternal: [
      '**/proprietary/**',
      '**/internal/**',
      '**/*.secret.*',
      '**/keys/**'
    ],
    
    // Redact these patterns from AI prompts
    customRedactions: [
      { pattern: 'ACME_CORP_SECRET_\\w+', replacement: '[REDACTED:Internal]' },
      { pattern: '\\d{3}-\\d{2}-\\d{4}', replacement: '[REDACTED:SSN]' }
    ]
  }
}
```

### 4. Audit Trail

Every external call is logged:

```bash
devdiff audit network
```

```
2026-07-05 14:23:01 | api.openai.com | 234 tokens sent | All secrets redacted | ✅
2026-07-05 14:23:01 | No source code sent externally | ✅
```

### 5. Air-Gapped Support

DevDiff works fully offline:

```bash
# Zero network calls — everything local
devdiff generate --local-only

# Verify no network activity
devdiff monitor
# (Press Ctrl+C after confirming 0 external requests)
```

### 6. Verification

You can verify all of this yourself:

```bash
# See every network call DevDiff makes
devdiff monitor

# See what data would be sent to AI
devdiff generate --dry-run --verbose

# Inspect the source code
git clone https://github.com/eldrex/devdiff
grep -r "fetch\|axios\|http.request" packages/core/src/
# You'll find: localhost Ollama calls, your configured providers, and nothing else
```
