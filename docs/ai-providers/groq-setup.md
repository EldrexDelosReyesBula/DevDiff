# Groq LPU Setup Guide

DevDiff integrates with Groq's Language Processing Unit (LPU) cloud engine (`groq://llama-3.1-70b-versatile`, `groq://llama-3.1-8b-instant`), enabling **sub-100ms ultra-fast changelog generation**.

---

## ⚙️ Configuration Setup

### `.devdiff.config.js` Setup

```javascript
export default {
  ai: {
    providers: [
      {
        name: "groq-cloud",
        url: "groq://llama-3.1-8b-instant",
        apiKey: process.env.GROQ_API_KEY,
        priority: 1
      }
    ]
  }
};
```

```bash
export GROQ_API_KEY="gsk_..."
devdiff generate --provider groq://llama-3.1-8b-instant
```
