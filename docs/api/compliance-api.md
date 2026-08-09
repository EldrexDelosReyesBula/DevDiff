# Compliance API Reference (`@eldrex/core`)

The Compliance API provides functions for applying, validating, and deep-merging regulatory security rules (GDPR, CCPA, HIPAA, SOC 2, ISO 27001).

---

## 📦 Import Syntax

```typescript
import {
  COMPLIANCE_FRAMEWORKS,
  applyCompliance,
  verifyComplianceRules,
  deepMerge
} from "@eldrex/core";
```

---

## 🛠️ Function Specifications

### `applyCompliance(frameworkId: string, config: DevDiffConfig): Promise<DevDiffConfig>`

Applies predefined regulatory rules to a DevDiff configuration object.

```typescript
const updatedConfig = await applyCompliance("GDPR", currentConfig);
```

### `verifyComplianceRules(diffContent: string, framework: string): ComplianceCheckResult`

Scans diff content for regulatory compliance violations.

```typescript
const report = verifyComplianceRules(stagedDiff, "SOC2");
console.log("Compliance Status:", report.passed);
```
