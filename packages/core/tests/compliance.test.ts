import { describe, it, expect } from "vitest";
import {
  COMPLIANCE_FRAMEWORKS,
  applyCompliance,
  deepMerge,
} from "../src/compliance/frameworks";
import { DevDiffConfig } from "../src/config/schema";

describe("Compliance Frameworks", () => {
  it("has all 10 frameworks defined", () => {
    const ids = Object.keys(COMPLIANCE_FRAMEWORKS);
    expect(ids).toContain("gdpr");
    expect(ids).toContain("ccpa");
    expect(ids).toContain("hipaa");
    expect(ids).toContain("soc2");
    expect(ids).toContain("fedramp");
    expect(ids).toContain("iso27001");
    expect(ids).toContain("pipeda");
    expect(ids).toContain("lgpd");
    expect(ids).toContain("pdpa");
    expect(ids).toContain("australia_privacy");
    expect(ids.length).toBe(10);
  });

  it("deepMerge recursively merges objects", () => {
    const target = {
      ai: {
        routing: {
          strategy: "priority",
          localOnly: true,
        },
      },
      format: "markdown",
    };

    const source = {
      ai: {
        cloudProviders: "blocked",
      },
      privacy: {
        auditLogRetention: 30,
      },
    };

    const merged = deepMerge(target, source);
    expect(merged.ai.routing.strategy).toBe("priority");
    expect(merged.ai.cloudProviders).toBe("blocked");
    expect(merged.privacy.auditLogRetention).toBe(30);
    expect(merged.format).toBe("markdown");
  });

  it("applyCompliance applies autoConfig parameters to config object", async () => {
    const config: DevDiffConfig = {
      ai: {
        providers: [],
        routing: {
          strategy: "priority",
          complexityThreshold: 0.6,
          localOnly: true,
        },
      },
      exclude: [],
      cache: { enabled: true, path: "" },
      format: "markdown",
    };

    const updated = await applyCompliance("gdpr", config);
    expect(updated.privacy?.auditLogRetention).toBe(30);
    expect(updated.privacy?.autoDeleteAuditLogs).toBe(true);
    expect(updated.ai?.cloudProviders).toBe("blocked");
  });
});
