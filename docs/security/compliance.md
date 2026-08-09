# Compliance Frameworks & Regulatory Alignment

DevDiff includes built-in compliance scanning capabilities to analyze code diffs, staged changes, and codebase memory against **10 major global compliance frameworks**.

---

## 🎯 Supported Compliance Frameworks

```mermaid
flowchart TD
    Diff[Codebase Changes & Staged Diff] --> Engine[DevDiff Compliance Analyzer]

    subgraph Frameworks [10 Regulatory Framework Mappings]
      F1[GDPR - EU Data Privacy]
      F2[HIPAA - Health Data Security]
      F3[SOC 2 - Trust Services Criteria]
      F4[ISO 27001 - ISMS Standard]
      F5[FedRAMP - US Federal Security]
      F6[PCI-DSS - Payment Card Security]
      F7[NIST 800-53 - Security Controls]
      F8[CCPA - California Privacy]
      F9[OWASP Top 10 - Application Risks]
      F10[CIS Controls - Cyber Defense]
    end

    Engine --> Frameworks
    Frameworks --> Report[Compliance Audit Report & Risk Rating]

    style Report fill:#bbf,stroke:#333,stroke-width:2px
```

---

## 📋 Framework Mapping & Rule Matrix

| Framework        | Primary Focus Area          | Detection Rules & Patterns                                               |
| ---------------- | --------------------------- | ------------------------------------------------------------------------ |
| **GDPR**         | Personal Data & Privacy     | Unsanitized PII logging, unencrypted user storage, missing consent flags |
| **HIPAA**        | Protected Health Info (PHI) | Hardcoded patient identifiers, unencrypted health payload transmissions  |
| **SOC 2**        | Security & Availability     | Missing audit logs, unauthenticated routes, weak cryptography            |
| **ISO 27001**    | Information Security        | Hardcoded API keys, unvalidated inputs, missing error boundary isolation |
| **FedRAMP**      | Federal Cloud Security      | Non-FIPS cryptographic algorithms, unauthorized outbound connections     |
| **PCI-DSS**      | Cardholder Data             | Plaintext Primary Account Numbers (PAN), CVV storage in logs             |
| **NIST 800-53**  | Access Control & Integrity  | Excessive default privileges, missing session timeout parameters         |
| **CCPA**         | Consumer Privacy Rights     | Third-party data sharing endpoints without opt-out controls              |
| **OWASP Top 10** | Web App Vulnerabilities     | SQL injection, XSS, Broken Auth, SSRF, Insecure Deserialization          |
| **CIS Controls** | Inventory & Access          | Unrestricted CORS policies, weak TLS configurations, legacy dependencies |

---

## 💻 Running Compliance Scans

### CLI Compliance Scan

```bash
# Scan staged changes for GDPR & HIPAA violations
devdiff compliance scan --framework gdpr,hipaa

# Scan entire codebase memory against SOC 2 controls
devdiff compliance scan --framework soc2 --all
```

### Programmatic API Execution

```typescript
import { ComplianceEngine } from "@eldrex/core";

const report = await ComplianceEngine.scan({
  frameworks: ["gdpr", "hipaa", "soc2"],
  includeStaged: true,
});

console.log(`Found ${report.violations.length} compliance violations.`);
```
