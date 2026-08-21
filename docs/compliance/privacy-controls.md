# Enterprise Privacy Controls & File Exclusion Rules

DevDiff provides enterprise security teams with granular controls to enforce privacy policies, restrict network access, and exclude sensitive files or directories from AI analysis.

---

## Enforcement Controls

### 1. Apply Preset Regulatory Compliance Rules

Enforce predefined regulatory constraints across a repository using the CLI:

```bash
# Apply strict GDPR compliance rules (forces local model usage & network lockdown)
devdiff compliance apply GDPR

# Apply SOC 2 compliance rules
devdiff compliance apply SOC2
```

---

## Workspace File Exclusion (`.devdiffignore`)

DevDiff respects standard `.gitignore` rules and workspace `.devdiffignore` files to ensure proprietary keys, certificates, and private directories are never processed:

```gitignore
# .devdiffignore
**/certs/**
**/*.pem
**/*.key
**/*.pfx
config/secrets.json
.env*
```

---

## Enforce Network Lockdown via Config

In `.devdiff/config.json`:

```json
{
  "security": {
    "networkLockdown": true,
    "redactionStrictness": "high",
    "blockUnencryptedSockets": true
  }
}
```
