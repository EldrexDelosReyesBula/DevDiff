# Privacy Controls

DevDiff is designed to be privacy-first. You retain complete control over how your code is processed.

---

## 🔒 Configuration Controls

### Disable Network Access Completely

To restrict DevDiff to local offline processing only, enforce a local compliance model:

```bash
# Force local-only operation by applying a compliance rule
devdiff compliance apply GDPR
```

This updates your `.devdiff.config.js` to block external network requests.

### Exclude Sensitive Files

Define patterns in your config to ensure sensitive files are never analyzed:

```javascript
// .devdiff.config.js
export default {
  exclude: ["**/certs/**", "**/*.pem", "**/*.key", "config/secrets.json"],
};
```
