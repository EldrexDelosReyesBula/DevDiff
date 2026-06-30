# Compliance Frameworks

DevDiff v1.0.1 "Sentinel" provides built-in configurations to satisfy international and national data compliance frameworks.

## Supported Frameworks

- **GDPR**: European Union General Data Protection Regulation. Restricts cloud AI transfers and limits audit logs to 30 days.
- **CCPA/CPRA**: California Consumer Privacy Act. Configures opt-out mechanisms and data inventories.
- **HIPAA**: US Health Insurance Portability and Accountability Act. Enables encryption-at-rest (AES-256-GCM), PHI detection, and automatic redaction.
- **SOC 2 Type II**: Restrictive compliance checks, metrics exports, and continuous health monitoring.
- **FedRAMP**: US Federal Government compliance. Validates FIPS-validated crypto and enforces strict boundaries.

## CLI Usage

### List Supported Frameworks

```bash
npx devdiff compliance list
```

### Apply a Framework

To merge a framework's properties into your configuration:

```bash
npx devdiff compliance apply --framework gdpr
npx devdiff compliance apply --framework hipaa
```

### Check Compliance Status

```bash
npx devdiff compliance status
```

### Validate Configuration

Validate active configuration against multiple frameworks:

```bash
npx devdiff compliance validate --frameworks gdpr,soc2,iso27001
```

### Generate Audit-Ready Report

```bash
npx devdiff compliance report --format pdf --output compliance-report.pdf
```
