# Use Cases: Enterprise Development Teams

Enterprise teams operate under strict data privacy regulations, compliance audits, and security guidelines. DevDiff is designed from the ground up to support these needs.

---

## Key Benefits for Enterprises

### 1. 100% Local AI (No Cloud Dependency)
By pairing DevDiff with a local LLM via **Ollama**, your source code, metadata, and git diffs never leave the developer's workstation.
- Zero risk of cloud data leakage.
- Compliant with internal security policies.

### 2. Built-in Security Audits & Network Guard
All core actions, shell command executions, and network requests are monitored:
- Outbound connections to unauthorized servers or analytics platforms are blocked by **Network Guard**.
- All shell executions are recorded to `.devdiff/audit/shell.log`.
- Encrypted audit logs can be configured for tamper-evidence.

### 3. Compliance Frameworks
Enterprise code must comply with regulations. DevDiff's compliance engine checks code diffs against major frameworks:
- **GDPR**: Flags additions of unprotected personal data fields.
- **OWASP**: Scans code changes for common web application security risks.
- **HIPAA/SOC2**: Identifies access control or logging modifications.

---

## Deployment Configuration

For enterprise setups, we recommend enforcing local-only executions:

```javascript
// .devdiff.config.js
export default {
  ai: {
    routing: {
      localOnly: true // Enforces that only localhost/ollama models can be used
    }
  },
  updates: {
    checkForUpdates: false // Disables updates check to registry.npmjs.org
  }
}
```
