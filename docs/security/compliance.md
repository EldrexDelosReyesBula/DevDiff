# Compliance Frameworks

DevDiff supports analysis against 10 major compliance frameworks. This page describes what each framework checks.

---

## Supported Frameworks

```bash
devdiff compliance list
```

| ID         | Framework                                           | Focus                                   |
| ---------- | --------------------------------------------------- | --------------------------------------- |
| `gdpr`     | General Data Protection Regulation                  | EU personal data                        |
| `ccpa`     | California Consumer Privacy Act                     | CA consumer privacy                     |
| `hipaa`    | Health Insurance Portability and Accountability Act | Healthcare PHI                          |
| `soc2`     | SOC 2 (AICPA)                                       | Security, availability, confidentiality |
| `pci-dss`  | Payment Card Industry Data Security Standard        | Payment card data                       |
| `fedramp`  | Federal Risk and Authorization Management Program   | US federal cloud                        |
| `iso27001` | ISO/IEC 27001:2022                                  | Information security management         |
| `nist-csf` | NIST Cybersecurity Framework 2.0                    | Cybersecurity risk                      |
| `owasp`    | OWASP Top 10                                        | Web app security vulnerabilities        |
| `cis`      | CIS Controls v8                                     | Internet security benchmarks            |

---

## GDPR

**Use when:** Your product handles EU residents' personal data.

**What DevDiff checks:**

- New fields that look like personal data (names, emails, IPs, health data)
- Changes to data retention logic
- Authentication and access control modifications
- Encryption changes
- Cookie or tracking additions
- Cross-border data transfer patterns

```bash
devdiff compliance check --framework gdpr
```

---

## HIPAA

**Use when:** Your software handles Protected Health Information (PHI).

**What DevDiff checks:**

- PHI field additions or modifications
- Access control and authentication changes
- Audit logging coverage
- Encryption at rest/in transit changes
- De-identification logic changes

```bash
devdiff compliance check --framework hipaa
```

---

## SOC 2

**Use when:** You need to demonstrate security controls to enterprise customers.

**What DevDiff checks (by Trust Service Criteria):**

- **CC6** — Logical access controls
- **CC7** — System monitoring
- **A1** — Availability controls
- **C1** — Confidentiality controls
- **PI1** — Processing integrity

```bash
devdiff compliance check --framework soc2
```

---

## PCI DSS

**Use when:** Your application stores, processes, or transmits payment card data.

**What DevDiff checks:**

- Credit card number patterns in code or logs
- Encryption of cardholder data
- Authentication strength changes
- Network access control changes
- Audit trail modifications

```bash
devdiff compliance check --framework pci-dss
```

---

## OWASP Top 10

**Use when:** You want to catch common web application vulnerabilities in your changes.

**What DevDiff checks:**

- A01: Broken access control patterns
- A02: Cryptographic failures
- A03: Injection vulnerabilities (SQL, command, LDAP)
- A05: Security misconfiguration
- A06: Vulnerable/outdated components (dependency updates)
- A07: Authentication failures
- A09: Logging/monitoring gaps

```bash
devdiff compliance check --framework owasp
```

---

## Applying Multiple Frameworks

```bash
# Check against multiple frameworks at once
devdiff compliance check --framework gdpr,soc2,owasp

# Apply all frameworks permanently
devdiff compliance apply gdpr hipaa soc2
```

---

## CI/CD Integration

```yaml
# .github/workflows/compliance.yml
- name: Compliance Check
  run: |
    devdiff compliance check \
      --framework gdpr,soc2 \
      --format json \
      --output compliance-report.json

    # Fail pipeline on violations
    devdiff compliance check --framework gdpr --fail-on violations
```

---

## Important Disclaimer

> DevDiff's compliance analysis is AI-assisted and is intended to **support** — not replace — qualified legal and compliance professionals. Always have your compliance team review flagged items. DevDiff does not provide legal advice.
