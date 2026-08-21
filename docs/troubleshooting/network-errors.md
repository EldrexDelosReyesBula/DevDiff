# Network Errors

## Error: "ECONNREFUSED" / "fetch failed" / "Connection refused"

### What This Means

DevDiff cannot reach the AI provider. Either:

- Ollama is not running (most common)
- A cloud provider URL is wrong
- A firewall is blocking the connection

### Fix: Ollama Not Running

```bash
# Check if Ollama is running
# Windows:
Get-Process ollama -ErrorAction SilentlyContinue

# macOS/Linux:
ps aux | grep ollama

# Start Ollama
ollama serve

# Verify it's listening
curl http://localhost:11434/api/tags
# Should return JSON with model list
```

---

## Error: "ENOTFOUND" / "DNS resolution failed"

### What This Means

DevDiff can't resolve a hostname. Usually affects cloud providers (OpenAI, Anthropic).

### Fix

```bash
# Test DNS resolution
nslookup api.openai.com
nslookup api.anthropic.com

# If DNS fails, try Google's DNS
# Windows: Settings → Network → DNS → 8.8.8.8
# Linux:   echo 'nameserver 8.8.8.8' | sudo tee /etc/resolv.conf

# Test with explicit IP (last resort)
curl -H "Host: api.openai.com" https://104.18.6.192/v1/models
```

---

## Error: "SSL certificate failed" / "CERT_UNTRUSTED"

### What This Means

Your system's SSL certificates are outdated or a proxy is intercepting HTTPS.

### Fix

```bash
# Update certificates
# Linux (Debian/Ubuntu):
sudo apt update && sudo apt install ca-certificates

# macOS:
brew install ca-certificates

# Windows: Run Windows Update

# If behind a corporate proxy with SSL inspection:
export NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.crt
```

---

## Error: "Request timeout" / "ETIMEDOUT"

### What This Means

The AI provider is taking too long to respond. Common with:

- Large models on slow hardware
- Slow internet connection to cloud providers
- Server overload

### Fix

```javascript
// .devdiff.config.js — increase timeout
export default {
  ai: {
    timeout: 120000, // 2 minutes (default is 30 seconds)
    providers: [
      { name: "local-ollama", url: "ollama://llama3.2:3b", priority: 1 },
    ],
  },
};
```

Or switch to a smaller/faster model:

```bash
ollama pull llama3.2:1b   # Fastest, smallest
```

---

## Error: "429 Too Many Requests"

### What This Means

You've hit the rate limit for a cloud AI provider (OpenAI, Anthropic).

### Fix

```javascript
// .devdiff.config.js — add retry and fallback
export default {
  ai: {
    providers: [
      { name: "openai", url: "openai://gpt-4o-mini", priority: 1 },
      { name: "local-fallback", url: "ollama://llama3.2:3b", priority: 2 }, // Fallback
    ],
    retryOnRateLimit: true,
    retryDelay: 5000, // 5 seconds between retries
  },
};
```

---

## Error: "401 Unauthorized" / "Invalid API key"

### What This Means

Your cloud provider API key is missing, wrong, or expired.

### Fix

```bash
# Check your .env file
cat .env
# Should contain: OPENAI_API_KEY=sk-...

# Or set directly
export OPENAI_API_KEY="sk-your-actual-key-here"
export ANTHROPIC_API_KEY="sk-ant-your-key-here"

# Verify the key works
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

## Proxy / Corporate Network Issues

If you're behind a corporate proxy:

```bash
# Set proxy for npm
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Set proxy for curl/fetch
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
export NO_PROXY=localhost,127.0.0.1

# For Ollama specifically
export OLLAMA_HOST=http://localhost:11434
```

---

## Using DevDiff Completely Offline

If you have no internet access at all:

```bash
# Pre-pull the model while you have internet
ollama pull llama3.2:3b

# On the air-gapped machine, DevDiff works 100% offline
# as long as Ollama is running with a local model
devdiff generate   # ✅ Works offline
```

---

## Diagnosing Network Issues

```bash
# Check Ollama endpoint
curl -v http://localhost:11434/api/tags

# Check OpenAI connectivity
curl -v https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check Anthropic connectivity
curl -v https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```
