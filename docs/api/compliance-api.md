# Compliance API Reference

Utilities for applying and verifying compliance configurations.

## Import

```typescript
import {
  COMPLIANCE_FRAMEWORKS,
  applyCompliance,
  deepMerge,
} from "@eldrex/core";
```

## Functions

### `applyCompliance(frameworkId: string, config: DevDiffConfig): Promise<DevDiffConfig>`

Merges the specific framework configurations into the config object and returns it.

### `deepMerge(target: any, source: any): any`

Recursively merges nested objects.

## Constants

### `COMPLIANCE_FRAMEWORKS`

A map of supported compliance frameworks (GDPR, CCPA, HIPAA, etc.) with their jurisdiction info and default configurations.
