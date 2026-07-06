# Compliance Audit Trail

DevDiff records comprehensive audit trails of all system operations, allowing security officers to review exactly what commands were run and what data left the workstation.

---

## 📊 Viewing the Audit Log

### AI Providers Audit Trail

Every time an AI model is called, DevDiff caches a record detailing:

- The timestamp of the call.
- The provider type and model tier.
- A summary of the generated output.

To display these logs, run:

```bash
devdiff audit
```

### Shell Operation Audit

DevDiff tracks local terminal command execution (like Git queries) to ensure transparent operations:

```bash
devdiff audit shell
```

### Network Access Audit

View all mapped ports, active binds, and target API endpoints used by DevDiff packages:

```bash
devdiff audit network
```
