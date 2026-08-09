# Data Handling & Regulatory Compliance Mapping

DevDiff is engineered under a **Local-First, Zero-Telemetry Data Handling Architecture**, satisfying strict enterprise compliance standards including **GDPR**, **CCPA**, **HIPAA**, **SOC 2 Type II**, and **ISO 27001**.

---

## 🔒 Framework Compliance Matrix

| Regulatory Framework | Compliance Control | DevDiff Architectural Implementation |
|---|---|---|
| **GDPR (EU 2016/679)** | Article 25 (Privacy by Design) | 100% local processing; zero personal telemetry or tracking cookies |
| **CCPA / CPRA** | Right to Opt-Out & Minimal Collection | No personal data collected, stored, or sold |
| **HIPAA Security Rule** | § 164.312 (Technical Safeguards) | `RedactionEngineV2` redacts PHI/ePHI credential patterns before LLM dispatch |
| **SOC 2 Type II** | Trust Services Criteria (Security & Confidentiality) | Whitelist-only NetworkGuard firewall; zero cloud data retention |
| **ISO / IEC 27001** | A.8.24 (Use of Cryptography) | TLS 1.3 encryption enforced for all cloud API endpoints |

---

## 🛡️ Data Redaction & Sanitization Pipeline

Before any code diff leaves local workstation memory:
1. `RedactionEngineV2` scans diffs against 30+ credential regex patterns.
2. Credentials and API keys are replaced with `[REDACTED]`.
3. `PromptSanitizer` strips Unicode Tag Blocks and prompt injection vectors.
