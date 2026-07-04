# Compliance Frameworks

DevDiff can automatically analyze your changes against 10 major compliance frameworks and generate audit-ready reports.

---

## Supported Frameworks

| Framework | Use Case |
|-----------|----------|
| **GDPR** | EU personal data protection |
| **CCPA** | California consumer privacy |
| **HIPAA** | US healthcare data |
| **SOC 2** | Security, availability, and confidentiality |
| **PCI DSS** | Payment card data security |
| **FedRAMP** | US federal cloud security |
| **ISO 27001** | Information security management |
| **NIST CSF** | Cybersecurity framework |
| **OWASP Top 10** | Web application security risks |
| **CIS Controls** | Center for Internet Security benchmarks |

---

## Quick Start

```bash
# List available frameworks
devdiff compliance list

# Apply a compliance persona for analysis
devdiff generate --persona compliance

# Generate a framework-specific report
devdiff compliance check --framework gdpr
devdiff compliance check --framework hipaa
devdiff compliance check --framework soc2
```

---

## Compliance Check Output

```bash
devdiff compliance check --framework gdpr
```

```
🔍 Analyzing changes against GDPR requirements...

## GDPR Compliance Check — July 1, 2026

### ✅ Compliant
- No new personal data fields detected
- Encryption at rest: unchanged (AES-256)
- Audit logging: present

### ⚠️ Review Required
- **Session duration extended to 7 days**
  → Article 5(1)(e): Data minimization principle
  → Recommendation: Update data retention policy documentation
  → Owner: Data Protection Officer

### ❌ Violations
None detected.

### Required Actions
1. DPO review of session retention change
2. Update DPIA if session data is in scope
3. Document in Record of Processing Activities

Compliance Score: 94/100
```

---

## Configuration

```javascript
// .devdiff.config.js
export default {
  compliance: {
    frameworks: ['gdpr', 'soc2'],      // Auto-check on every generate
    strictMode: false,                  // Fail generate if violations found
    reportPath: './compliance-reports', // Save reports here
    notifications: {
      slack: process.env.SLACK_WEBHOOK_URL,
      email: 'compliance@yourcompany.com'
    }
  }
}
```

---

## Apply Compliance Rules

The `apply` command sets up ongoing monitoring:

```bash
# Apply GDPR monitoring to your project
devdiff compliance apply gdpr

# Apply multiple frameworks
devdiff compliance apply gdpr hipaa soc2

# This creates .devdiff/compliance/ with rule definitions
```

---

## CI/CD Integration

Add compliance checks to your pipeline:

```yaml
# .github/workflows/compliance.yml
name: Compliance Check
on: [pull_request]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @eldrex/cli
      - run: devdiff compliance check --framework gdpr --fail-on violations
```

---

## Generating Audit Reports

```bash
# Full compliance report for auditors
devdiff generate --persona compliance --format json > audit-$(date +%Y%m%d).json

# Human-readable audit summary
devdiff generate --persona compliance --format markdown > audit-report.md

# SBOM generation (Software Bill of Materials)
devdiff compliance sbom --format spdx > sbom.spdx.json
```

---

## Framework Details

### GDPR
Checks for: personal data handling, consent mechanisms, right-to-erasure compliance, data retention changes, cross-border data transfer.

### HIPAA
Checks for: PHI (Protected Health Information) handling, access controls, audit logging, encryption requirements.

### SOC 2
Checks for: availability controls, confidentiality measures, processing integrity, security changes.

### OWASP Top 10
Checks for: injection vulnerabilities, broken authentication, security misconfigurations, using components with known vulnerabilities.

---

## False Positives

DevDiff's compliance analysis is AI-based and may flag issues that aren't actual violations. Always have a qualified professional review flagged items.

```javascript
// .devdiff.config.js — suppress known false positives
export default {
  compliance: {
    suppressions: [
      {
        framework: 'gdpr',
        rule: 'session-duration',
        reason: 'DPO approved on 2026-06-15 (ticket: LEGAL-42)',
        until: '2027-01-01'
      }
    ]
  }
}
```
