# Compliance Frameworks

DevDiff helps organizations enforce security, privacy, and sovereignty policies across enterprise teams through declarative compliance profiles.

---

## 🔒 Supported Frameworks

Use the compliance engine to immediately audit and enforce policies for the following regulatory frameworks:

| Framework ID | Regulation / Standard | Target Jurisdiction | Enforced Policies & Config Changes |
| :--- | :--- | :--- | :--- |
| **gdpr** | General Data Protection Regulation | European Union / EEA | Forces local-only AI execution (`localOnly: true`), disables outbound network telemetries, sets strict token sanitization. |
| **ccpa** | California Consumer Privacy Act | United States (CA) | Zero-telemetry caching, local audit trail logging, and automatic workspace data-minimization. |
| **hipaa** | Health Insurance Portability & Accountability Act | United States (Healthcare) | Enforces strict secret and credential redaction, locks audit logs locally with AES encryption. |
| **soc2** | SOC 2 Type II Security Trust | Global (Service Orgs) | Enables full network access logging, file access history trails, and third-party plugin checksum checks. |
| **fedramp** | FedRAMP Security Standards | United States (Gov/Cloud) | Forces FIPS-compliant local cryptos, locks out non-whitelisted shell execution commands, and restricts network scopes. |
| **iso27001** | ISO/IEC 27001 Information Security | Global (Enterprise) | Configures log retention controls, locks file scanning scopes, and enables periodic config auditing. |
| **pipeda** | Personal Information Protection Act | Canada | Strict data minimization, local data sovereign hosting, and no external log transfers. |
| **lgpd** | Lei Geral de Proteção de Dados | Brazil | Local AI fallback priority, zero third-party token transit caching. |
| **pdpa** | Personal Data Protection Act | Singapore / APAC | Data minimization, local-only routing for PII structures, zero trace retention. |
| **australia_privacy**| Australian Privacy Principles (APP) | Australia | Enforces strict regional data sovereign boundaries, disabling cloud model fallbacks. |

---

## Enforcing a Framework Configuration

To apply a compliance profile:

```bash
# Preview what changes the framework will make to .devdiff.config.js
devdiff compliance apply --framework gdpr --dry-run

# Apply the framework configuration to your project config
devdiff compliance apply --framework gdpr
```

This command updates your root `.devdiff.config.js` to enforce the corresponding security, privacy, and routing boundaries automatically.

---

## Validating Compliance Status

Check if your current workspace configuration complies with active profiles:

```bash
# Check compliance status
devdiff compliance status

# Run full configuration validation
devdiff compliance validate --frameworks all
```
