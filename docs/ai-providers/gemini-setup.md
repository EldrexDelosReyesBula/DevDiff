# Google Gemini Setup Guide

DevDiff integrates with Google's Gemini models (`gemini-1.5-flash`, `gemini-1.5-pro`) via Google AI Studio API credentials, offering massive context windows for monorepo diffs.

---

## Configuration Setup

### `.devdiff.config.js` Setup

```javascript
export default {
  ai: {
    providers: [
      {
        name: "gemini-cloud",
        url: "gemini://gemini-1.5-flash",
        apiKey: process.env.GEMINI_API_KEY,
        priority: 1,
      },
    ],
  },
};
```

### Environment Variable Setup

```bash
export GEMINI_API_KEY="AIzaSy..."
devdiff generate --provider gemini://gemini-1.5-flash
```
