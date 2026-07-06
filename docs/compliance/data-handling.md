# Data Handling Compliance

DevDiff complies with industry-standard data handling and privacy regulations (GDPR, CCPA, HIPAA, SOC 2).

---

## 🔒 Regulatory Framework Mapping

### GDPR / CCPA Compliance

- **No telemetry:** DevDiff collects zero analytics, telemetry, or user usage metrics.
- **Local Cache:** All cache entries and local database states (such as audit logs and MVP queues) reside on the local workstation.

### SOC 2 & HIPAA

- **Data Isolation:** Workspace data does not transit through DevDiff-managed servers.
- **Redaction by Default:** Ingestion pipelines sanitize all inputs through the redaction engine before sending context to third-party endpoints.
